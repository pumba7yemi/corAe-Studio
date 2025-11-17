// apps/studio/app/api/obari/booking/docs/route.ts
// OBARI — Booking DocumentationPhase (150.logic)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingDoc = {
  kind: "POD" | "WTN" | "INV" | "OTHER";
  status?: "REQUIRED" | "PENDING" | "RECEIVED" | "VERIFIED" | "REJECTED";
  notes?: string;
};

type BodyShape = {
  bookingId?: string;
  bookingRef?: string;
  docs: IncomingDoc[];
};

/* Resolve booking ID */
async function resolveBookingId(body: BodyShape): Promise<string | null> {
  if (body.bookingId) return body.bookingId;

  if (body.bookingRef) {
    const booking = await (prisma as any).obariBooking.findUnique({
      where: { bookingRef: body.bookingRef },
      select: { id: true },
    });
    return booking?.id ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BodyShape;
    if (!body.docs?.length) {
      return NextResponse.json(
        { ok: false, error: "No docs provided." },
        { status: 400 }
      );
    }

    const bookingId = await resolveBookingId(body);
    if (!bookingId) {
      return NextResponse.json(
        { ok: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    // Upsert-like: replace existing docs of same kind for the booking
    for (const d of body.docs) {
      const existing = await (prisma as any).documentationPhase.findFirst({
        where: { bookingId, kind: d.kind },
      });

      if (existing) {
        await (prisma as any).documentationPhase.update({
          where: { id: existing.id },
          data: {
            status: d.status ?? existing.status,
            notes: d.notes ?? existing.notes,
            updatedAt: now,
          },
        });
      } else {
        await (prisma as any).documentationPhase.create({
          data: {
            bookingId,
            kind: d.kind,
            status: d.status ?? "REQUIRED",
            notes: d.notes ?? null,
            createdAt: now,
            updatedAt: now,
          },
        });
      }
    }

    const allDocs = await (prisma as any).documentationPhase.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, bookingId, docs: allDocs });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "POST docs failed." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId") ?? undefined;
    const bookingRef = searchParams.get("bookingRef") ?? undefined;

    let resolvedId = bookingId;
    if (!resolvedId && bookingRef) {
      const booking = await (prisma as any).obariBooking.findUnique({
        where: { bookingRef },
        select: { id: true },
      });
      resolvedId = booking?.id;
    }

    if (!resolvedId) {
      return NextResponse.json(
        { ok: false, error: "Provide bookingId or bookingRef." },
        { status: 400 }
      );
    }

    const docs = await (prisma as any).documentationPhase.findMany({
      where: { bookingId: resolvedId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, bookingId: resolvedId, count: docs.length, docs });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "GET docs failed." },
      { status: 500 }
    );
  }
}
