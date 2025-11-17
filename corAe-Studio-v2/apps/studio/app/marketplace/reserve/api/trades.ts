// apps/studio/app/marketplace/reserve/api/trades.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const trades = await (prisma as any).reservation.findMany({
      where: {
        flowMode: "BTDO",
      },
      include: {
        Deal: true,
        Order: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, trades });
  } catch (err: any) {
    console.error("Reserve Trades Fetch Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}