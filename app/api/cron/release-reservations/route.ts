import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reservations, units, inventory } from "@/lib/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";

/**
 * Vercel Cron — runs every 5 minutes.
 * Releases expired reservations so stock becomes available again.
 * Secured by CRON_SECRET header set in Vercel project env.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();

  // Find unreleased expired reservations
  const expired = await db
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.released, false),
        lt(reservations.expiresAt, now)
      )
    );

  if (!expired.length) {
    return NextResponse.json({ released: 0 });
  }

  let released = 0;

  for (const res of expired) {
    // Release pre-owned unit
    if (res.unitId) {
      await db
        .update(units)
        .set({ status: "available", updatedAt: new Date() })
        .where(and(eq(units.id, res.unitId), eq(units.status, "reserved")));
    }

    // Return new-device inventory count
    if (res.variantId && !res.unitId) {
      await db
        .update(inventory)
        .set({
          reserved: sql`GREATEST(${inventory.reserved} - ${res.qty}, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, res.variantId));
    }

    await db
      .update(reservations)
      .set({ released: true })
      .where(eq(reservations.id, res.id));

    released++;
  }

  return NextResponse.json({ released });
}
