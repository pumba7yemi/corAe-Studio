// apps/studio/app/api/ship/business/oms/obari/deal/[dealId]/confirm-bdo/route.ts
// Studio API — Confirm BDO: set a BDO-stage deal's status to CONFIRMED.
// No external aliases; only uses fields that exist in our Prisma schema.

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prisma singleton (dev hot-reload safe)
declare global {
  // eslint-disable-next-line no-var
  var __studio_prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient =
  global.__studio_prisma__ ?? (global.__studio_prisma__ = new PrismaClient());

type Body = {
  // Require explicit price lock acknowledgment to proceed.
  priceLock?: "LOCK" | "NONE";
  note?: string | null;
};

function isBodyValid(b: unknown): b is Body {
  if (typeof b !== "object" || b === null) return false;
  const v = b as Record<string, unknown>;
  const pl = v.priceLock;
  if (pl !== undefined && pl !== "LOCK" && pl !== "NONE") return false;
  if (v.note !== undefined && typeof v.note !== "string" && v.note !== null) return false;
  return true;
}

// POST /api/ship/business/oms/obari/deal/[dealId]/confirm-bdo
export async function POST(req: Request, ctx: { params: Promise<{ dealId: string }> }) {
  try {
    const { dealId } = await ctx.params;
    if (!dealId || typeof dealId !== "string" || dealId.trim() === "") {
      return NextResponse.json({ error: "Missing dealId in path" }, { status: 400 });
    }

    const raw = await req.json().catch(() => ({}));
    if (!isBodyValid(raw)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (raw.priceLock !== "LOCK") {
      return NextResponse.json({ error: "Pricelock acknowledgement required" }, { status: 400 });
    }

    const deal = await (prisma as any).deal.findUnique({
      where: { id: dealId },
      select: {
      id: true,
      number: true,
      stage: true,
      status: true,
      currency: true,
      subtotal: true,
      taxTotal: true,
      total: true,
      createdAt: true,
      updatedAt: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }
    if (deal.stage !== "BDO") {
      return NextResponse.json(
        { error: `Deal not in BDO stage (current: ${deal.stage})` },
        { status: 409 }
      );
    }

    // Confirm the BDO: set status -> confirmed (stage remains BDO for handoff to Booking slice)
    const updated = await (prisma as any).deal.update({
      where: { id: dealId },
      data: { status: "CONFIRMED" },
      select: {
        id: true,
        number: true,
        stage: true,
        status: true,
        currency: true,
        subtotal: true,
        taxTotal: true,
        total: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, deal: updated });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}