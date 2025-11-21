// apps/studio/app/marketplace/reserve/api/confirm.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id, price, terms } = await req.json();
    if (!id) throw new Error("Reservation ID required");

    // create Deal linked to Reservation
    const deal = await (prisma as any).deal.create({
      data: {
        reservationId: id,
        price: price ?? 0,
        terms: terms ?? null,
        status: "CONFIRMED",
      },
    });

    // update Reservation to link Deal
    const reservation = await (prisma as any).reservation.update({
      where: { id },
      data: {
        dealId: deal.id,
        btdoStage: "DEAL",
        status: "DEAL_CONFIRMED",
      },
    });

    return NextResponse.json({ ok: true, deal, reservation });
  } catch (err: any) {
    console.error("Reserve Confirm Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}