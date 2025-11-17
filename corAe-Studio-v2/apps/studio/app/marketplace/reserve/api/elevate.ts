// apps/studio/app/marketplace/reserve/api/elevate.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) throw new Error("Reservation ID required");

    const reservation = await (prisma as any).reservation.update({
      where: { id },
      data: {
        flowMode: "BTDO",
        btdoStage: "TRADE_OPEN",
        status: "TRADE_OPEN",
      },
    });

    return NextResponse.json({ ok: true, reservation });
  } catch (err: any) {
    console.error("Reserve Elevate Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}