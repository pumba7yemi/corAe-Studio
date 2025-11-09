// apps/studio/app/marketplace/reserve/api/dispatch.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { dealId, workRef, amount } = await req.json();
    if (!dealId) throw new Error("Deal ID required");

    // create Order linked to Deal
    const order = await (prisma as any).order.create({
      data: {
        dealId,
        workRef: workRef ?? null,
        amount: amount ?? 0,
        status: "SCHEDULED",
        dispatched: new Date(),
      },
    });

    // update Deal and Reservation
    const deal = await (prisma as any).deal.update({
      where: { id: dealId },
      data: { orderId: order.id, status: "ORDER_CREATED" },
    });

    await (prisma as any).reservation.updateMany({
      where: { dealId },
      data: { orderId: order.id, status: "SCHEDULED", btdoStage: "ORDER" },
    });

    return NextResponse.json({ ok: true, order, deal });
  } catch (err: any) {
    console.error("Reserve Dispatch Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}