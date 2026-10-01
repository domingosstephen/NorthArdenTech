export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Polled by /order/confirm?pi=xxx to get the order number after webhook fires. */
export async function GET(req: NextRequest) {
  const pi = req.nextUrl.searchParams.get("pi");
  if (!pi) {
    return NextResponse.json({ error: "pi param required." }, { status: 400 });
  }

  const [order] = await db
    .select({ number: orders.number })
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, pi))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ number: order.number });
}