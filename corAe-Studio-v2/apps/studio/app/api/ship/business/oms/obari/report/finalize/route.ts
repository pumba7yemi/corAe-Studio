// apps/studio/app/api/ship/business/oms/obari/thedeal/[dealId]/finalize/route.ts
// Studio API — OBARI Equals Finalize (BTDO→BDO)
// One-button snapshot of BDO handoff: immutable, idempotent, verifiable.

// ── Imports (no aliases)
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";
import { createHash } from "node:crypto";

// ── Types (kept local to avoid missing imports)
type EqualsInput = {
  dealId: string;
  stage: "BTDO" | "BDO";
  status: "draft" | "proposed" | "approved" | "confirmed";
  number: string;
  orgId?: string | null;
  locationId?: string | null;
  customerId?: string | null;
  vendorId?: string | null;
  currency: string;
  lines: Array<{
    sku?: string | null;
    itemName: string;
    qty: string | number;
    unitPrice: string | number;
    taxRate?: string | number;
  }>;
  totals: {
    subtotal: string | number;
    taxTotal: string | number;
    total: string | number;
  };
  meta?: Record<string, unknown>;
};

type EqualsSnapshot = {
  dealId: string;
  at: string;             // ISO time
  stage: "BDO";
  number: string;
  currency: string;
  payload: string;        // canonical JSON
  hash: string;           // sha256(payload)
  version: number;        // schema version
};

// ── Canonicalization & hashing
function sortKeysDeep(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value).sort()) out[k] = sortKeysDeep(value[k]);
    return out;
  }
  return value;
}
function canonicalize(obj: unknown): string {
  return JSON.stringify(sortKeysDeep(obj));
}
function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

// ── Business rules
function makeEqualsSnapshot(input: EqualsInput, now = new Date()): EqualsSnapshot {
  if (input.stage !== "BDO") {
    throw new Error("Equals finalize requires stage=BDO");
  }
  if (!["proposed", "approved", "confirmed"].includes(input.status)) {
    throw new Error("Equals finalize requires status ∈ {proposed, approved, confirmed}");
  }
  if (!input.lines || input.lines.length === 0) {
    throw new Error("Equals finalize requires at least one line");
  }
  const { subtotal, taxTotal, total } = input.totals;
  for (const n of [subtotal, taxTotal, total]) {
    const v = typeof n === "string" ? Number(n) : n;
    if (!Number.isFinite(v) || v < 0) throw new Error("Totals must be valid, non-negative numbers");
  }

  const canonical = canonicalize({
    dealId: input.dealId,
    number: input.number,
    stage: input.stage,
    status: input.status,
    orgId: input.orgId ?? null,
    locationId: input.locationId ?? null,
    customerId: input.customerId ?? null,
    vendorId: input.vendorId ?? null,
    currency: input.currency,
    lines: input.lines.map(l => ({
      sku: l.sku ?? null,
      itemName: l.itemName,
      qty: String(l.qty),
      unitPrice: String(l.unitPrice),
      taxRate: l.taxRate == null ? "0" : String(l.taxRate),
    })),
    totals: {
      subtotal: String(subtotal),
      taxTotal: String(taxTotal),
      total: String(total),
    },
    meta: input.meta ?? {},
  });

  return {
    dealId: input.dealId,
    at: now.toISOString(),
    stage: "BDO",
    number: input.number,
    currency: input.currency,
    payload: canonical,
    hash: sha256(canonical),
    version: 1,
  };
}

// ── Route: POST /api/obari/deals/:dealId/finalize
export async function POST(req: Request, ctx: { params: Promise<any> }) {
  try {
    const { dealId } = (await ctx.params) as any;
    if (!dealId) {
      return NextResponse.json({ error: "Missing dealId in path" }, { status: 400 });
    }

    const raw = await req.json();
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Enforce spine id from path
    const body = raw as Omit<EqualsInput, "dealId"> & { dealId?: string };
    if (body.dealId && body.dealId !== dealId) {
      return NextResponse.json({ error: "dealId mismatch between path and body" }, { status: 400 });
    }

    const input: EqualsInput = {
      dealId,
      stage: body.stage,
      status: body.status,
      number: body.number,
      orgId: body.orgId ?? null,
      locationId: body.locationId ?? null,
      customerId: body.customerId ?? null,
      vendorId: body.vendorId ?? null,
      currency: body.currency,
      lines: body.lines,
      totals: body.totals,
      meta: body.meta ?? {},
    };

    const snap = makeEqualsSnapshot(input);

    // Persist to content-addressed file under .data/equals/
    const dir = pathResolve(process.cwd(), ".data", "equals");
    await mkdir(dir, { recursive: true });

    const filename = `${dealId}-${snap.hash.slice(0, 16)}.json`;
    const filepath = pathJoin(dir, filename);

    // Write once; if exists, treat as idempotent success
    await writeFile(filepath, JSON.stringify(snap, null, 2), {
      encoding: "utf-8",
      flag: "wx",
    }).catch((err: any) => {
      if (err?.code === "EEXIST") {
        // already finalized with same payload → idempotent success
        return;
      }
      throw err;
    });

    return NextResponse.json({
      ok: true,
      dealId: snap.dealId,
      at: snap.at,
      stage: snap.stage,
      number: snap.number,
      currency: snap.currency,
      hash: snap.hash,
      version: snap.version,
      file: `.data/equals/${filename}`,
      payload: snap.payload,
    });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
