// apps/studio/app/api/obari/report/submit/route.ts
// OBARI — Report Submit (create-or-update) · 150.logic

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubmitBody = {
  bookingId?: string;
  bookingRef?: string;

  // optional schedule link
  scheduleId?: string | null;

  // status bump; if omitted we default to SUBMITTED
  status?: "DRAFT" | "SUBMITTED" | "CONFIRMED" | "APPROVED" | "REJECTED";

  // commercial totals (denormalized)
  subtotal?: number | string;
  taxTotal?: number | string;
  grandTotal?: number | string;

  // flags/notes
  derivedFromDocs?: boolean; // default true
  varianceNote?: string | null;

  // optional arrays to upsert lines (simple replace-on-submit)
  damages?: Array<{
    kind: string;
    qty?: number | string | null;
    unit?: string | null;
    value?: number | string | null;
    note?: string | null;
  }>;

  variances?: Array<{
    field: string; // price | qty | tax | etc.
    expected?: string | null;
    actual?: string | null;
    note?: string | null;
  }>;
};

async function resolveBookingId(bookingId?: string, bookingRef?: string) {
  if (bookingId) return bookingId;
  if (bookingRef) {
    const b = await (prisma as any).obariBooking.findUnique({
      where: { bookingRef },
      select: { id: true },
    });
    return b?.id ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitBody;

    const resolved = await resolveBookingId(body.bookingId, body.bookingRef);
    if (!resolved) {
      return NextResponse.json(
        { ok: false, error: "Booking not found (provide bookingId or bookingRef)." },
        { status: 404 }
      );
    }

    // Find existing report for this booking (one-to-one in practice)
    const existing = await (prisma as any).obariReport.findFirst({
      where: { bookingId: resolved },
      select: { id: true },
    });

    const status = body.status ?? "SUBMITTED";

    // Core data to set/update
    const coreData = {
      bookingId: resolved,
      scheduleId: body.scheduleId ?? null,
      status,
      derivedFromDocs: body.derivedFromDocs ?? true,
      varianceNote: body.varianceNote ?? null,
      subtotal: (body.subtotal as any) ?? undefined,
      taxTotal: (body.taxTotal as any) ?? undefined,
      grandTotal: (body.grandTotal as any) ?? undefined,
    };

    // Build nested mutations for lines (replace strategy)
    const withLines =
      body.damages || body.variances
        ? {
            damages: body.damages
              ? {
                  deleteMany: { reportId: existing?.id ?? undefined },
                  create: body.damages.map((d) => ({
                    kind: d.kind,
                    qty: (d.qty as any) ?? null,
                    unit: d.unit ?? null,
                    value: (d.value as any) ?? null,
                    note: d.note ?? null,
                  })),
                }
              : undefined,
            variances: body.variances
              ? {
                  deleteMany: { reportId: existing?.id ?? undefined },
                  create: body.variances.map((v) => ({
                    field: v.field,
                    expected: v.expected ?? null,
                    actual: v.actual ?? null,
                    note: v.note ?? null,
                  })),
                }
              : undefined,
          }
        : undefined;

    let report;
    if (existing) {
      report = await (prisma as any).obariReport.update({
        where: { id: existing.id },
        data: {
          ...coreData,
          ...(withLines ?? {}),
          approvedBy: status === "APPROVED" ? "caia" : undefined,
          approvedAt: status === "APPROVED" ? new Date() : undefined,
        },
        include: { damages: true, variances: true },
      });
    } else {
      report = await (prisma as any).obariReport.create({
        data: {
          ...coreData,
          ...(withLines ?? {}),
        },
        include: { damages: true, variances: true },
      });
    }

    return NextResponse.json({ ok: true, report });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Report submit failed." },
      { status: 500 }
    );
  }
}
