import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  reservations,
  variants,
  inventory,
  units,
} from "@/lib/db/schema";
import { eq, inArray, and, sql } from "drizzle-orm";
import { sendOrderConfirmation } from "@/lib/email/sendOrderConfirmation";
import type Stripe from "stripe";

// Disable body parsing — we need the raw buffer for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        // Unhandled event type — acknowledge and ignore
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  // NAT-[5 digit random]
  const num = 10000 + Math.floor(Math.random() * 89999);
  return `NAT-${num}`;
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  // Idempotency check — skip if order already created for this PI
  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, pi.id))
    .limit(1);

  if (existing.length) return;

  const reservationIds = (pi.metadata?.reservationIds ?? "")
    .split(",")
    .filter(Boolean);

  if (!reservationIds.length) {
    console.error("payment_intent.succeeded: no reservationIds in metadata", pi.id);
    return;
  }

  // Load reservations
  const resRows = await db
    .select()
    .from(reservations)
    .where(inArray(reservations.id, reservationIds));

  // Build order items from variant snapshots
  const variantIds = resRows
    .map((r) => r.variantId)
    .filter((id): id is string => id !== null);

  const dbVariants = await db
    .select({
      id: variants.id,
      familyId: variants.familyId,
      storageGb: variants.storageGb,
      condition: variants.condition,
      priceCents: variants.priceCents,
      batteryFloor: variants.batteryFloor,
      finishId: variants.finishId,
    })
    .from(variants)
    .where(inArray(variants.id, variantIds));

  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

  // Determine shipping address from Stripe shipping object
  const addr = pi.shipping?.address;
  const shippingAddress = addr
    ? {
        name: pi.shipping?.name ?? "",
        line1: addr.line1 ?? "",
        line2: addr.line2 ?? "",
        city: addr.city ?? "",
        state: addr.state ?? "",
        zip: addr.postal_code ?? "",
        country: addr.country ?? "US",
      }
    : {};

  const riskLevel =
    (pi as Stripe.PaymentIntent & { outcome?: { risk_level?: string } }).outcome
      ?.risk_level ?? "normal";

  // Create order
  let orderNumber = generateOrderNumber();
  // Retry once on collision (extremely unlikely)
  const collision = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.number, orderNumber))
    .limit(1);
  if (collision.length) orderNumber = generateOrderNumber();

  const [order] = await db
    .insert(orders)
    .values({
      number: orderNumber,
      email: pi.receipt_email ?? pi.metadata?.email ?? "unknown@checkout.local",
      shippingAddress,
      status: riskLevel === "highest" || riskLevel === "elevated" ? "pending_payment" : "paid",
      subtotalCents: pi.amount,
      taxCents: 0,
      shippingCents: 0,
      totalCents: pi.amount,
      stripePaymentIntentId: pi.id,
      riskLevel,
    })
    .returning();

  // Create order items
  for (const res of resRows) {
    if (!res.variantId) continue;
    const v = variantMap.get(res.variantId);
    if (!v) continue;

    await db.insert(orderItems).values({
      orderId: order.id,
      variantId: res.variantId,
      unitId: res.unitId ?? null,
      familyName: "[FAMILY_NAME]", // Will be enriched in admin / future join
      finish: "[FINISH]",
      storageGb: v.storageGb,
      condition: v.condition,
      batteryFloor: v.batteryFloor ?? null,
      priceCents: v.priceCents,
      qty: res.qty,
    });

    // Convert reservation to sale
    if (res.unitId) {
      await db
        .update(units)
        .set({ status: "sold", updatedAt: new Date() })
        .where(eq(units.id, res.unitId));
    } else if (res.variantId) {
      // Decrement on_hand and reserved atomically using Drizzle sql tag
      await db
        .update(inventory)
        .set({
          onHand: sql`${inventory.onHand} - ${res.qty}`,
          reserved: sql`GREATEST(${inventory.reserved} - ${res.qty}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, res.variantId));
    }

    // Mark reservation released (fulfilled)
    await db
      .update(reservations)
      .set({ released: true })
      .where(eq(reservations.id, res.id));
  }

  // Send confirmation email (fire-and-forget, don't block webhook response)
  if (order.email && order.email !== "pending@checkout.local") {
    sendOrderConfirmation(order).catch((err) =>
      console.error("Failed to send confirmation email:", err)
    );
  }
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const reservationIds = (pi.metadata?.reservationIds ?? "")
    .split(",")
    .filter(Boolean);

  if (!reservationIds.length) return;

  const resRows = await db
    .select()
    .from(reservations)
    .where(
      and(
        inArray(reservations.id, reservationIds),
        eq(reservations.released, false)
      )
    );

  for (const res of resRows) {
    // Release unit back to available
    if (res.unitId) {
      await db
        .update(units)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(units.id, res.unitId));
    }

    // Return inventory reservation count
    if (res.variantId && !res.unitId) {
      await db
        .update(inventory)
        .set({
          reserved: sql`GREATEST(${inventory.reserved} - ${res.qty}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, res.variantId));
    }

    await db
      .update(reservations)
      .set({ released: true })
      .where(eq(reservations.id, res.id));
  }
}
