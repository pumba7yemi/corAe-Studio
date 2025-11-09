// apps/studio/app/api/ship/business/oms/obari/order/list/route.ts
// OBARI — Orders List API (150.logic, reconciled path)
// GET /api/ship/business/oms/obari/order/list?limit=20&cursor=<id>&direction=PURCHASE|SALES&q=...

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Direction = "PURCHASE" | "SALES";

// Serialize Prisma Decimal/Date safely into strings.
function toPlain(o: any) {
  if (o == null) return o;
  if (typeof o === "object") {
    if (typeof (o as any).toJSON === "function") return (o as any).toJSON();
    if (o instanceof Date) return o.toISOString();
    const out: Record<string, any> = {};
    for (const k of Object.keys(o)) {
      const v = (o as any)[k];
      out[k] =
        v && typeof v === "object" && "toString" in v && typeof v.toString === "function"
          ? v.toString()
          : toPlain(v);
    }
    return out;
  }
  return o;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "20"), 1), 100);
    const cursor = url.searchParams.get("cursor"); // cursor is order.id
    const q = (url.searchParams.get("q") || "").trim();
    const direction = (url.searchParams.get("direction") || "") as Direction | "";

    const where: Record<string, any> = {};
    if (direction === "PURCHASE" || direction === "SALES") {
      where.direction = direction;
    }
    if (q) {
      // Simple multi-field contains OR
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { itemCode: { contains: q, mode: "insensitive" } },
        { vendorCode: { contains: q, mode: "insensitive" } },
        { customerCode: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const findArgs: any = {
      where,
      orderBy: { createdAt: "desc" as const },
      take: limit + 1, // fetch one extra to determine nextCursor
      select: {
        id: true,
        code: true,
        direction: true,
        expectedWeek: true,
        scheduleMode: true,
        itemCode: true,
        description: true,
        qty: true,
        unit: true,
        unitPrice: true,
        currency: true,
        vendorCode: true,
        customerCode: true,
        createdAt: true,
      },
    };

    if (cursor) {
      // Use id cursor; we keep orderBy createdAt for human sense, but cursor on id is stable.
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1; // skip the cursor row
    }

    const rows = await prisma.obariOrder.findMany(findArgs);

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const nextItem = rows.pop()!; // extra item
      nextCursor = nextItem.id;
    }

    return NextResponse.json({
      ok: true,
      count: rows.length,
      nextCursor,
      items: rows.map(toPlain),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to list orders." },
      { status: 500 }
    );
  }
}
