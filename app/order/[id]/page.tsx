import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SpecRail } from "@/components/ui";

export const metadata: Metadata = {
  title: "Order Confirmation — NorthArdenTech",
  robots: { index: false },
};

// This page is also reached via Stripe's return_url:
// /order/confirm?pi=pi_xxx  → redirected to /order/[id] after webhook creates order
// Direct links use /order/[id] where id = order.number (e.g. NAT-10421)

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.number, decodeURIComponent(id)))
    .limit(1);

  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const addr = order.shippingAddress as Record<string, string> | null ?? {};

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-[720px] mx-auto px-6 py-16">
        {/* Header */}
        <h1 className="text-[40px] font-semibold tracking-[-0.02em] text-ink mb-2">
          Thank you. Your order is in.
        </h1>
        <p className="text-[17px] text-ink-2 mb-10">
          Order <span className="font-semibold text-ink">{order.number}</span>.
          A confirmation is on its way to{" "}
          <span className="font-medium text-ink">{order.email}</span>.
        </p>
        <p className="text-[15px] text-ink-2 mb-12">
          Ships{" "}
          <span className="text-ink">[DATE RANGE]</span>. We&apos;ll email tracking as soon as it leaves.
        </p>

        {/* Items */}
        <section className="rounded-[16px] border border-line bg-surface p-6 mb-8">
          <h2 className="text-[18px] font-semibold text-ink mb-5">Items ordered</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => {
              const specFacts = [
                {
                  label: "Condition",
                  value: item.condition.charAt(0).toUpperCase() + item.condition.slice(1),
                },
                { label: "Storage", value: `${item.storageGb} GB` },
                ...(item.batteryFloor
                  ? [{ label: "Battery", value: `${item.batteryFloor}%+` }]
                  : []),
              ];
              return (
                <li key={item.id} className="flex gap-4 py-4">
                  <div className="w-16 h-16 shrink-0 rounded-[10px] bg-bg flex items-center justify-center border border-line">
                    <span className="text-[10px] text-ink-2 text-center px-1 leading-tight">
                      {item.familyName.replace("iPhone ", "")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-ink">{item.familyName}</p>
                    <p className="text-[13px] text-ink-2 capitalize">{item.finish}</p>
                    <SpecRail facts={specFacts} condensed className="mt-1 text-[12px]" />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-semibold text-ink tabular-nums">
                      {fmt(item.priceCents * item.qty)}
                    </p>
                    {item.qty > 1 && (
                      <p className="text-[12px] text-ink-2">Qty: {item.qty}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Totals */}
          <div className="mt-5 pt-5 border-t border-line space-y-2 text-[14px]">
            {[
              ["Subtotal", fmt(order.subtotalCents)],
              [
                "Shipping",
                order.shippingCents === 0 ? "Free" : fmt(order.shippingCents),
              ],
              ["Tax", fmt(order.taxCents)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-ink-2">{label}</span>
                <span className="text-ink tabular-nums">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-[16px] font-semibold text-ink pt-2 border-t border-line">
              <span>Total</span>
              <span className="tabular-nums">{fmt(order.totalCents)}</span>
            </div>
          </div>
        </section>

        {/* Shipping address */}
        {addr.line1 && (
          <section className="rounded-[16px] border border-line bg-surface p-6 mb-8">
            <h2 className="text-[18px] font-semibold text-ink mb-3">Shipping to</h2>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              {addr.name && <>{addr.name}<br /></>}
              {addr.line1}<br />
              {addr.line2 && <>{addr.line2}<br /></>}
              {addr.city}, {addr.state} {addr.zip}
            </p>
          </section>
        )}

        {/* CTA */}
        <Link
          href="/iphone"
          className="inline-flex items-center gap-2 rounded-[980px] bg-accent px-6 py-3 text-[15px] font-semibold text-white hover:bg-accent-press transition-colors duration-[120ms]"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
