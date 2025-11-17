// apps/studio/app/api/obari/report/approve/route.ts
// OBARI — Report Approve (status transition + audit) · 150.logic

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApproveBody = {
  // Identify the report either directly or via booking
  reportId?: string;
  bookingId?: string;
  bookingRef?: string;

  // Optional: override approver identity (defaults to "caia")
  approvedBy?: string;

  // Optional: attach note; keeps existing commercial totals intact
  note?: string | null;
};

async function findReportId(
  reportId?: string,
  bookingId?: string,
  bookingRef?: string
): Promise<string | null> {
  if (reportId) return reportId;

  if (bookingId) {
    const r = await (prisma as any).obariReport.findFirst({
      where: { bookingId },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    return r?.id ?? null;
  }

  if (bookingRef) {
    const b = await (prisma as any).obariBooking.findUnique({
      where: { bookingRef },
      select: { id: true },
    });
    if (!b?.id) return null;
    const r = await (prisma as any).obariReport.findFirst({
      where: { bookingId: b.id },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
    return r?.id ?? null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ApproveBody;

    const id = await findReportId(body.reportId, body.bookingId, body.bookingRef);
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Report not found (provide reportId OR bookingId OR bookingRef)." },
        { status: 404 }
      );
    }

    // Transition to APPROVED; stamp approver & time. Preserve existing totals/lines.
    const report = await (prisma as any).obariReport.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: body.approvedBy ?? "caia",
        approvedAt: new Date(),
        varianceNote: body.note ?? undefined,
      },
      include: { damages: true, variances: true, booking: { select: { bookingRef: true } } },
    });

    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Report approval failed." },
      { status: 500 }
    );
  }
}

// Convenience GET to check route is wired
export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "POST this route with { reportId | bookingId | bookingRef } to approve a report.",
  });
}
