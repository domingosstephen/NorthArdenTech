"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { inventory, units, variants, auditLog, staff } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encryptImei } from "@/lib/crypto/imei";

async function requireStaff() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function getStaffId(email: string): Promise<string | null> {
  const [s] = await db
    .select({ id: staff.id })
    .from(staff)
    .where(eq(staff.email, email.toLowerCase()))
    .limit(1);
  return s?.id ?? null;
}

export async function setStockOnHand(variantId: string, onHand: number) {
  const user = await requireStaff();

  if (!Number.isInteger(onHand) || onHand < 0) throw new Error("Invalid quantity");

  // Upsert inventory row
  const existing = await db
    .select({ id: inventory.id, reserved: inventory.reserved })
    .from(inventory)
    .where(eq(inventory.variantId, variantId))
    .limit(1);

  if (existing.length) {
    await db
      .update(inventory)
      .set({ onHand, updatedAt: new Date() })
      .where(eq(inventory.variantId, variantId));
  } else {
    await db.insert(inventory).values({ variantId, onHand, reserved: 0 });
  }

  const staffId = await getStaffId(user.email!);
  if (staffId) {
    await db.insert(auditLog).values({
      staffId,
      action: "set_stock",
      entityType: "variant",
      entityId: variantId,
      payload: { onHand },
    });
  }

  revalidatePath("/admin/inventory");
}

export interface UnitIntakeInput {
  variantId: string;
  batteryPct: number;
  gradeNotes?: string;
  /** Plain-text IMEI — encrypted server-side before storage */
  imei?: string;
}

export async function createUnit(input: UnitIntakeInput) {
  const user = await requireStaff();

  if (
    !input.variantId ||
    !Number.isInteger(input.batteryPct) ||
    input.batteryPct < 0 ||
    input.batteryPct > 100
  ) {
    throw new Error("Invalid unit data");
  }

  // Verify variant exists and is pre-owned condition
  const [variant] = await db
    .select({ id: variants.id, condition: variants.condition })
    .from(variants)
    .where(eq(variants.id, input.variantId))
    .limit(1);

  if (!variant) throw new Error("Variant not found");
  if (variant.condition === "new") throw new Error("Units are for pre-owned only");

  // Validate and encrypt IMEI if provided
  let imeiEncrypted: string | null = null;
  if (input.imei) {
    const clean = input.imei.replace(/\s/g, "");
    if (!/^\d{14,16}$/.test(clean)) {
      throw new Error("IMEI must be 14–16 digits.");
    }
    imeiEncrypted = encryptImei(clean);
  }

  const [unit] = await db
    .insert(units)
    .values({
      variantId: input.variantId,
      batteryPct: input.batteryPct,
      gradeNotes: input.gradeNotes ?? null,
      imeiEncrypted,
      status: "available",
    })
    .returning({ id: units.id });

  const staffId = await getStaffId(user.email!);
  if (staffId) {
    await db.insert(auditLog).values({
      staffId,
      action: "create_unit",
      entityType: "unit",
      entityId: unit.id,
      payload: { variantId: input.variantId, batteryPct: input.batteryPct },
    });
  }

  revalidatePath("/admin/inventory");
  return unit.id;
}
