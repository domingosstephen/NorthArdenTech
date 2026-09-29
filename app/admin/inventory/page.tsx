import { db } from "@/lib/db";
import { families, variants, inventory, units } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import { StockAdjustForm } from "./StockAdjustForm";

export const metadata: Metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  // New-device stock (inventory table, condition = new)
  const newStock = await db
    .select({
      variantId: variants.id,
      sku: variants.sku,
      familyName: families.name,
      storageGb: variants.storageGb,
      condition: variants.condition,
      active: variants.active,
      onHand: inventory.onHand,
      reserved: inventory.reserved,
      available: sql<number>`(${inventory.onHand} - ${inventory.reserved})::int`,
    })
    .from(variants)
    .innerJoin(families, eq(families.id, variants.familyId))
    .leftJoin(inventory, eq(inventory.variantId, variants.id))
    .where(eq(variants.condition, "new"))
    .orderBy(families.generation, families.sort, variants.storageGb);

  // Pre-owned unit counts per variant
  const preownedCounts = await db
    .select({
      variantId: units.variantId,
      available: sql<number>`count(*) filter (where ${units.status} = 'available')::int`,
      reserved: sql<number>`count(*) filter (where ${units.status} = 'reserved')::int`,
      sold: sql<number>`count(*) filter (where ${units.status} = 'sold')::int`,
    })
    .from(units)
    .groupBy(units.variantId);

  const preownedMap = new Map(preownedCounts.map((r) => [r.variantId, r]));

  const preownedVariants = await db
    .select({
      variantId: variants.id,
      sku: variants.sku,
      familyName: families.name,
      storageGb: variants.storageGb,
      condition: variants.condition,
      batteryFloor: variants.batteryFloor,
      active: variants.active,
    })
    .from(variants)
    .innerJoin(families, eq(families.id, variants.familyId))
    .where(sql`${variants.condition} != 'new'`)
    .orderBy(families.generation, families.sort, variants.condition, variants.storageGb);

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-ink">Inventory</h1>
        <Link
          href="/admin/inventory/intake"
          className="rounded-[980px] bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-press transition-colors duration-[120ms]"
        >
          + Pre-owned intake
        </Link>
      </div>

      {/* New devices */}
      <section className="mb-8">
        <h2 className="text-[17px] font-semibold text-ink mb-3">New devices</h2>
        <div className="rounded-[16px] border border-line overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface border-b border-line text-left">
                {["SKU", "Family", "Storage", "On hand", "Reserved", "Available", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-ink-2 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {newStock.map((row) => {
                const avail = (row.onHand ?? 0) - (row.reserved ?? 0);
                const lowAlert = avail <= 3;
                return (
                  <tr key={row.variantId} className={row.active ? "" : "opacity-40"}>
                    <td className="px-4 py-2 font-mono text-[11px] text-ink-2">{row.sku}</td>
                    <td className="px-4 py-2 text-ink">{row.familyName}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-2">{row.storageGb} GB</td>
                    <td className="px-4 py-2 tabular-nums text-ink">{row.onHand ?? 0}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-2">{row.reserved ?? 0}</td>
                    <td className="px-4 py-2 tabular-nums font-semibold">
                      <span className={lowAlert ? "text-warn" : "text-ok"}>{avail}</span>
                    </td>
                    <td className="px-4 py-2">
                      <StockAdjustForm
                        variantId={row.variantId}
                        currentOnHand={row.onHand ?? 0}
                      />
                    </td>
                  </tr>
                );
              })}
              {newStock.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-2">
                    No new-device variants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pre-owned */}
      <section>
        <h2 className="text-[17px] font-semibold text-ink mb-3">Pre-owned units</h2>
        <div className="rounded-[16px] border border-line overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface border-b border-line text-left">
                {["SKU", "Family", "Grade", "Storage", "Battery floor", "Available", "Reserved", "Sold"].map((h) => (
                  <th key={h} className="px-4 py-3 text-ink-2 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {preownedVariants.map((row) => {
                const counts = preownedMap.get(row.variantId);
                const avail = counts?.available ?? 0;
                return (
                  <tr key={row.variantId} className={row.active ? "" : "opacity-40"}>
                    <td className="px-4 py-2 font-mono text-[11px] text-ink-2">{row.sku}</td>
                    <td className="px-4 py-2 text-ink">{row.familyName}</td>
                    <td className="px-4 py-2 capitalize text-ink">{row.condition}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-2">{row.storageGb} GB</td>
                    <td className="px-4 py-2 tabular-nums text-ink-2">
                      {row.batteryFloor ? `${row.batteryFloor}%+` : "—"}
                    </td>
                    <td className="px-4 py-2 tabular-nums font-semibold">
                      <span className={avail === 0 ? "text-ink-2" : avail <= 3 ? "text-warn" : "text-ok"}>
                        {avail}
                      </span>
                    </td>
                    <td className="px-4 py-2 tabular-nums text-ink-2">{counts?.reserved ?? 0}</td>
                    <td className="px-4 py-2 tabular-nums text-ink-2">{counts?.sold ?? 0}</td>
                  </tr>
                );
              })}
              {preownedVariants.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-ink-2">
                    No pre-owned variants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
