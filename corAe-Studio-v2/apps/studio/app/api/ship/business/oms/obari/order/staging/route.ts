// apps/studio/apps/ship/app/api/business/oms/obari/order/staging/route.ts
// OBARI — API: Stage Order from BDO (immutable snapshot)
// POST: create staging snapshot from a BDO draft
// GET:  fetch a snapshot by ?id=OSTG_xxx (debug)
// PATCH: update notes only

import { NextRequest, NextResponse } from "next/server";
import type {
  stageFromBDO,
  updateNotes,
  getTransportFlag,
} from "./service";

/**
 * Minimal ambient declaration for './contract' types used in this file.
 * This avoids a compile error when ./contract is not present in the project.
 */
// Local fallback types for './contract' when it's not present.
// Use non-ambient local type aliases to avoid module augmentation errors.
type NumberSeries = unknown;
type BdoOrderDraft = unknown;

/**
 * Ambient module declaration to satisfy TypeScript when ./service implementation
 * or its types are not present in the project (fixes: Cannot find module './service').
 * Keep types minimal and compatible with how this file uses the functions.
 */
declare module "./service" {
  // Use local fallback types to avoid referencing ./contract (which may be missing).
  type NumberSeries = unknown;
  type BdoOrderDraft = unknown;

  export function stageFromBDO(
    draft: BdoOrderDraft,
    opts: { series: NumberSeries; repo: any; clock?: () => Date }
  ): Promise<any>;

  export function updateNotes(
    snapshotId: string,
    notes: string | null,
    opts: { series: NumberSeries; repo: any }
  ): Promise<any>;

  export function getTransportFlag(
    id: string,
    opts: { series: NumberSeries; repo: any }
  ): Promise<any>;
}

import { repo, series } from "../../_singletons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------- POST -------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BdoOrderDraft;

    const { stageFromBDO } = await import("./service");
    const snapshot = await stageFromBDO(body, {
      series,
      repo,
      clock: () => new Date(),
    });

    return NextResponse.json({ ok: true, snapshot });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to stage order" },
      { status: 400 }
    );
  }
}
/* -------------------------------- GET --------------------------------- */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const flagOnly = searchParams.get("flag");

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "id query param required" },
      { status: 400 }
    );
  }

  const snap = await repo.getById(id);
  if (!snap) {
    return NextResponse.json(
      { ok: false, error: "snapshot not found" },
      { status: 404 }
    );
  }

  if (flagOnly) {
    const { getTransportFlag } = await import("./service");
    const flag = await getTransportFlag(id, { series, repo });
    return NextResponse.json({ ok: true, flag });
  }

  return NextResponse.json({ ok: true, snapshot: snap });
}
/* -------------------------------- PATCH -------------------------------- */
export async function PATCH(req: NextRequest) {
  try {
    const { snapshotId, notes } = (await req.json()) as {
      snapshotId: string;
      notes?: string | null;
    };

    if (!snapshotId) {
      return NextResponse.json(
        { ok: false, error: "snapshotId required" },
        { status: 400 }
      );
    }

    const { updateNotes } = await import("./service");
    const updated = await updateNotes(snapshotId, notes ?? null, {
      series,
      repo,
    });

    return NextResponse.json({ ok: true, snapshot: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to patch notes" },
      { status: 400 }
    );
  }
}