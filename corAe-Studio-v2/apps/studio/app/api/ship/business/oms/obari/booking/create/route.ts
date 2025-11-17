// apps/studio/app/api/ship/business/oms/obari/bookings/create/route.ts
// Studio API — Booking Create (Prisma persistence, one-spine Deal→Booking)

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prisma singleton to avoid hot-reload duplication in dev
declare global {
  // eslint-disable-next-line no-var
  var __studio_prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient =
  global.__studio_prisma__ ?? (global.__studio_prisma__ = new PrismaClient());

// ---- Types (kept local to avoid alias issues)
type PostBody = {
  dealId: string;
  number: string;
  status?: "tentative" | "scheduled" | "rescheduled" | "no_show" | "completed" | "cancelled";
  orgId?: string | null;
  locationId?: string | null;
  startAt: string;   // ISO
  endAt: string;     // ISO
  resourceId?: string | null;
  capacity?: number | null;
  notes?: string | null;
};

function isISODate(s: string): boolean {
  if (typeof s !== "string") return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;

    // ---- Validate minimal payload
    if (!body?.dealId || typeof body.dealId !== "string" || body.dealId.trim() === "") {
      return NextResponse.json({ error: "dealId is required" }, { status: 400 });
    }
    if (!body?.number || typeof body.number !== "string" || body.number.trim() === "") {
      return NextResponse.json({ error: "number is required" }, { status: 400 });
    }
    if (!body?.startAt || !isISODate(body.startAt)) {
      return NextResponse.json({ error: "startAt must be an ISO date string" }, { status: 400 });
    }
    if (!body?.endAt || !isISODate(body.endAt)) {
      return NextResponse.json({ error: "endAt must be an ISO date string" }, { status: 400 });
    }

    // ---- Ensure Deal exists (FK integrity/clear error)
    const deal = await (prisma as any).deal.findUnique({ where: { id: body.dealId } });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // ---- Persist booking
    const booking = await (prisma as any).booking.create({
      data: {
        dealId: body.dealId,
        number: body.number,
  status: (body.status as any) ?? "tentative",
        orgId: body.orgId ?? null,
        locationId: body.locationId ?? null,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        resourceId: body.resourceId ?? null,
        capacity: typeof body.capacity === "number" ? body.capacity : null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (e: any) {
    // Handle unique constraint on booking.number and other Prisma errors
    const msg = e?.code === "P2002"
      ? "Duplicate booking number"
      : e instanceof Error
      ? e.message
      : "Unknown error";
    const status = e?.code === "P2002" ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
