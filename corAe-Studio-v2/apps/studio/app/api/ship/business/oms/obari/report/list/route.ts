// apps/studio/app/api/obari/report/list/route.ts
// OBARI — Report List (filter by status/date/schedule/vendor/customer) · 150.logic

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") ?? undefined;
    const scheduleId = searchParams.get("scheduleId") ?? undefined;
    const vendorCode = searchParams.get("vendorCode") ?? undefined;
    const customerCode = searchParams.get("customerCode") ?? undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Compose Prisma where filter
    const where: any = {};
    if (status) where.status = status;
    if (scheduleId) where.scheduleId = scheduleId;
    if (vendorCode) where.vendorCode = vendorCode;
    if (customerCode) where.customerCode = customerCode;

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const reports = await prisma.obariReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            bookingRef: true,
            direction: true,
            vendorCode: true,
            customerCode: true,
          },
        },
        damages: true,
        variances: true,
      },
    });

    return NextResponse.json({ ok: true, count: reports.length, reports });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to fetch reports." },
      { status: 500 }
    );
  }
}
