import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  const number = req.nextUrl.searchParams.get("number")?.toUpperCase().trim();

  if (!email || !number) {
    return NextResponse.json({ error: "email and number are required." }, { status: 400 });
  }

  const [order] = await db
    .select({
      number: orders.number,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(
      and(
        eq(orders.email, email),
        eq(orders.number, number)
      )
    )
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(order);
}
