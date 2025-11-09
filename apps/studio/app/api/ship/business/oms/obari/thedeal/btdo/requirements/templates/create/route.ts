// apps/studio/app/api/ship/business/oms/obari/thedeal/btdo/requirements/templates/create/route.ts
// BTDO — Requirement Templates (Create)
// POST: create a template with one or more lines (e.g., POD, WTN)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LineIn = {
  kind: string;
  required?: boolean;
  notes?: string;
  idx?: number;
};

type BodyIn = {
  name?: string;
  lines?: LineIn[];
};

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BodyIn | null;
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return bad("name required");
    }

    const linesIn = Array.isArray(body.lines) ? body.lines : [];
    if (linesIn.length === 0) return bad("lines[] required (at least one)");

    // Normalize + validate lines
    const norm = linesIn.map((l, i) => {
      const kind = String(l?.kind ?? "").trim().toUpperCase();
      if (!kind) throw new Error(`lines[${i}].kind required`);
      return {
        kind,
        required: typeof l?.required === "boolean" ? l.required : true,
        notes: l?.notes?.trim() || undefined,
        idx: Number.isFinite(l?.idx as number) ? (l?.idx as number) : i,
      };
    });

    // Enforce small sane limits
    if (norm.length > 50) return bad("too many lines (max 50)");
    const name = body.name.trim();

    // Ensure uniqueness of name
    const exists = await prisma.btdoRequirementTemplate.findUnique({
      where: { name },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "template with this name already exists", templateId: exists.id },
        { status: 409 }
      );
    }

    const tpl = await prisma.btdoRequirementTemplate.create({
      data: {
        name,
        lines: {
          createMany: {
            data: norm.map((l) => ({
              kind: l.kind,
              required: l.required,
              notes: l.notes,
              idx: l.idx,
            })),
          },
        },
      },
      include: { lines: { orderBy: { idx: "asc" } } },
    });

    return NextResponse.json({ ok: true, template: tpl });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "failed to create template" },
      { status: 500 }
    );
  }
}

// Optional contract doc (GET)
export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "POST to create a BTDO requirement template used by leads",
    expects: {
      name: "string (unique, required)",
      lines: [
        {
          kind: "string (e.g., POD | WTN | INV | OTHER) — required",
          required: "boolean (default true)",
          notes: "string (optional)",
          idx: "number (optional ordering; default array index)",
        },
      ],
    },
  });
}
