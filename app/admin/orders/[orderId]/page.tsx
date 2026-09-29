import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders, orderItems, shipments, refunds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { OrderActionPanel } from "./OrderActionPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>;
}): Promise<Metadata> {
  const { orderId } = await params;
  const [order] = await db
    .select({ number: orders.number })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  return { title: order ? `Order ${order.number}` : "Order" };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth();
  const role = (session?.user as Record<string, unknown> & { role?: string })?.role;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();

  const [items, orderShipments, orderRefunds] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
    db.select().from(shipments).where(eq(shipments.orderId, orderId)),
    db.select().from(refunds).where(eq(refunds.orderId, orderId)),
  ]);

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const addr = order.shippingAddress as Record<string, string> | null ?? {};
  const totalRefunded = orderRefunds.reduce((s, r) => s + r.amountCents, 0);

  const STATUS_COLOURS: Record<string, string> = {
    pending_payment: "text-ink-2 bg-surface",
    paid: "text-ok bg-[rgba(30,127,78,0.1)]",
    fulfilled: "text-ok bg-[rgba(30,127,78,0.1)]",
    shipped: "text-accent bg-[rgba(11,95,217,0.1)]",
    delivered: "text-accent bg-[rgba(11,95,217,0.1)]",
    refunded: "text-ink-2 bg-surface",
    partially_refunded: "text-warn bg-[rgba(161,92,0,0.1)]",
    canceled: "text-ink-2 bg-surface",
  };

  return (
    <div className="p-8 max-w-[1100px]">
      {/* Breadcrumb */}
      <nav className="text-[13px] text-ink-2 mb-6 flex items-center gap-2">
        <Link href="/admin/orders" className="hover:text-ink transition-colors">
          Orders
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{order.number}</span>
      </nav>

      <div className="flex items-start gap-8">
        {/* Left column — order info */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-semibold text-ink">{order.number}</h1>
            <span className={["rounded-[6px] px-2 py-0.5 text-[12px] font-medium capitalize", STATUS_COLOURS[order.status] ?? ""].join(" ")}>
              {order.status.replace("_", " ")}
            </span>
            {order.riskLevel !== "normal" && (
              <span className={["rounded-[6px] px-2 py-0.5 text-[12px] font-semibold capitalize", order.riskLevel === "highest" ? "text-[#B91C1C] bg-[#FFF2F2]" : "text-warn bg-[rgba(161,92,0,0.1)]"].join(" ")}>
                Risk: {order.riskLevel}
              </span>
            )}
          </div>
          <p className="text-[13px] text-ink-2">
            {new Date(order.createdAt).toLocaleString("en-US", {
              dateStyle: "medium", timeStyle: "short",
            })}
          </p>

          {/* Customer */}
          <section className="rounded-[16px] border border-line bg-surface p-5 space-y-2">
            <h2 className="text-[14px] font-semibold text-ink mb-3">Customer</h2>
            <p className="text-[14px] text-ink">{order.email}</p>
            {order.phone && <p className="text-[13px] text-ink-2">{order.phone}</p>}
            {addr.line1 && (
              <p className="text-[13px] text-ink-2 leading-relaxed">
                {addr.name && <>{addr.name}<br /></>}
                {addr.line1}<br />
                {addr.line2 && <>{addr.line2}<br /></>}
                {addr.city}, {addr.state} {addr.zip}
              </p>
            )}
          </section>

          {/* Items */}
          <section className="rounded-[16px] border border-line bg-surface p-5">
            <h2 className="text-[14px] font-semibold text-ink mb-4">Items</h2>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-start gap-4">
                  <div>
                    <p className="text-[14px] font-medium text-ink">{item.familyName}</p>
                    <p className="text-[12px] text-ink-2 capitalize">
                      {item.finish} · {item.storageGb} GB · {item.condition}
                      {item.batteryFloor ? ` · Battery ${item.batteryFloor}%+` : ""}
                    </p>
                    {item.unitId && (
                      <p className="text-[11px] font-mono text-ink-2 mt-0.5">Unit: {item.unitId}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-semibold text-ink tabular-nums">
                      {fmt(item.priceCents * item.qty)}
                    </p>
                    {item.qty > 1 && (
                      <p className="text-[12px] text-ink-2">Qty: {item.qty}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-line space-y-1.5 text-[13px]">
              {[
                ["Subtotal", fmt(order.subtotalCents)],
                ["Shipping", order.shippingCents === 0 ? "Free" : fmt(order.shippingCents)],
                ["Tax", fmt(order.taxCents)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-ink-2">{l}</span>
                  <span className="tabular-nums text-ink">{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-[15px] font-semibold text-ink pt-2 border-t border-line">
                <span>Total</span>
                <span className="tabular-nums">{fmt(order.totalCents)}</span>
              </div>
              {totalRefunded > 0 && (
                <div className="flex justify-between text-warn">
                  <span>Refunded</span>
                  <span className="tabular-nums">−{fmt(totalRefunded)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Shipments */}
          {orderShipments.length > 0 && (
            <section className="rounded-[16px] border border-line bg-surface p-5">
              <h2 className="text-[14px] font-semibold text-ink mb-3">Shipments</h2>
              <ul className="space-y-3">
                {orderShipments.map((s) => (
                  <li key={s.id} className="text-[13px] space-y-1">
                    <p className="font-medium text-ink">
                      {s.carrier} {s.service}
                    </p>
                    <p className="font-mono text-ink-2">{s.trackingNumber}</p>
                    {s.labelUrl && (
                      <a
                        href={s.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-press transition-colors"
                      >
                        Download label ↗
                      </a>
                    )}
                    {s.costCents && (
                      <p className="text-ink-2">Label cost: {fmt(s.costCents)}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Refunds */}
          {orderRefunds.length > 0 && (
            <section className="rounded-[16px] border border-line bg-surface p-5">
              <h2 className="text-[14px] font-semibold text-ink mb-3">Refunds</h2>
              <ul className="space-y-2">
                {orderRefunds.map((r) => (
                  <li key={r.id} className="text-[13px] flex justify-between">
                    <div>
                      <p className="text-ink">{r.reason ?? "No reason given"}</p>
                      <p className="font-mono text-ink-2 text-[11px]">{r.stripeRefundId}</p>
                    </div>
                    <p className="font-semibold text-warn tabular-nums">−{fmt(r.amountCents)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Stripe PI */}
          {order.stripePaymentIntentId && (
            <p className="text-[12px] font-mono text-ink-2">
              PI: {order.stripePaymentIntentId}
            </p>
          )}
        </div>

        {/* Right column — actions */}
        <div className="w-[280px] shrink-0">
          <OrderActionPanel
            orderId={order.id}
            status={order.status}
            riskLevel={order.riskLevel}
            totalCents={order.totalCents}
            totalRefundedCents={totalRefunded}
            hasShipment={orderShipments.length > 0}
            internalNotes={order.internalNotes ?? ""}
            staffRole={role}
          />
        </div>
      </div>
    </div>
  );
}
