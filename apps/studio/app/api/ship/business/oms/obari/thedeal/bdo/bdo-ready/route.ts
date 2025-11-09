// OBARI ▸ BDO ▸ BDO-Ready — launch candidates for a target date
// Gates:
//  • BDO "=" present (stage:"BDO")
//  • BDO Confirm present (hash-coupled)
//  • Schedule/Ad-hoc window says "needOrder" for the date
//  • If demand is RETAIL_SALES, PO-Prep indicates purchase required
//
// FS layout (expected):
//  .data/equals/{dealId}-*.json
//  .data/bdo-confirms/{dealId}-{hash16}.json
//  .data/obari-order-schedule/{dealId}-*.json
//  .data/obari-ad-hoc/{dealId}-*.json
//  .data/pos/stock/*.json
//  .data/pos/sales/{dealId}-*.json

import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

/* ───────── Types ───────── */
type DemandType = "SCHEDULED" | "AD_HOC" | "RETAIL_SALES" | "RENTAL" | "SERVICE";
type Cadence = "28D" | "MONTHLY" | "HYBRID";

type BdoEquals = {
  dealId: string; at: string; stage: "BDO"; number: string; currency: string;
  payload: string; hash: string; version: number;
};
type BdoPayload = {
  stage: "BDO"; status: "proposed" | "approved" | "confirmed";
  dealId: string; number: string; currency: string; cadence?: Cadence;
  sourceOfDemand?: { type: DemandType; refId?: string | null };
  lines: Array<{ sku?: string | null; itemName: string; qty: string; unitPrice: string; taxRate: string; }>;
  totals?: { subtotal?: string; taxTotal?: string; total?: string };
  meta?: Record<string, unknown>;
};
type BdoConfirm = {
  kind: "BDO_CONFIRM"; dealId: string; at: string; bdoHash: string;
  number: string; currency: string; approvedBy: string; priceLock: true;
  signature: string; file: string; version: number;
};

type ScheduleBaton = {
  kind: "OBARI_ORDER_SCHEDULE";
  dealId: string; at: string; cadence: Cadence; anchorISO: string;
  dayCutoff?: string; includeWeekends?: boolean;
  exceptions?: string[]; additions?: string[]; version: number;
};
type AdHocBaton = { kind: "OBARI_AD_HOC"; dealId: string; at: string; dates: string[]; version: number; };

type StockRow = {
  sku: string; itemName?: string; onHand: number; reserved?: number;
  reorderPoint?: number; preferredSupplierId?: string | null; packSize?: number | null; lastUpdatedAt?: string;
};
type SalesHint = { dealId: string; at: string; forecast?: Array<{ sku: string; multiplier: number }>; };

type PostBody = { dateISO?: string; windowHours?: number };

/* ───────── FS helpers ───────── */
async function listFiles(dir: string): Promise<string[]> {
  try { return (await readdir(dir)).map(n => pathJoin(dir, n)); } catch { return []; }
}
async function listByPrefix(dir: string, prefix: string): Promise<string[]> {
  try { return (await readdir(dir)).filter(n=>n.startsWith(prefix)).map(n=>pathJoin(dir, n)); } catch { return []; }
}
async function readJsonSafe<T>(file: string): Promise<T | null> {
  try { return JSON.parse(await readFile(file, "utf-8")) as T; } catch { return null; }
}
function newestByAt<T extends { at?: string }>(files: Array<{ file: string; data: T }>) {
  if (!files.length) return null;
  files.sort((a,b) => (a.data.at ?? "") < (b.data.at ?? "") ? 1 : -1);
  return files[0];
}

/* ───────── date helpers (UTC YMD) ───────── */
function toYMD(d: Date): string {
  const y=d.getUTCFullYear(), m=String(d.getUTCMonth()+1).padStart(2,"0"), da=String(d.getUTCDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}
function parseYMD(s?: string): Date {
  if (!s) return new Date();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date(s);
  return new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
}
function addDays(d: Date, n: number) { const t=new Date(d.getTime()); t.setUTCDate(t.getUTCDate()+n); return t; }
function withinWindow(now: Date, cutoffHHmm: string | undefined, windowHrs: number): boolean {
  if (!cutoffHHmm) return true;
  const [hh,mm] = cutoffHHmm.split(":").map(Number);
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh||0, mm||0, 0));
  const delta = cutoff.getTime() - now.getTime();
  return delta >= 0 && delta <= windowHrs*3600*1000;
}

/* ───────── schedule calculators ───────── */
function next28From(anchor: Date, fromDate: Date): Date {
  const ms=86400000, diffDays=Math.floor((fromDate.getTime()-anchor.getTime())/ms);
  const k = diffDays<=0 ? 0 : Math.ceil(diffDays/28);
  return addDays(anchor, k*28);
}
function isMonthlyHit(anchor: Date, target: Date): boolean {
  return anchor.getUTCDate() === target.getUTCDate();
}
function scheduleNeedOrder(schedule: ScheduleBaton | null, adHoc: AdHocBaton | null, date: Date, windowHrs: number) {
  const ymd = toYMD(date);
  if (adHoc?.dates?.includes(ymd)) return { needOrder:true, reason:"ad_hoc", cutoff:null as string|null };
  if (!schedule) return { needOrder:false, reason:"no_schedule_baton", cutoff:null as string|null };

  if (schedule.exceptions?.includes(ymd)) return { needOrder:false, reason:"exception_day", cutoff:schedule.dayCutoff ?? null };
  if (schedule.additions?.includes(ymd)) return { needOrder:true, reason:"forced_addition", cutoff:schedule.dayCutoff ?? null };

  const anchor = parseYMD(schedule.anchorISO);
  let scheduled=false;
  if (schedule.cadence==="28D") scheduled = toYMD(next28From(anchor, date))===ymd;
  else if (schedule.cadence==="MONTHLY") scheduled = isMonthlyHit(anchor, date);
  else scheduled = (toYMD(next28From(anchor, date))===ymd) || isMonthlyHit(anchor, date);

  if (!scheduled) return { needOrder:false, reason:"not_scheduled_today", cutoff:schedule.dayCutoff ?? null };

  const inWindow = withinWindow(new Date(), schedule.dayCutoff, windowHrs);
  return { needOrder: inWindow, reason: inWindow ? "scheduled_and_within_window" : "scheduled_but_past_window", cutoff:schedule.dayCutoff ?? null };
}

/* ───────── POS helpers ───────── */
function toNum(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "string") { const n=Number(x); return Number.isFinite(n)?n:NaN; }
  return NaN;
}
function ceilToPack(q: number, p?: number|null) { if (!p || p<=0) return Math.ceil(q); return Math.ceil(q/p)*p; }

async function loadPosStock(): Promise<Record<string, StockRow>> {
  const dir = pathResolve(process.cwd(), ".data", "pos", "stock");
  const files = await listFiles(dir);
  const map: Record<string, StockRow> = {};
  for (const f of files) {
    const s = await readJsonSafe<StockRow>(f);
    if (s?.sku) {
      map[s.sku] = {
        sku: s.sku, itemName: s.itemName, onHand: Number.isFinite(s.onHand)?s.onHand:0,
        reserved: Number.isFinite(s.reserved ?? NaN) ? (s.reserved as number) : 0,
        reorderPoint: Number.isFinite(s.reorderPoint ?? NaN) ? (s.reorderPoint as number) : undefined,
        preferredSupplierId: s.preferredSupplierId ?? null,
        packSize: Number.isFinite(s.packSize ?? NaN) ? (s.packSize as number) : null,
        lastUpdatedAt: s.lastUpdatedAt,
      };
    }
  }
  return map;
}
async function loadSalesHint(dealId: string): Promise<SalesHint | null> {
  const dir = pathResolve(process.cwd(), ".data", "pos", "sales");
  const files = await listByPrefix(dir, `${dealId}-`);
  const rows: Array<{file:string; data: SalesHint}> = [];
  for (const f of files) { const j = await readJsonSafe<SalesHint>(f); if (j?.dealId===dealId) rows.push({file:f, data:j}); }
  const newest = newestByAt(rows);
  return newest?.data ?? null;
}

function decidePoPlan(demandType: DemandType, bdo: BdoPayload, stock: Record<string, StockRow>, hint: SalesHint | null) {
  const lines = Array.isArray(bdo.lines) ? bdo.lines : [];
  const forecastMap = new Map<string, number>();
  if (demandType === "RETAIL_SALES" && hint?.forecast?.length) {
    for (const h of hint.forecast) if (h?.sku && Number.isFinite(h.multiplier)) forecastMap.set(h.sku, h.multiplier);
  }
  const items: Array<{
    sku: string | null; itemName: string; requiredQty: number; onHand: number; reserved: number;
    effectiveFree: number; shortage: number; suggestedOrderQty: number; supplierId: string | null; packSize: number | null;
  }> = [];

  for (const l of lines) {
    const sku = (l.sku ?? null) as string | null;
    const baseQty = toNum(l.qty);
    if (!Number.isFinite(baseQty) || baseQty<=0) continue;

    const mult = sku ? (forecastMap.get(sku) ?? 1) : 1;
    const requiredQty = +(baseQty * mult);
    const st = sku ? stock[sku] : undefined;

    const onHand = st?.onHand ?? 0;
    const reserved = st?.reserved ?? 0;
    const effectiveFree = Math.max(0, onHand - reserved);
    const shortage = Math.max(0, +(requiredQty - effectiveFree));

    const pack = st?.packSize ?? null;
    const suggestedOrderQty = shortage > 0 ? ceilToPack(shortage, pack) : 0;

    items.push({
      sku, itemName: l.itemName,
      requiredQty: +requiredQty.toFixed(3),
      onHand, reserved, effectiveFree,
      shortage: +shortage.toFixed(3),
      suggestedOrderQty, supplierId: st?.preferredSupplierId ?? null,
      packSize: pack,
    });
  }
  const needPurchase = items.some(i => i.suggestedOrderQty > 0);
  return { needPurchase, items };
}

/* ───────── core loaders ───────── */
async function loadLatestBdoEquals(dealId: string) {
  const dir = pathResolve(process.cwd(), ".data", "equals");
  const files = await listByPrefix(dir, `${dealId}-`);
  const rows: Array<{file:string; data:BdoEquals}> = [];
  for (const f of files) {
    const j = await readJsonSafe<BdoEquals>(f);
    if (j?.dealId===dealId && j.stage==="BDO" && typeof j.payload==="string") rows.push({file:f, data:j});
  }
  const newest = newestByAt(rows);
  if (!newest) return null;
  let payload: BdoPayload | null = null;
  try { payload = JSON.parse(newest.data.payload) as BdoPayload; } catch { payload = null; }
  if (!payload) return null;
  return { file: newest.file, snap: newest.data, payload };
}
async function loadBdoConfirm(dealId: string, hash16: string): Promise<BdoConfirm | null> {
  const dir = pathResolve(process.cwd(), ".data", "bdo-confirms");
  const file = pathJoin(dir, `${dealId}-${hash16}.json`);
  return await readJsonSafe<BdoConfirm>(file);
}
async function loadSchedule(dealId: string): Promise<ScheduleBaton | null> {
  const dir = pathResolve(process.cwd(), ".data", "obari-order-schedule");
  const files = await listByPrefix(dir, `${dealId}-`);
  const rows: Array<{file:string; data:ScheduleBaton}> = [];
  for (const f of files) { const j = await readJsonSafe<ScheduleBaton>(f); if (j?.kind==="OBARI_ORDER_SCHEDULE") rows.push({file:f, data:j}); }
  const newest = newestByAt(rows);
  return newest?.data ?? null;
}
async function loadAdHoc(dealId: string): Promise<AdHocBaton | null> {
  const dir = pathResolve(process.cwd(), ".data", "obari-ad-hoc");
  const files = await listByPrefix(dir, `${dealId}-`);
  const rows: Array<{file:string; data:AdHocBaton}> = [];
  for (const f of files) { const j = await readJsonSafe<AdHocBaton>(f); if (j?.kind==="OBARI_AD_HOC") rows.push({file:f, data:j}); }
  const newest = newestByAt(rows);
  return newest?.data ?? null;
}

/* ───────── Route ───────── */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(()=>({}))) as PostBody | undefined;
    const dateISO = body?.dateISO;
    const windowHours = Number.isFinite(body?.windowHours as number) ? (body!.windowHours as number) : 12;

    const targetDate = dateISO ? parseYMD(dateISO) : new Date();

    const equalsDir = pathResolve(process.cwd(), ".data", "equals");
    const eqFiles = await listFiles(equalsDir);

    const byDeal = new Map<string, string[]>();
    for (const f of eqFiles) {
      const name = f.split(/[\\/]/).pop() || "";
      const m = /^(.+?)-[0-9a-f]{1,}\.json$/i.exec(name);
      if (!m) continue;
      const dealId = m[1];
      const arr = byDeal.get(dealId) ?? [];
      arr.push(f);
      byDeal.set(dealId, arr);
    }

    const stockMap = await loadPosStock();

    const all: Array<any> = [];

    for (const dealId of byDeal.keys()) {
      const bdo = await loadLatestBdoEquals(dealId);
      if (!bdo) continue;

      const hash16 = bdo.snap.hash.slice(0,16);
      const confirm = await loadBdoConfirm(dealId, hash16);
      if (!confirm) continue;

      const schedule = await loadSchedule(dealId);
      const adHoc = await loadAdHoc(dealId);

      const gates = {
        hasBdoEquals: true,
        hasBdoConfirm: !!confirm,
        hasSchedule: !!schedule,
        hasAdHoc: !!adHoc,
      };

      const sched = scheduleNeedOrder(schedule, adHoc, targetDate, windowHours);

      const demandType: DemandType = (bdo.payload?.sourceOfDemand?.type as DemandType) ?? "AD_HOC";
      const salesHint = await loadSalesHint(dealId);
      const prep = decidePoPlan(demandType, bdo.payload, stockMap, salesHint);

      const demandNeedsPurchase = (demandType === "RETAIL_SALES");
      const launchable = confirm
        && sched.needOrder
        && (!demandNeedsPurchase || prep.needPurchase || sched.reason === "ad_hoc" || sched.reason === "forced_addition");

      all.push({
        dealId,
        number: bdo.payload.number,
        currency: bdo.payload.currency,
        demand: { type: demandType, refId: bdo.payload?.sourceOfDemand?.refId ?? null },
        needOrder: sched.needOrder,
        needPurchase: prep.needPurchase,
        launchable,
        gates,
        pointers: {
          equals: bdo.file.replace(process.cwd(), "."),
          confirm: confirm.file ?? `.data/bdo-confirms/${dealId}-${hash16}.json`,
          schedule: schedule ? `.data/obari-order-schedule/${dealId}-(*)` : null,
          adHoc: adHoc ? `.data/obari-ad-hoc/${dealId}-(*)` : null,
        },
        reasons: {
          schedule: sched.reason,
          purchase: demandNeedsPurchase ? (prep.needPurchase ? "shortage_or_reorder" : "no_purchase_needed") : "not_required_for_demand_type",
        },
      });
    }

    const bdoReady = all.filter(i => i.launchable);

    return NextResponse.json({
      ok: true,
      date: toYMD(targetDate),
      counts: { candidates: all.length, ready: bdoReady.length },
      bdoReady,
      all,
    });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}