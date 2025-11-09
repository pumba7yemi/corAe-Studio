// apps/studio/app/marketplace/reserve/api/create.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = (globalThis as any).prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const reservation = await prisma.reservation.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        vendorRef: data.vendorRef ?? null,
        customerRef: data.customerRef ?? null,
        quantity: data.quantity ?? 1,
        windowStart: data.windowStart ? new Date(data.windowStart) : null,
        windowEnd: data.windowEnd ? new Date(data.windowEnd) : null,
        flowMode: data.flowMode ?? "BDO",
        status: "BOOKED",
      },
    });

    return NextResponse.json({ ok: true, reservation });
  } catch (err: any) {
    console.error("Reserve Create Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}