// apps/studio/app/marketplace/reserve/api/orders.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await (prisma as any).order.findMany({
      include: {
        deal: {
          include: {
            reservation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, orders });
  } catch (err: any) {
    console.error("Reserve Orders Fetch Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}