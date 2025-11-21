// apps/studio/app/api/business/oms/obari/thedeal/btdo/leads/list/route.ts
// BTDO â€” Leads : List
// GET /api/btdo/leads/list?limit=20&q=Inbound&stage=NEW&source=WEBSITE&cursor=<token>
//
// Response:
// { ok:true, count:number, nextCursor:string|null, items:[...] } | { ok:false, error:string }
//
// Notes:
// - Cursor is an opaque token you get back from this API. It encodes createdAt+id for stable pagination.
// - Order: newest first (createdAt DESC, id DESC).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  title: string;
  source: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  stage: string | null;
  createdAt: string;
  updatedAt: string;
};

function parseLimit(v: string | null, def = 20, max = 50) {
  const n = v ? Number(v) : def;
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(Math.floor(n), max);
}

type CursorDecoded = { createdAt: Date; id: string };
function encodeCursor(c: CursorDecoded): string {
  // createdAt ISO (ms precision) + "|" + id â†’ base64
  const raw = `${c.createdAt.toISOString()}|${c.id}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}
function decodeCursor(token: string | null): CursorDecoded | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [iso, id] = raw.split("|");
    if (!iso || !id) return null;
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return null;
    return { createdAt: dt, id };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseLimit(url.searchParams.get("limit"));
    const q = url.searchParams.get("q")?.trim() || "";
    const stage = url.searchParams.get("stage")?.trim() || "";
    const source = url.searchParams.get("source")?.trim() || "";
    const curRaw = url.searchParams.get("cursor");
    const cur = decodeCursor(curRaw);

    // WHERE
    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { contactName: { contains: q, mode: "insensitive" } },
        { contactPhone: { contains: q, mode: "insensitive" } },
        { contactEmail: { contains: q, mode: "insensitive" } },
      ];
    }
    if (stage) where.stage = stage;
    if (source) where.source = source;

    const commonOrder = [{ createdAt: "desc" as const }, { id: "desc" as const }];

    const leads = await prisma.btdoLead.findMany({
      where,
      orderBy: commonOrder,
      take: limit + 1, // fetch one extra to decide nextCursor
      ...(cur
        ? {
            skip: 1, // skip the cursor row itself
            cursor: { createdAt_id: { createdAt: cur.createdAt, id: cur.id } } as any,
            // requires @@id([createdAt, id]) or @@unique compound in schema; if absent, fallback below
          }
        : {}),
      select: {
        id: true,
        title: true,
        source: true,
        contactName: true,
        contactPhone: true,
        contactEmail: true,
        stage: true,
        createdAt: true,
        updatedAt: true,
      },
  }).catch(async (e: any) => {
      // Fallback if compound cursor not available: use single-id cursor (still stable enough with orderBy id)
      // Adjust orderBy to id only.
      const leadsFallback = await prisma.btdoLead.findMany({
        where: {
          ...where,
          ...(cur ? { createdAt: { lt: cur.createdAt } } : {}),
        },
        orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
        take: limit + 1,
        select: {
          id: true,
          title: true,
          source: true,
          contactName: true,
          contactPhone: true,
          contactEmail: true,
          stage: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return leadsFallback;
    });

    const items: LeadRow[] = leads.slice(0, limit).map((r: any) => ({
      id: r.id,
      title: r.title,
      source: r.source ?? null,
      contactName: r.contactName ?? null,
      contactPhone: r.contactPhone ?? null,
      contactEmail: r.contactEmail ?? null,
      stage: r.stage ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    let nextCursor: string | null = null;
    if (leads.length > limit) {
      const last = leads[limit];
      nextCursor = encodeCursor({ createdAt: last.createdAt, id: last.id });
    }

    return NextResponse.json({
      ok: true,
      count: items.length,
      nextCursor,
      items,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "failed to list leads" },
      { status: 500 }
    );
  }
}

// Optional: simple OPTIONS to describe params (useful during integration)
export async function OPTIONS() {
  return NextResponse.json({
    ok: true,
    params: {
      limit: "number (<=50)",
      q: "search string (title/contact)",
      stage: "string (e.g., NEW|QUALIFY|WON|LOST)",
      source: "string (e.g., WEBSITE|PHONE|EMAIL)",
      cursor: "opaque token returned by this API",
    },
  });
}

