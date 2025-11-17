// apps/studio/app/marketplace/reserve/api/deals.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const deals = await (prisma as any).deal.findMany({
      include: {
        reservation: true,
        order: true,
      },
      orderBy: { confirmedAt: "desc" },
    });

    return NextResponse.json({ ok: true, deals });
  } catch (err: any) {
    console.error("Reserve Deals Fetch Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}