// apps/studio/app/api/ship/business/oms/obari/thedeal/btdo/requirements/templates/list/route.ts
// BTDO — Requirement Templates (List)
// GET: ?q=&limit=20&cursor=<templateId>

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toInt(v: string | null, def = 20, min = 1, max = 50) {
  const n = Number(v ?? def);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

type BtdoTemplateRow = {
  id: string;
  name?: string;
  createdAt?: Date | string;
  lines?: Array<{ id: string; kind?: string; required?: boolean; notes?: string | null; idx?: number }>;
  [k: string]: any;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = toInt(searchParams.get("limit"), 20, 1, 50);
    const cursor = (searchParams.get("cursor") || "").trim() || null;

    const where = q
      ? {
          name: { contains: q, mode: "insensitive" as const },
        }
      : undefined;

    const items = await prisma.btdoRequirementTemplate.findMany({
      where,
      take: limit + 1, // pull one extra to compute nextCursor
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        lines: { orderBy: { idx: "asc" } },
      },
    });

    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? rows[rows.length - 1]?.id ?? null : null;

    return NextResponse.json({
      ok: true,
      count: rows.length,
      nextCursor,
      items: rows.map((t: BtdoTemplateRow) => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt,
        lines: (t.lines || []).map((l: any) => ({
          id: l.id,
          kind: l.kind,
          required: l.required,
          notes: l.notes,
          idx: l.idx,
        })),
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "failed to list templates" },
      { status: 500 }
    );
  }
}
