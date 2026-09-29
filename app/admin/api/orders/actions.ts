"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { orders, orderItems, shipments, refunds, auditLog, staff } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { buyLabel } from "@/lib/shippo";
import { sendOrderShipped, sendOrderConfirmation } from "@/lib/email/sendOrderConfirmation";
import { revalidatePath } from "next/cache";

async function requireStaff() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function getStaffRecord(email: string) {
  const [s] = await db
    .select({ id: staff.id, role: staff.role })
    .from(staff)
    .where(eq(staff.email, email.toLowerCase()))
    .limit(1);
  return s ?? null;
}

async function logAction(
  staffId: string | null,
  action: string,
  entityId: string,
  payload?: Record<string, unknown>
) {
  await db.insert(auditLog).values({
    staffId,
    action,
    entityType: "order",
    entityId,
    payload: payload ?? null,
  });
}

// ── Approve review queue order ────────────────────────────────────────────────

export async function approveOrder(orderId: string) {
  const user = await requireStaff();
  const s = await getStaffRecord(user.email!);

  const [order] = await db
    .select({ id: orders.id, status: orders.status, riskLevel: orders.riskLevel })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) throw new Error("Order not found");
  if (!["elevated", "highest"].includes(order.riskLevel)) {
    throw new Error("Order is not in the review queue");
  }

  await db
    .update(orders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await logAction(s?.id ?? null, "approve_review", orderId, {
    riskLevel: order.riskLevel,
    prevStatus: order.status,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// ── Buy Shippo label ──────────────────────────────────────────────────────────

export async function purchaseLabel(orderId: string) {
  const user = await requireStaff();
  const s = await getStaffRecord(user.email!);

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");
  if (!["paid", "fulfilled"].includes(order.status)) {
    throw new Error("Order must be paid before purchasing a label");
  }

  const addr = order.shippingAddress as Record<string, string> | null ?? {};
  const items = await db
    .select({ priceCents: orderItems.priceCents, qty: orderItems.qty })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const declaredValueCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.qty,
    0
  );

  const label = await buyLabel({
    toName: addr.name ?? order.email,
    toStreet1: addr.line1 ?? "",
    toStreet2: addr.line2,
    toCity: addr.city ?? "",
    toState: addr.state ?? "",
    toZip: addr.zip ?? "",
    declaredValueCents,
  });

  const [shipment] = await db
    .insert(shipments)
    .values({
      orderId,
      carrier: label.carrier,
      service: label.service,
      trackingNumber: label.trackingNumber,
      labelUrl: label.labelUrl,
      costCents: label.costCents,
    })
    .returning();

  await db
    .update(orders)
    .set({ status: "fulfilled", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await logAction(s?.id ?? null, "purchase_label", orderId, {
    carrier: label.carrier,
    trackingNumber: label.trackingNumber,
    costCents: label.costCents,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { shipmentId: shipment.id, trackingNumber: label.trackingNumber, labelUrl: label.labelUrl };
}

// ── Mark shipped ──────────────────────────────────────────────────────────────

export async function markShipped(orderId: string, trackingNumber?: string) {
  const user = await requireStaff();
  const s = await getStaffRecord(user.email!);

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  await db
    .update(orders)
    .set({ status: "shipped", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await logAction(s?.id ?? null, "mark_shipped", orderId, { trackingNumber });

  // Send tracking email if we have a shipment with tracking
  const [shipment] = await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, orderId))
    .limit(1);

  if (shipment?.trackingNumber) {
    const trackingNum = trackingNumber ?? shipment.trackingNumber;
    const carrier = shipment.carrier ?? "Carrier";
    const trackingUrl = buildTrackingUrl(carrier, trackingNum);
    sendOrderShipped(order, {
      carrier,
      trackingNumber: trackingNum,
      trackingUrl,
    }).catch(console.error);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// ── Refund ────────────────────────────────────────────────────────────────────

export async function refundOrder(
  orderId: string,
  amountCents: number,
  reason: string
) {
  const user = await requireStaff();
  const s = await getStaffRecord(user.email!);

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Invalid refund amount");
  }

  const [order] = await db
    .select({
      id: orders.id,
      totalCents: orders.totalCents,
      stripePaymentIntentId: orders.stripePaymentIntentId,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) throw new Error("Order not found");
  if (!order.stripePaymentIntentId) throw new Error("No payment intent on this order");
  if (amountCents > order.totalCents) throw new Error("Refund exceeds order total");

  const stripeRefund = await stripe.refunds.create(
    {
      payment_intent: order.stripePaymentIntentId,
      amount: amountCents,
      reason: "requested_by_customer",
    },
    { idempotencyKey: `refund-${orderId}-${amountCents}-${Date.now()}` }
  );

  await db.insert(refunds).values({
    orderId,
    amountCents,
    reason,
    stripeRefundId: stripeRefund.id,
    staffId: s?.id ?? null,
  });

  const isFullRefund = amountCents >= order.totalCents;
  await db
    .update(orders)
    .set({
      status: isFullRefund ? "refunded" : "partially_refunded",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  await logAction(s?.id ?? null, isFullRefund ? "full_refund" : "partial_refund", orderId, {
    amountCents,
    reason,
    stripeRefundId: stripeRefund.id,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// ── Resend confirmation email ─────────────────────────────────────────────────

export async function resendConfirmation(orderId: string) {
  const user = await requireStaff();
  const s = await getStaffRecord(user.email!);

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  await sendOrderConfirmation(order, items);

  await logAction(s?.id ?? null, "resend_confirmation", orderId);
}

// ── Internal note ─────────────────────────────────────────────────────────────

export async function updateInternalNote(orderId: string, note: string) {
  const user = await requireStaff();
  const s = await getStaffRecord(user.email!);

  await db
    .update(orders)
    .set({ internalNotes: note.trim() || null, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await logAction(s?.id ?? null, "update_note", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
}

// ── Helper ────────────────────────────────────────────────────────────────────

function buildTrackingUrl(carrier: string, tracking: string): string {
  const c = carrier.toUpperCase();
  if (c.includes("USPS")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`;
  if (c.includes("UPS")) return `https://www.ups.com/track?tracknum=${tracking}`;
  if (c.includes("FEDEX")) return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`;
  return `https://www.google.com/search?q=${encodeURIComponent(tracking)}`;
}
