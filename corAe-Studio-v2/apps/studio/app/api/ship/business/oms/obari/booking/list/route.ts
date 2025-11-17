// apps/studio/app/api/obari/booking/list/route.ts
// OBARI — List Bookings with filters + cursor pagination (150.logic)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_LIMIT = 20 as const;

type BookingRowLite = {
  id: string;
  bookingRef?: string;
  orderId?: string | null;
  order?: any;
  scheduleId?: string | null;
  datePlanned?: Date | string | null;
  location?: any;
  specialInst?: string | null;
  _count?: { docs?: number; actives?: number } | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [k: string]: any;
};

type ListQuery = {
  orderId?: string;
  scheduleId?: string;
  from?: string; // ISO date (inclusive) match on datePlanned/happened range via datePlanned only here
  to?: string;   // ISO date (inclusive)
  q?: string;    // bookingRef or order code fuzzy
  limit?: string;
  cursor?: string; // opaque cursor=id of last row
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q: ListQuery = Object.fromEntries(searchParams.entries()) as any;

    const limit = Math.max(
      1,
      Math.min(Number(q.limit ?? DEFAULT_LIMIT) || DEFAULT_LIMIT, 100)
    );

    // Build where
    const where: any = {};
    if (q.orderId) where.orderId = q.orderId;
    if (q.scheduleId) where.scheduleId = q.scheduleId;

    // date range on datePlanned when provided
    if (q.from || q.to) {
      where.datePlanned = {};
      if (q.from) where.datePlanned.gte = new Date(q.from);
      if (q.to) {
        const to = new Date(q.to);
        // inclusive end-of-day
        to.setHours(23, 59, 59, 999);
        where.datePlanned.lte = to;
      }
    }

    // fuzzy on bookingRef or order.code
    if (q.q) {
      where.OR = [
        { bookingRef: { contains: q.q, mode: "insensitive" } },
        { order: { code: { contains: q.q, mode: "insensitive" } } },
      ];
    }

    // Cursor pagination uses booking.id
    const cursor =
      q.cursor && q.cursor.trim().length > 0
        ? { id: q.cursor.trim() }
        : undefined;

    const rows = await prisma.obariBooking.findMany({
      where,
      take: limit + 1, // fetch one extra to detect nextCursor
      ...(cursor ? { skip: 1, cursor } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        order: {
          select: {
            id: true,
            code: true,
            direction: true,
            expectedWeek: true,
            scheduleMode: true,
            itemCode: true,
          },
        },
        _count: {
          select: { docs: true, actives: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.id;
    }

    return NextResponse.json({
      ok: true,
      count: rows.length,
      nextCursor,
      items: rows.map((b: BookingRowLite) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        orderId: b.orderId,
        order: b.order,
        scheduleId: b.scheduleId,
        datePlanned: b.datePlanned,
        location: b.location,
        specialInst: b.specialInst,
  docsCount: b._count?.docs ?? 0,
  activesCount: b._count?.actives ?? 0,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to list bookings." },
      { status: 500 }
    );
  }
}
