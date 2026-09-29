"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { families, variants, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireStaff() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function getStaffId(email: string): Promise<string | null> {
  const { staff } = await import("@/lib/db/schema");
  const [s] = await db
    .select({ id: staff.id })
    .from(staff)
    .where(eq(staff.email, email.toLowerCase()))
    .limit(1);
  return s?.id ?? null;
}

export async function updateFamilyStatus(
  familyId: string,
  status: "current" | "discontinued" | "preorder"
) {
  const user = await requireStaff();

  const [before] = await db
    .select({ status: families.status })
    .from(families)
    .where(eq(families.id, familyId))
    .limit(1);

  await db
    .update(families)
    .set({ status, updatedAt: new Date() })
    .where(eq(families.id, familyId));

  const staffId = await getStaffId(user.email!);
  if (staffId) {
    await db.insert(auditLog).values({
      staffId,
      action: "update_family_status",
      entityType: "family",
      entityId: familyId,
      payload: { before: before?.status, after: status },
    });
  }

  revalidatePath("/admin/catalog");
  revalidatePath(`/admin/catalog/${familyId}`);
  revalidatePath("/iphone");
  revalidatePath("/");
}

export async function updateVariantPrice(variantId: string, priceCents: number) {
  const user = await requireStaff();

  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new Error("Invalid price");
  }

  const [before] = await db
    .select({ priceCents: variants.priceCents })
    .from(variants)
    .where(eq(variants.id, variantId))
    .limit(1);

  await db
    .update(variants)
    .set({ priceCents, updatedAt: new Date() })
    .where(eq(variants.id, variantId));

  const staffId = await getStaffId(user.email!);
  if (staffId) {
    await db.insert(auditLog).values({
      staffId,
      action: "update_variant_price",
      entityType: "variant",
      entityId: variantId,
      payload: { before: before?.priceCents, after: priceCents },
    });
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/iphone");
}

export async function toggleVariantActive(variantId: string, active: boolean) {
  const user = await requireStaff();

  await db
    .update(variants)
    .set({ active, updatedAt: new Date() })
    .where(eq(variants.id, variantId));

  const staffId = await getStaffId(user.email!);
  if (staffId) {
    await db.insert(auditLog).values({
      staffId,
      action: active ? "activate_variant" : "deactivate_variant",
      entityType: "variant",
      entityId: variantId,
      payload: { active },
    });
  }

  revalidatePath("/admin/catalog");
}
