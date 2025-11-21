// apps/studio/app/marketplace/reserve/api/timeline.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("Reservation ID required");

    const reservation = await (prisma as any).reservation.findUnique({
      where: { id },
      include: {
        Deal: true,
        Order: true,
      },
    });

    if (!reservation) throw new Error("Reservation not found");

    const timeline = [
      { stage: "BOOKED", at: reservation.createdAt },
      reservation.btdoStage === "TRADE_OPEN" && { stage: "TRADE_OPEN", at: reservation.updatedAt },
      reservation.btdoStage === "TRADE_LOCKED" && { stage: "TRADE_LOCKED", at: reservation.updatedAt },
      reservation.Deal && { stage: "DEAL_CONFIRMED", at: reservation.Deal.confirmedAt },
      reservation.Order && { stage: "SCHEDULED", at: reservation.Order.dispatched },
      reservation.Order?.fulfilled && { stage: "FULFILLED", at: reservation.Order.fulfilled },
      reservation.Order?.invoiced && { stage: "INVOICED", at: reservation.Order.invoiced },
    ].filter(Boolean);

    return NextResponse.json({ ok: true, timeline });
  } catch (err: any) {
    console.error("Reserve Timeline Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}