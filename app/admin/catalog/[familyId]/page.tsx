import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { families, finishes, variants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import { FamilyStatusForm } from "./FamilyStatusForm";
import { VariantPriceTable } from "./VariantPriceTable";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ familyId: string }>;
}): Promise<Metadata> {
  const { familyId } = await params;
  const [family] = await db
    .select({ name: families.name })
    .from(families)
    .where(eq(families.id, familyId))
    .limit(1);
  return { title: family?.name ?? "Family" };
}

export default async function FamilyDetailPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;

  const [family] = await db
    .select()
    .from(families)
    .where(eq(families.id, familyId))
    .limit(1);

  if (!family) notFound();

  const [familyFinishes, familyVariants] = await Promise.all([
    db.select().from(finishes).where(eq(finishes.familyId, familyId)),
    db
      .select()
      .from(variants)
      .where(eq(variants.familyId, familyId))
      .orderBy(variants.condition, variants.storageGb),
  ]);

  return (
    <div className="p-8 max-w-[1000px]">
      {/* Breadcrumb */}
      <nav className="text-[13px] text-ink-2 mb-6 flex items-center gap-2">
        <Link href="/admin/catalog" className="hover:text-ink transition-colors">
          Catalog
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{family.name}</span>
      </nav>

      <h1 className="text-[24px] font-semibold text-ink mb-1">{family.name}</h1>
      <p className="text-[13px] text-ink-2 mb-8">
        Gen {family.generation} · {family.tier} ·{" "}
        <code className="font-mono text-[12px]">{family.slug}</code>
      </p>

      {/* Status */}
      <section className="rounded-[16px] border border-line bg-surface p-5 mb-6">
        <h2 className="text-[16px] font-semibold text-ink mb-4">Status</h2>
        <FamilyStatusForm familyId={family.id} currentStatus={family.status} />
      </section>

      {/* Finishes */}
      <section className="rounded-[16px] border border-line bg-surface p-5 mb-6">
        <h2 className="text-[16px] font-semibold text-ink mb-4">
          Finishes{" "}
          <span className="font-normal text-ink-2">({familyFinishes.length})</span>
        </h2>
        {familyFinishes.length === 0 ? (
          <p className="text-[14px] text-ink-2">No finishes yet — populate via seed or admin API.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {familyFinishes.map((f) => (
              <div key={f.id} className="flex items-center gap-2 bg-bg rounded-[10px] border border-line px-3 py-2">
                <span
                  className="w-4 h-4 rounded-full border border-line shrink-0"
                  style={{ background: f.swatchHex }}
                  aria-label={f.name}
                />
                <span className="text-[13px] text-ink">{f.name}</span>
                <span className="text-[11px] text-ink-2 font-mono">{f.swatchHex}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Specs */}
      <section className="rounded-[16px] border border-line bg-surface p-5 mb-6">
        <h2 className="text-[16px] font-semibold text-ink mb-4">Specs (jsonb)</h2>
        <pre className="text-[12px] font-mono text-ink-2 bg-bg rounded-[8px] border border-line p-4 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(family.specs, null, 2)}
        </pre>
        <p className="text-[12px] text-ink-2 mt-2">
          Edit via seed script or direct DB update. Spec values must come from a verified source.
        </p>
      </section>

      {/* Variants / Prices */}
      <section className="rounded-[16px] border border-line bg-surface p-5">
        <h2 className="text-[16px] font-semibold text-ink mb-1">
          Variants &amp; prices{" "}
          <span className="font-normal text-ink-2">({familyVariants.length})</span>
        </h2>
        <p className="text-[13px] text-ink-2 mb-4">
          Prices are in cents. Changes take effect immediately.
        </p>
        <VariantPriceTable variants={familyVariants} />
      </section>
    </div>
  );
}
