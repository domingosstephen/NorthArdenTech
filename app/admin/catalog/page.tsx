import { db } from "@/lib/db";
import { families, variants } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Catalog" };
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const rows = await db
    .select({
      id: families.id,
      slug: families.slug,
      name: families.name,
      generation: families.generation,
      tier: families.tier,
      status: families.status,
      variantCount: sql<number>`count(${variants.id})::int`,
    })
    .from(families)
    .leftJoin(variants, eq(variants.familyId, families.id))
    .groupBy(families.id)
    .orderBy(families.generation, families.sort);

  const statusBadge: Record<string, string> = {
    current: "text-ok bg-[rgba(30,127,78,0.1)]",
    preorder: "text-warn bg-[rgba(161,92,0,0.1)]",
    discontinued: "text-ink-2 bg-surface",
  };

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-ink">Catalog</h1>
        <p className="text-[13px] text-ink-2">{rows.length} families</p>
      </div>

      <div className="rounded-[16px] border border-line overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-surface border-b border-line text-left">
              <th className="px-4 py-3 font-semibold text-ink-2 font-normal">Family</th>
              <th className="px-4 py-3 font-semibold text-ink-2 font-normal">Gen</th>
              <th className="px-4 py-3 font-semibold text-ink-2 font-normal">Tier</th>
              <th className="px-4 py-3 font-semibold text-ink-2 font-normal">Status</th>
              <th className="px-4 py-3 font-semibold text-ink-2 font-normal text-right">Variants</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface/50 transition-colors duration-[80ms]">
                <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                <td className="px-4 py-3 text-ink-2">{row.generation}</td>
                <td className="px-4 py-3 text-ink-2 capitalize">{row.tier}</td>
                <td className="px-4 py-3">
                  <span className={["inline-block rounded-[6px] px-2 py-0.5 text-[12px] font-medium capitalize", statusBadge[row.status] ?? ""].join(" ")}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-ink-2 tabular-nums">{row.variantCount}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/catalog/${row.id}`}
                    className="text-accent hover:text-accent-press text-[13px] font-medium transition-colors duration-[120ms]"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-2 text-[14px]">
                  No families seeded yet.{" "}
                  <Link href="/admin" className="text-accent">
                    Run the seed script
                  </Link>{" "}
                  to populate the catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
