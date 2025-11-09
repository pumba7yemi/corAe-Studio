// apps/studio/app/api/ship/business/oms/btdo/equals/finalize/route.ts
// Studio API — BTDO Equals Finalize (immutable baton snapshot) + sourceOfDemand
// Role: Create an idempotent "BTDO" stage "=" snapshot to pass forward into BDO/OBARI.

import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";
import { createHash } from "node:crypto";

// ----- Types (local to avoid alias issues)
type DemandType = "SCHEDULED" | "AD_HOC" | "RETAIL_SALES" | "RENTAL" | "SERVICE";

type SourceOfDemand = {
  type: DemandType;
  refId?: string | null; // e.g., recurring plan id, POS batch id, contract id
};

type EqualsInput = {
  dealId: string;
  stage: "BTDO"; // this endpoint expects BTDO
  status: "draft" | "proposed" | "approved" | "confirmed";
  number: string;
  orgId?: string | null;
  locationId?: string | null;
  customerId?: string | null;
  vendorId?: string | null;
  currency: string;

  // NEW — demand source
  sourceOfDemand: SourceOfDemand;

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
  cadence?: "28D" | "MONTHLY" | "HYBRID";
  meta?: Record<string, unknown>;
};

type EqualsSnapshot = {
  dealId: string;
  at: string;             // ISO time
  stage: "BTDO";
  number: string;
  currency: string;
  payload: string;        // canonical JSON (stringified)
  hash: string;           // sha256(payload)
  version: number;        // schema version for "="
};

// ── Canonicalization & hashing
function sortKeysDeep(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value).sort()) out[k] = sortKeysDeep((value as any)[k]);
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
function toStrNum(x: string | number | undefined | null, def = "0"): string {
  if (x === undefined || x === null) return def;
  if (typeof x === "number") return Number.isFinite(x) ? String(x) : def;
  const n = Number(x);
  return Number.isFinite(n) ? String(n) : def;
}
function asNum(n: string | number): number {
  return typeof n === "string" ? Number(n) : n;
}

function validateSourceOfDemand(s: any): asserts s is SourceOfDemand {
  if (!s || typeof s !== "object") throw new Error("sourceOfDemand is required");
  const allowed = new Set<DemandType>(["SCHEDULED", "AD_HOC", "RETAIL_SALES", "RENTAL", "SERVICE"]);
  if (!allowed.has((s.type as DemandType))) throw new Error("sourceOfDemand.type invalid");
  if (s.refId != null && typeof s.refId !== "string") throw new Error("sourceOfDemand.refId must be a string if provided");
}

// ── Business rules
function makeEqualsSnapshot(input: EqualsInput, now: Date = new Date()): EqualsSnapshot {
  if (input.stage !== "BTDO") throw new Error('BTDO equals finalize requires stage="BTDO"');

  if (!["proposed", "approved", "confirmed", "draft"].includes(input.status)) {
    throw new Error("status must be one of: draft | proposed | approved | confirmed");
  }
  if (!input.dealId?.trim() || !input.number?.trim() || !input.currency?.trim()) {
    throw new Error("dealId, number, and currency are required");
  }
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    throw new Error("lines must contain at least one line");
  }

  validateSourceOfDemand(input.sourceOfDemand);

  // Validate totals are numeric and non-negative (allow 0 for draft)
  const { subtotal, taxTotal, total } = input.totals ?? {};
  for (const v0 of [subtotal, taxTotal, total]) {
    const v = asNum(v0 as any);
    if (!Number.isFinite(v) || v < 0) throw new Error("totals must be valid, non-negative numbers");
  }

  // Canonical, stringified numeric fields
  const canonical = canonicalize({
    dealId: input.dealId,
    number: input.number,
    stage: input.stage,             // "BTDO"
    status: input.status,
    orgId: input.orgId ?? null,
    locationId: input.locationId ?? null,
    customerId: input.customerId ?? null,
    vendorId: input.vendorId ?? null,
    currency: input.currency,

    sourceOfDemand: {
      type: input.sourceOfDemand.type,
      refId: input.sourceOfDemand.refId ?? null,
    },

    cadence: input.cadence ?? "28D",
    lines: input.lines.map((l) => ({
      sku: l.sku ?? null,
      itemName: l.itemName,
      qty: toStrNum(l.qty),
      unitPrice: toStrNum(l.unitPrice),
      taxRate: toStrNum(l.taxRate ?? "0"),
    })),
    totals: {
      subtotal: toStrNum(subtotal),
      taxTotal: toStrNum(taxTotal),
      total: toStrNum(total),
    },
    meta: input.meta ?? {},
  });

  return {
    dealId: input.dealId,
    at: now.toISOString(),
    stage: "BTDO",
    number: input.number,
    currency: input.currency,
    payload: canonical,
    hash: sha256(canonical),
    version: 2, // bumped to reflect sourceOfDemand addition
  };
}

// ── Route: POST /api/.../btdo/equals/finalize
export async function POST(req: Request) {
  try {
    const raw = await req.json();
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const input = raw as EqualsInput;
    const snap = makeEqualsSnapshot(input);

    // Persist to content-addressed file under .data/equals/
    const dir = pathResolve(process.cwd(), ".data", "equals");
    await mkdir(dir, { recursive: true });

    const filename = `${snap.dealId}-${snap.hash.slice(0, 16)}.json`;
    const filepath = pathJoin(dir, filename);

    // Write once; if exists, treat as idempotent success
    await writeFile(filepath, JSON.stringify(snap, null, 2), {
      encoding: "utf-8",
      flag: "wx",
    }).catch((err: any) => {
      if (err?.code === "EEXIST") return;
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
