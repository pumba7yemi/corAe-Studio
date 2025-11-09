// apps/studio/app/marketplace/reserve/api/reservations.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const reservations = await (prisma as any).reservation.findMany({
      include: {
        Deal: true,
        Order: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, reservations });
  } catch (err: any) {
    console.error("Reserve Reservations Fetch Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}