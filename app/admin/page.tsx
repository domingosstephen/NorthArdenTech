import { db } from "@/lib/db";
import { orders, variants, inventory } from "@/lib/db/schema";
import { eq, gte, and, lt, sql, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);

  // Today's orders
  const todayOrders = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(total_cents), 0)::int`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, todayStart),
        lt(orders.createdAt, tomorrowStart)
      )
    );

  const todayCount = todayOrders[0]?.count ?? 0;
  const todayRevenue = todayOrders[0]?.revenue ?? 0;

  // Orders in Review queue (elevated/highest risk + paid status)
  const reviewOrders = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "paid"),
        inArray(orders.riskLevel, ["elevated", "highest"])
      )
    );
  const reviewCount = reviewOrders[0]?.count ?? 0;

  // Low stock: active new variants with on_hand - reserved <= 3
  const lowStock = await db
    .select({
      variantId: inventory.variantId,
      available: sql<number>`(on_hand - reserved)::int`,
    })
    .from(inventory)
    .where(sql`(on_hand - reserved) <= 3 and (on_hand - reserved) >= 0`);

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const stats = [
    { label: "Orders today", value: String(todayCount), href: "/admin/orders" },
    { label: "Revenue today", value: fmt(todayRevenue), href: "/admin/orders" },
    { label: "In review queue", value: String(reviewCount), href: "/admin/orders", alert: reviewCount > 0 },
    { label: "Low stock variants", value: String(lowStock.length), href: "/admin/inventory", alert: lowStock.length > 0 },
  ];

  return (
    <div className="p-8 max-w-[1200px]">
      <h1 className="text-[24px] font-semibold text-ink mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-[12px] border border-line bg-surface p-5 hover:border-accent transition-colors duration-[120ms] group"
          >
            <p className="text-[13px] text-ink-2 mb-1">{s.label}</p>
            <p className={["text-[28px] font-semibold tabular-nums", s.alert ? "text-[#B91C1C]" : "text-ink"].join(" ")}>
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Review queue alert */}
      {reviewCount > 0 && (
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FFF2F2] px-5 py-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-[#B91C1C]">
              {reviewCount} order{reviewCount !== 1 ? "s" : ""} need{reviewCount === 1 ? "s" : ""} review
            </p>
            <p className="text-[13px] text-[#B91C1C]/80">
              Stripe Radar flagged elevated or highest risk. Approve before fulfilling.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="shrink-0 rounded-[980px] bg-[#B91C1C] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#991B1B] transition-colors duration-[120ms]"
          >
            Review orders
          </Link>
        </div>
      )}

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-[#92400E]">
              {lowStock.length} variant{lowStock.length !== 1 ? "s" : ""} running low
            </p>
            <p className="text-[13px] text-[#92400E]/80">
              3 or fewer units available.
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="shrink-0 rounded-[980px] bg-[#D97706] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#B45309] transition-colors duration-[120ms]"
          >
            View inventory
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Manage catalog", sub: "Families, finishes, variants, prices", href: "/admin/catalog" },
          { label: "Inventory", sub: "Stock levels · Pre-owned intake", href: "/admin/inventory" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[12px] border border-line bg-surface p-5 hover:border-accent transition-colors duration-[120ms]"
          >
            <p className="text-[15px] font-semibold text-ink">{card.label}</p>
            <p className="text-[13px] text-ink-2 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
