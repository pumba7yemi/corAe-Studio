// apps/studio/app/api/ship/business/oms/bdo/equals/finalize/route.ts
// BDO — Equals Finalize (Birth of the executable order) with sourceOfDemand
// Role: Take the final BTDO output (now a BDO order), canonize, and emit the BDO BASE "=" snapshot.
// Notes: Filesystem-only; immutable write; idempotent on same payload.

import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";
import { createHash } from "node:crypto";

// ---------- Types (local; no aliases) ----------
type DemandType = "SCHEDULED" | "AD_HOC" | "RETAIL_SALES" | "RENTAL" | "SERVICE";

type SourceOfDemand = {
  type: DemandType;
  refId?: string | null; // e.g., plan id, sales batch id, contract id
};

type Line = {
  sku?: string | null;
  itemName: string;
  qty: string | number;
  unitPrice: string | number;
  taxRate?: string | number; // 0..1
};

type BdoFinalizeBody = {
  // Spine & status
  dealId: string;                 // One-spine ID
  number: string;                 // BDO human code
  stage: "BDO";                   // must be BDO
  status: "proposed" | "approved" | "confirmed";

  // Parties / context
  orgId?: string | null;
  locationId?: string | null;
  customerId?: string | null;
  vendorId?: string | null;

  // Source of demand (NEW)
  sourceOfDemand: SourceOfDemand;

  // Commercials
  currency: string;               // e.g., AED
  cadence?: "28D" | "MONTHLY" | "HYBRID";
  lines: Line[];
  totals: {
    subtotal: string | number;
    taxTotal: string | number;
    total: string | number;
  };

  // Free-form metadata (pricing notes, references, etc.)
  meta?: Record<string, unknown>;
};

type EqualsSnapshot = {
  dealId: string;
  at: string;                     // ISO timestamp
  stage: "BDO";
  number: string;                 // BDO human code
  currency: string;
  payload: string;                // canonical JSON (stringified)
  hash: string;                   // sha256(payload)
  version: number;                // schema version
};

// ---------- Canonicalization ----------
function sortKeysDeep(v: any): any {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeysDeep(v[k]);
    return out;
  }
  return v;
}
function canonicalize(obj: unknown): string {
  return JSON.stringify(sortKeysDeep(obj));
}
function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
function toNum(x: string | number): number {
  return typeof x === "number" ? x : Number(x);
}
function toStrNum(x: string | number | undefined | null, def = "0"): string {
  if (x === undefined || x === null) return def;
  if (typeof x === "number") return Number.isFinite(x) ? String(x) : def;
  const n = Number(x);
  return Number.isFinite(n) ? String(n) : def;
}

function validateSourceOfDemand(s: any): asserts s is SourceOfDemand {
  if (!s || typeof s !== "object") throw new Error("sourceOfDemand is required");
  const t = s.type as string;
  const allowed = new Set(["SCHEDULED", "AD_HOC", "RETAIL_SALES", "RENTAL", "SERVICE"]);
  if (!allowed.has(t)) throw new Error("sourceOfDemand.type invalid");
  if (s.refId != null && typeof s.refId !== "string") throw new Error("sourceOfDemand.refId must be a string if provided");
}

// ---------- Business rules ----------
function makeBdoEquals(input: BdoFinalizeBody, now = new Date()): EqualsSnapshot {
  if (input.stage !== "BDO") throw new Error('stage must be "BDO"');
  if (!["proposed", "approved", "confirmed"].includes(input.status)) {
    throw new Error('status must be "proposed" | "approved" | "confirmed"');
  }
  if (!input.dealId?.trim() || !input.number?.trim()) {
    throw new Error("dealId and number are required");
  }
  if (!input.currency?.trim()) throw new Error("currency is required");
  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    throw new Error("lines must contain at least one line");
  }

  validateSourceOfDemand(input.sourceOfDemand);

  // Validate totals are non-negative numbers
  const sub = toNum(input.totals.subtotal);
  const tax = toNum(input.totals.taxTotal);
  const tot = toNum(input.totals.total);
  if (![sub, tax, tot].every((n) => Number.isFinite(n) && n >= 0)) {
    throw new Error("totals must be valid, non-negative numbers");
  }

  // Canonical payload (numbers as strings for deterministic hashing)
  const canonical = canonicalize({
    dealId: input.dealId,
    number: input.number,
    stage: "BDO",
    status: input.status,
    orgId: input.orgId ?? null,
    locationId: input.locationId ?? null,
    customerId: input.customerId ?? null,
    vendorId: input.vendorId ?? null,

    // NEW: carry demand origin forward
    sourceOfDemand: {
      type: input.sourceOfDemand.type,
      refId: input.sourceOfDemand.refId ?? null,
    },

    currency: input.currency,
    cadence: input.cadence ?? "28D",
    lines: input.lines.map((l) => ({
      sku: l.sku ?? null,
      itemName: l.itemName,
      qty: toStrNum(l.qty),
      unitPrice: toStrNum(l.unitPrice),
      taxRate: toStrNum(l.taxRate ?? "0"),
    })),
    totals: {
      subtotal: toStrNum(input.totals.subtotal),
      taxTotal: toStrNum(input.totals.taxTotal),
      total: toStrNum(input.totals.total),
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
    version: 2, // bump schema version due to sourceOfDemand addition
  };
}

// ---------- Route ----------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BdoFinalizeBody;

    // Build snapshot (throws on validation errors)
    const snap = makeBdoEquals(body);

    // Persist write-once under .data/equals/
    const dir = pathResolve(process.cwd(), ".data", "equals");
    await mkdir(dir, { recursive: true });

    const filename = `${snap.dealId}-${snap.hash.slice(0, 16)}.json`;
    const filepath = pathJoin(dir, filename);

    // Write-once; idempotent if same payload
    await writeFile(filepath, JSON.stringify(snap, null, 2), {
      encoding: "utf-8",
      flag: "wx",
    }).catch((err: any) => {
      if (err?.code === "EEXIST") return; // same content already saved
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
      payload: snap.payload, // canonical JSON string (clients may parse)
    });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
