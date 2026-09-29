import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  variants,
  inventory,
  units,
  reservations,
  carts,
} from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq, and, gt, inArray } from "drizzle-orm";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CartLineInput {
  variantId: string;
  qty: number;
}

interface CheckoutBody {
  lines: CartLineInput[];
  email: string;
  /** Full shipping address for Stripe Tax calculation */
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

// ── POST /api/checkout ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { lines, email, shippingAddress } = body;

  if (!lines?.length || !email) {
    return NextResponse.json({ error: "lines and email are required." }, { status: 400 });
  }

  // ── 1. Validate variants and fetch server-side prices ──────────────────────

  const variantIds = lines.map((l) => l.variantId);
  const dbVariants = await db
    .select()
    .from(variants)
    .where(and(inArray(variants.id, variantIds), eq(variants.active, true)));

  if (dbVariants.length !== lines.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 409 }
    );
  }

  // ── 2. Check and reserve stock ─────────────────────────────────────────────

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  const createdReservations: string[] = [];

  for (const line of lines) {
    const variant = dbVariants.find((v) => v.id === line.variantId)!;
    const isPreowned = variant.condition !== "new";

    if (isPreowned) {
      // Reserve a specific unit
      const [unit] = await db
        .select({ id: units.id })
        .from(units)
        .where(
          and(
            eq(units.variantId, line.variantId),
            eq(units.status, "available")
          )
        )
        .limit(1);

      if (!unit) {
        // Roll back reservations already made this request
        if (createdReservations.length) {
          await db
            .update(reservations)
            .set({ released: true })
            .where(inArray(reservations.id, createdReservations));
        }
        return NextResponse.json(
          { error: `${variant.sku} is out of stock.` },
          { status: 409 }
        );
      }

      // Mark unit reserved
      await db
        .update(units)
        .set({ status: "reserved", updatedAt: new Date() })
        .where(eq(units.id, unit.id));

      const [res] = await db
        .insert(reservations)
        .values({
          variantId: line.variantId,
          unitId: unit.id,
          qty: 1,
          expiresAt,
        })
        .returning({ id: reservations.id });
      createdReservations.push(res.id);
    } else {
      // Reserve from inventory count
      const [inv] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.variantId, line.variantId));

      const available = inv ? inv.onHand - inv.reserved : 0;
      if (available < line.qty) {
        if (createdReservations.length) {
          await db
            .update(reservations)
            .set({ released: true })
            .where(inArray(reservations.id, createdReservations));
        }
        return NextResponse.json(
          { error: `${variant.sku} does not have enough stock.` },
          { status: 409 }
        );
      }

      await db
        .update(inventory)
        .set({ reserved: inv.reserved + line.qty, updatedAt: new Date() })
        .where(eq(inventory.variantId, line.variantId));

      const [res] = await db
        .insert(reservations)
        .values({
          variantId: line.variantId,
          qty: line.qty,
          expiresAt,
        })
        .returning({ id: reservations.id });
      createdReservations.push(res.id);
    }
  }

  // ── 3. Compute amount server-side ──────────────────────────────────────────

  const subtotalCents = lines.reduce((sum, line) => {
    const v = dbVariants.find((v) => v.id === line.variantId)!;
    return sum + v.priceCents * line.qty;
  }, 0);

  // ── 4. Create Stripe PaymentIntent ─────────────────────────────────────────

  const idempotencyKey = `checkout-${createdReservations.sort().join("-")}`;

  const paymentIntentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
    amount: subtotalCents, // Tax added client-side preview; final tax recorded in webhook
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    receipt_email: email,
    metadata: {
      reservationIds: createdReservations.join(","),
      variantIds: variantIds.join(","),
    },
  };

  if (shippingAddress) {
    paymentIntentParams.shipping = {
      name: email,
      address: {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 ?? "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: shippingAddress.country || "US",
      },
    };
  }

  const paymentIntent = await stripe.paymentIntents.create(
    paymentIntentParams,
    { idempotencyKey }
  );

  // Persist the PI id back to each reservation row for webhook lookup
  await db
    .update(reservations)
    .set({ cartId: null }) // cartId is nullable; we use metadata for lookup
    .where(inArray(reservations.id, createdReservations));

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    subtotalCents,
  });
}
