// apps/studio/app/api/ship/business/oms/obari/order/prep/decide/route.ts
// OBARI — Order ▸ PO-Prep Decide
// Reads BDO "=" (commercial demand) and POS stock snapshots, then decides whether to start PO prep.
// FS layout expected:
//   .data/equals/{dealId}-*.json                ← latest BDO "=" (stage:"BDO")
//   .data/pos/stock/*.json                      ← per-SKU stock snapshots { sku, onHand, reserved, reorderPoint? }
//   .data/pos/sales/{dealId}-*.json (optional)  ← sales hints or forecast per deal (to bias demand)
// No DB writes. No aliases.

import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

type BdoEquals = {
  dealId: string;
  at: string;
  stage: "BDO";
  number: string;
  currency: string;
  payload: string; // canonical JSON
  hash: string;
  version: number;
};

type BdoPayload = {
  stage: "BDO";
  status: "proposed" | "approved" | "confirmed";
  dealId: string;
  number: string;
  currency: string;
  cadence?: "28D" | "MONTHLY" | "HYBRID";
  lines: Array<{
    sku?: string | null;
    itemName: string;
    qty: string;        // canonicalized as string
    unitPrice: string;
    taxRate: string;
  }>;
  totals?: { subtotal?: string; taxTotal?: string; total?: string };
  meta?: Record<string, unknown>;
};

type StockRow = {
  sku: string;
  itemName?: string;
  onHand: number;          // current stock
  reserved?: number;       // allocated to other orders
  reorderPoint?: number;   // when stock dips below this, buy
  preferredSupplierId?: string | null;
  packSize?: number | null; // rounding up to packs
  lastUpdatedAt?: string;
};

type SalesHint = {
  dealId: string;
  at: string;
  // Optional forecast multipliers per sku for today (e.g., uplift factor 0.8..1.2)
  forecast?: Array<{ sku: string; multiplier: number }>;
};

type PostBody = {
  dealId: string;
  dateISO?: string; // if provided, can be used by future enhancement (e.g., day-of-week patterns)
};

// ---------- FS helpers ----------
async function listFiles(dir: string, startsWith?: string): Promise<string[]> {
  try {
    const names = await readdir(dir);
    const files = names.filter(n => n.endsWith(".json") && (!startsWith || n.startsWith(startsWith)));
    return files.map(n => pathJoin(dir, n));
  } catch {
    return [];
  }
}
async function readJsonSafe<T>(p: string): Promise<T | null> {
  try {
    const raw = await readFile(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function newestByAt<T extends { at?: string }>(rows: Array<{ file: string; data: T }>): { file: string; data: T } | null {
  if (!rows.length) return null;
  rows.sort((a, b) => {
    const aa = a.data.at ?? "";
    const bb = b.data.at ?? "";
    return aa < bb ? 1 : aa > bb ? -1 : 0;
  });
  return rows[0];
}

// ---------- math helpers ----------
function toNum(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "string") {
    const n = Number(x);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}
function ceilToPack(qty: number, pack?: number | null): number {
  if (!pack || pack <= 0) return Math.ceil(qty);
  return Math.ceil(qty / pack) * pack;
}

// ---------- core ----------
async function loadLatestBdoEquals(dealId: string): Promise<{ file: string; snap: BdoEquals; payload: BdoPayload } | null> {
  const dir = pathResolve(process.cwd(), ".data", "equals");
  const files = await listFiles(dir, `${dealId}-`);
  const candidates: Array<{ file: string; data: BdoEquals }> = [];
  for (const f of files) {
    const j = await readJsonSafe<BdoEquals>(f);
    if (j && j.dealId === dealId && j.stage === "BDO" && typeof j.payload === "string") {
      candidates.push({ file: f, data: j });
    }
  }
  const newest = newestByAt(candidates);
  if (!newest) return null;

  const payload = await readJsonSafe<BdoPayload>(newest.data.payload as unknown as string).catch?.(() => null);
  // The above will fail because payload is a JSON string, so parse explicitly:
  let parsed: BdoPayload | null = null;
  try { parsed = JSON.parse(newest.data.payload) as BdoPayload; } catch { parsed = null; }

  if (!parsed) return null;
  return { file: newest.file, snap: newest.data, payload: parsed };
}

async function loadPosStock(): Promise<Record<string, StockRow>> {
  const dir = pathResolve(process.cwd(), ".data", "pos", "stock");
  const files = await listFiles(dir);
  const map: Record<string, StockRow> = {};
  for (const f of files) {
    const s = await readJsonSafe<StockRow>(f);
    if (!s?.sku) continue;
    map[s.sku] = {
      sku: s.sku,
      itemName: s.itemName,
      onHand: Number.isFinite(s.onHand) ? s.onHand : 0,
      reserved: Number.isFinite(s.reserved ?? NaN) ? (s.reserved as number) : 0,
      reorderPoint: Number.isFinite(s.reorderPoint ?? NaN) ? (s.reorderPoint as number) : undefined,
      preferredSupplierId: s.preferredSupplierId ?? null,
      packSize: Number.isFinite(s.packSize ?? NaN) ? (s.packSize as number) : null,
      lastUpdatedAt: s.lastUpdatedAt,
    };
  }
  return map;
}

async function loadSalesHint(dealId: string): Promise<SalesHint | null> {
  const dir = pathResolve(process.cwd(), ".data", "pos", "sales");
  const files = await listFiles(dir, `${dealId}-`);
  const rows: Array<{ file: string; data: SalesHint }> = [];
  for (const f of files) {
    const j = await readJsonSafe<SalesHint>(f);
    if (j?.dealId === dealId) rows.push({ file: f, data: j });
  }
  const newest = newestByAt(rows);
  return newest?.data ?? null;
}

function decidePoPlan(bdo: BdoPayload, stock: Record<string, StockRow>, hint: SalesHint | null) {
  const lines = Array.isArray(bdo.lines) ? bdo.lines : [];
  const forecastMap = new Map<string, number>();
  if (hint?.forecast?.length) {
    for (const h of hint.forecast) {
      if (h?.sku && Number.isFinite(h.multiplier)) forecastMap.set(h.sku, h.multiplier);
    }
  }

  const items: Array<{
    sku: string | null;
    itemName: string;
    requiredQty: number;      // demand (possibly forecast-adjusted)
    onHand: number;
    reserved: number;
    effectiveFree: number;    // onHand - reserved
    shortage: number;         // required - effectiveFree (>=0)
    suggestedOrderQty: number;// rounded to pack, >= shortage
    supplierId: string | null;
    packSize: number | null;
    reason: "below_reorder" | "shortage" | "both";
  }> = [];

  for (const l of lines) {
    const sku = (l.sku ?? null) as string | null;
    const baseQty = toNum(l.qty);
    if (!Number.isFinite(baseQty) || baseQty <= 0) continue;

    // Forecast bias (if any)
    const mult = sku ? (forecastMap.get(sku) ?? 1) : 1;
    const requiredQty = +(baseQty * mult);
    const st = sku ? stock[sku] : undefined;

    const onHand = st?.onHand ?? 0;
    const reserved = st?.reserved ?? 0;
    const effectiveFree = Math.max(0, onHand - reserved);

    const shortage = Math.max(0, +(requiredQty - effectiveFree));
    const belowReorder = (st?.reorderPoint != null) && effectiveFree < (st!.reorderPoint as number);

    const pack = st?.packSize ?? null;
    const suggestedOrderQty = shortage > 0 ? ceilToPack(shortage, pack) : (belowReorder ? ceilToPack((st!.reorderPoint as number) - effectiveFree, pack) : 0);

    const reason = shortage > 0 && belowReorder ? "both" : shortage > 0 ? "shortage" : belowReorder ? "below_reorder" : "shortage";

    items.push({
      sku,
      itemName: l.itemName,
      requiredQty: +requiredQty.toFixed(3),
      onHand,
      reserved,
      effectiveFree,
      shortage: +shortage.toFixed(3),
      suggestedOrderQty,
      supplierId: st?.preferredSupplierId ?? null,
      packSize: pack,
      reason,
    });
  }

  const needPurchase = items.some(i => i.suggestedOrderQty > 0);
  return { needPurchase, items };
}

// ---------- Route ----------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;
    const dealId = body?.dealId?.trim();
    if (!dealId) return NextResponse.json({ ok: false, error: "dealId is required" }, { status: 400 });

    // Load sources
    const bdo = await loadLatestBdoEquals(dealId);
    if (!bdo) return NextResponse.json({ ok: false, error: "BDO '=' not found" }, { status: 404 });

    const [stockMap, salesHint] = await Promise.all([loadPosStock(), loadSalesHint(dealId)]);

    const plan = decidePoPlan(bdo.payload, stockMap, salesHint);

    return NextResponse.json({
      ok: true,
      needPurchase: plan.needPurchase,
      plan: {
        currency: bdo.payload.currency,
        number: bdo.payload.number,
        items: plan.items,
      },
      sources: {
        bdoEquals: { file: bdo.file.replace(process.cwd(), "."), hash: bdo.snap.hash, at: bdo.snap.at },
        stockCount: Object.keys(stockMap).length,
        salesHintAt: salesHint?.at ?? null,
      },
    });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
