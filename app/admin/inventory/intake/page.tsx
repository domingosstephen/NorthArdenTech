import { db } from "@/lib/db";
import { families, variants } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { UnitIntakeForm } from "./UnitIntakeForm";

export const metadata: Metadata = { title: "Pre-owned intake" };
export const dynamic = "force-dynamic";

export default async function UnitIntakePage() {
  // Only pre-owned variants
  const preownedVariants = await db
    .select({
      id: variants.id,
      sku: variants.sku,
      familyName: families.name,
      storageGb: variants.storageGb,
      condition: variants.condition,
      batteryFloor: variants.batteryFloor,
    })
    .from(variants)
    .innerJoin(families, eq(families.id, variants.familyId))
    .where(sql`${variants.condition} != 'new' and ${variants.active} = true`)
    .orderBy(families.generation, families.sort, variants.condition, variants.storageGb);

  return (
    <div className="p-8 max-w-[640px]">
      <nav className="text-[13px] text-ink-2 mb-6 flex items-center gap-2">
        <Link href="/admin/inventory" className="hover:text-ink transition-colors">
          Inventory
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Pre-owned intake</span>
      </nav>

      <h1 className="text-[24px] font-semibold text-ink mb-1">Pre-owned intake</h1>
      <p className="text-[14px] text-ink-2 mb-8">
        Add a single inspected unit. Each pre-owned phone is tracked individually.
        IMEI is stored encrypted and never displayed in the UI.
      </p>

      <UnitIntakeForm variants={preownedVariants} />
    </div>
  );
}
