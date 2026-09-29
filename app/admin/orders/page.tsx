import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending",
  paid: "Paid",
  fulfilled: "Fulfilled",
  shipped: "Shipped",
  delivered: "Delivered",
  refunded: "Refunded",
  partially_refunded: "Part. refunded",
  canceled: "Canceled",
};

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

const RISK_COLOURS: Record<string, string> = {
  normal: "",
  elevated: "text-warn font-semibold",
  highest: "text-[#B91C1C] font-semibold",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const validStatuses = [
    "pending_payment", "paid", "fulfilled", "shipped",
    "delivered", "refunded", "partially_refunded", "canceled",
  ] as const;
  type Status = typeof validStatuses[number];

  const query = db
    .select({
      id: orders.id,
      number: orders.number,
      email: orders.email,
      status: orders.status,
      riskLevel: orders.riskLevel,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
      itemCount: sql<number>`count(${orderItems.id})::int`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  const rows = status && validStatuses.includes(status as Status)
    ? await query.where(eq(orders.status, status as Status))
    : await query;

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[24px] font-semibold text-ink">Orders</h1>
        <span className="text-[13px] text-ink-2">{rows.length} shown</span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/admin/orders"
          className={[
            "rounded-[980px] px-3 py-1 text-[13px] border transition-colors duration-[120ms]",
            !status ? "bg-ink text-white border-ink" : "border-line text-ink hover:border-ink-2",
          ].join(" ")}
        >
          All
        </Link>
        {["paid", "fulfilled", "shipped", "pending_payment", "refunded"].map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={[
              "rounded-[980px] px-3 py-1 text-[13px] border transition-colors duration-[120ms]",
              status === s ? "bg-ink text-white border-ink" : "border-line text-ink hover:border-ink-2",
            ].join(" ")}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-[16px] border border-line overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-surface border-b border-line text-left">
              {["Order", "Email", "Date", "Status", "Risk", "Items", "Total", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-ink-2 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr
                key={row.id}
                className={[
                  "hover:bg-surface/50 transition-colors duration-[80ms]",
                  row.riskLevel !== "normal" ? "bg-[#FFFBEB]" : "",
                ].join(" ")}
              >
                <td className="px-4 py-3 font-mono text-[12px] font-semibold text-ink">
                  {row.number}
                </td>
                <td className="px-4 py-3 text-ink max-w-[180px] truncate">{row.email}</td>
                <td className="px-4 py-3 text-ink-2 tabular-nums whitespace-nowrap">
                  {new Date(row.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={["inline-block rounded-[6px] px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_COLOURS[row.status] ?? ""].join(" ")}>
                    {STATUS_LABELS[row.status] ?? row.status}
                  </span>
                </td>
                <td className={["px-4 py-3 capitalize text-[12px]", RISK_COLOURS[row.riskLevel] ?? "text-ink-2"].join(" ")}>
                  {row.riskLevel === "normal" ? "" : row.riskLevel}
                </td>
                <td className="px-4 py-3 tabular-nums text-ink-2">{row.itemCount}</td>
                <td className="px-4 py-3 tabular-nums font-medium text-ink">
                  {fmt(row.totalCents)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${row.id}`}
                    className="text-accent hover:text-accent-press text-[13px] font-medium transition-colors duration-[120ms]"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-2">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
