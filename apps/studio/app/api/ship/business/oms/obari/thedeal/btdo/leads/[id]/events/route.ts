// apps/studio/app/api/ship/business/oms/obari/deal/btdo/leads/[id]/events/route.ts
// BTDO — Lead Events
// POST /api/btdo/leads/:id/events   { kind:"NOTE"|"CALL"|"EMAIL"|"TASK", message:string }
// GET  /api/btdo/leads/:id/events?limit=20&cursor=<token>
//
// Response:
// { ok:true, item:{...} } | { ok:false, error:string }   (POST)
// { ok:true, count:number, nextCursor:string|null, items:[...] } (GET)
//
// Notes:
// - Cursor encodes createdAt+id to keep order stable (newest first).
// - If your schema names differ slightly, keep the select block aligned to available fields.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ----- helpers -----
function parseLimit(v: string | null, def = 20, max = 50) {
  const n = v ? Number(v) : def;
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(Math.floor(n), max);
}

type CursorDecoded = { createdAt: Date; id: string };
function encodeCursor(c: CursorDecoded): string {
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

// ----- GET: list events for a lead -----
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await ctx.params;
    if (!leadId) {
      return NextResponse.json({ ok: false, error: "lead id required" }, { status: 400 });
    }

    // ensure lead exists (fast select)
    const exists = await (prisma as any).btdoLead.findUnique({
      where: { id: leadId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ ok: false, error: "lead not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const limit = parseLimit(url.searchParams.get("limit"));
    const cur = decodeCursor(url.searchParams.get("cursor"));

    const events: {
      id: string;
      leadId: string;
      kind: string;
      message: string;
      createdAt: Date;
      createdBy: string | null;
    }[] = await (prisma as any).btdoLeadEvent.findMany({
      where: { leadId },
      orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
      take: limit + 1,
      ...(cur
        ? {
            skip: 1,
            cursor: { createdAt_id: { createdAt: cur.createdAt, id: cur.id } } as any,
          }
        : {}),
      select: {
        id: true,
        leadId: true,
        kind: true,
        message: true,
        createdAt: true,
        createdBy: true, // nullable string OK
      },
    }).catch(async () => {
      // fallback if compound cursor not defined in schema
      const fallback = await (prisma as any).btdoLeadEvent.findMany({
        where: cur ? { leadId, createdAt: { lt: cur.createdAt } } : { leadId },
        orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
        take: limit + 1,
        select: {
          id: true,
          leadId: true,
          kind: true,
          message: true,
          createdAt: true,
          createdBy: true,
        },
      });
      return fallback;
    });

    const items = events.slice(0, limit).map((e: {
      id: string;
      leadId: string;
      kind: string;
      message: string;
      createdAt: Date;
      createdBy: string | null;
    }) => ({
      id: e.id,
      leadId: e.leadId,
      kind: e.kind,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
      createdBy: e.createdBy ?? null,
    }));

    let nextCursor: string | null = null;
    if (events.length > limit) {
      const last = events[limit];
      nextCursor = encodeCursor({ createdAt: last.createdAt, id: last.id });
    }

    return NextResponse.json({ ok: true, count: items.length, nextCursor, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "failed to list events" }, { status: 500 });
  }
}

// ----- POST: add event to a lead -----
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: leadId } = await ctx.params;
    if (!leadId) {
      return NextResponse.json({ ok: false, error: "lead id required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const kind = String(body?.kind ?? "NOTE").toUpperCase();
    const message = (body?.message ?? "").toString().trim();
    const createdBy = (body?.createdBy ?? "").toString().trim() || null;

    const allowed = new Set(["NOTE", "CALL", "EMAIL", "TASK"]);
    if (!allowed.has(kind)) {
      return NextResponse.json({ ok: false, error: "invalid kind" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: "message required" }, { status: 400 });
    }

    // ensure lead exists
    const lead = await (prisma as any).btdoLead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (!lead) {
      return NextResponse.json({ ok: false, error: "lead not found" }, { status: 404 });
    }

    const ev = await (prisma as any).btdoLeadEvent.create({
      data: {
        leadId,
        kind,
        message,
        createdBy, // nullable
      },
      select: {
        id: true,
        leadId: true,
        kind: true,
        message: true,
        createdAt: true,
        createdBy: true,
      },
    });

    return NextResponse.json({
      ok: true,
      item: {
        id: ev.id,
        leadId: ev.leadId,
        kind: ev.kind,
        message: ev.message,
        createdAt: ev.createdAt.toISOString(),
        createdBy: ev.createdBy ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "failed to add event" }, { status: 500 });
  }
}

// Optional descriptor
export async function OPTIONS() {
  return NextResponse.json({
    ok: true,
    POST: { body: { kind: "NOTE|CALL|EMAIL|TASK", message: "string", createdBy: "string|null" } },
    GET: { query: { limit: "number<=50", cursor: "opaque string" } },
  });
}