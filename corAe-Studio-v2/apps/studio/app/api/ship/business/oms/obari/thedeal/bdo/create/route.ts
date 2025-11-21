// apps/studio/app/api/business/oms/obari/thedeal/bdo/create/route.ts

import { NextResponse } from "next/server";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";
import { PrismaClient } from "@prisma/client";

declare global { var __studio_prisma__: PrismaClient | undefined; }
const prisma: PrismaClient =
  global.__studio_prisma__ ?? (global.__studio_prisma__ = new PrismaClient());

type DemandType = "SCHEDULED" | "AD_HOC" | "RETAIL_SALES" | "RENTAL" | "SERVICE";
type Cadence = "28D" | "MONTHLY" | "HYBRID";

type BdoEqualsSnap = {
  dealId: string; at: string; stage: "BDO"; number: string; currency: string;
  payload: string; hash: string; version: number;
};
type BdoPayload = {
  stage: "BDO";
  status: "proposed" | "approved" | "confirmed";
  dealId: string; number: string; currency: string;
  cadence?: Cadence;
  sourceOfDemand?: { type: DemandType; refId?: string | null };
  orgId?: string | null; locationId?: string | null;
  customerId?: string | null; vendorId?: string | null;
  lines: Array<{ sku?: string | null; itemName: string; qty: string; unitPrice: string; taxRate?: string }>;
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
type AdHocBaton = { kind: "OBARI_AD_HOC"; dealId: string; at: string; dates: string[]; version: number };

type StockRow = {
  sku: string; itemName?: string; onHand: number; reserved?: number;
  reorderPoint?: number; preferredSupplierId?: string | null; packSize?: number | null; lastUpdatedAt?: string;
};
type SalesHint = { dealId: string; at: string; forecast?: Array<{ sku: string; multiplier: number }> };

type PostBody = { dealId: string; dateISO?: string; windowHours?: number; checkOnly?: boolean };

async function listFiles(dir: string): Promise<string[]> {
  try { return (await readdir(dir)).map(n => pathJoin(dir, n)); } catch { return []; }
}
async function listByPrefix(dir: string, prefix: string): Promise<string[]> {
  try { return (await readdir(dir)).filter(n => n.startsWith(prefix)).map(n => pathJoin(dir, n)); } catch { return []; }
}
async function readJsonSafe<T>(file: string): Promise<T | null> {
  try { return JSON.parse(await readFile(file, "utf-8")) as T; } catch { return null; }
}
function newestByAt<T extends { at?: string }>(files: Array<{ file: string; data: T }>) {
  if (!files.length) return null;
  files.sort((a,b) => (a.data.at ?? "") < (b.data.at ?? "") ? 1 : -1);
  return files[0];
}

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
  const [hh,mm] = (cutoffHHmm || "00:00").split(":").map(Number);
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh||0, mm||0, 0));
  const delta = cutoff.getTime() - now.getTime();
  return delta >= 0 && delta <= windowHrs*3600*1000;
}

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
    const belowReorder = (st?.reorderPoint != null) && effectiveFree < (st.reorderPoint as number);
    const pack = st?.packSize ?? null;
    const suggestedOrderQty =
      shortage > 0
        ? ceilToPack(shortage, pack)
        : (belowReorder ? ceilToPack((st!.reorderPoint as number) - effectiveFree, pack) : 0);
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

async function loadLatestBdoEquals(dealId: string) {
  const dir = pathResolve(process.cwd(), ".data", "equals");
  const files = await listByPrefix(dir, `${dealId}-`);
  const rows: Array<{file:string; data:BdoEqualsSnap}> = [];
  for (const f of files) {
    const j = await readJsonSafe<BdoEqualsSnap>(f);
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

async function saveAudit(orderCode: string, payload: unknown) {
  const dir = pathResolve(process.cwd(), ".data", "obari-orders");
  await mkdir(dir, { recursive: true });
  const file = pathJoin(dir, `${orderCode}.json`);
  await writeFile(file, JSON.stringify(payload, null, 2), "utf-8");
  return file;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "POST this route to create an OBARI order from a BDO '=' (with confirm + schedule/ad-hoc). Use { checkOnly:true } to dry-run.",
    expects: {
      dealId: "string (required)",
      dateISO: "YYYY-MM-DD (optional; defaults to today UTC)",
      windowHours: "number (optional; default 12)",
      checkOnly: "boolean (optional; if true, no DB writes)",
    },
    gates: [
      "BDO equals snapshot exists (stage:BDO)",
      "BDO confirm exists for equals hash",
      "Schedule/ad-hoc says needOrder within window",
      "If demand=RETAIL_SALES â†’ POS shortage required",
    ],
    files: {
      equals: ".data/equals/{dealId}-*.json",
      confirm: ".data/bdo-confirms/{dealId}-{hash16}.json",
      schedule: ".data/obari-order-schedule/{dealId}-*.json",
      adHoc: ".data/obari-ad-hoc/{dealId}-*.json",
      posStock: ".data/pos/stock/*.json",
      posSales: ".data/pos/sales/{dealId}-*.json",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;
    const dealId = body?.dealId?.trim();
    if (!dealId) return NextResponse.json({ ok: false, error: "dealId required" }, { status: 400 });

    const targetDate = body?.dateISO ? parseYMD(body.dateISO) : new Date();
    const windowHours = Number.isFinite(body?.windowHours as number) ? (body!.windowHours as number) : 12;
    const checkOnly = !!body?.checkOnly;

    const bdo = await loadLatestBdoEquals(dealId);
    if (!bdo) return NextResponse.json({ ok: false, error: "BDO equals snapshot not found" }, { status: 404 });

    const hash16 = bdo.snap.hash.slice(0,16);
    const confirm = await loadBdoConfirm(dealId, hash16);
    if (!confirm) return NextResponse.json({ ok: false, error: "BDO confirm not found for equals hash" }, { status: 409 });

    const schedule = await loadSchedule(dealId);
    const adHoc = await loadAdHoc(dealId);
    const sched = scheduleNeedOrder(schedule, adHoc, targetDate, windowHours);
    if (!sched.needOrder) {
      const gates = { equals:true, confirm:true, schedule:!!schedule, adHoc:!!adHoc };
      return NextResponse.json({ ok:false, error:"Not within launch window", reason:sched.reason, gates }, { status: 409 });
    }

    const demandType: DemandType = (bdo.payload?.sourceOfDemand?.type as DemandType) ?? "AD_HOC";
    const stockMap = await loadPosStock();
    const salesHint = await loadSalesHint(dealId);
    const prep = decidePoPlan(demandType, bdo.payload, stockMap, salesHint);
    if (demandType === "RETAIL_SALES" && !prep.needPurchase) {
      return NextResponse.json({ ok:false, error:"Retail sales demand has no purchase need today", reason:"no_purchase_needed" }, { status: 409 });
    }

    const first = bdo.payload.lines?.[0];
    const qtySum = (bdo.payload.lines || []).reduce((a, l) => {
      const q = Number(l.qty); return a + (Number.isFinite(q) ? q : 0);
    }, 0);
    const direction: "PURCHASE" | "SALES" =
      bdo.payload.vendorId && !bdo.payload.customerId ? "PURCHASE" : "SALES";
    const orderCodeBase = bdo.payload.number || `ORD-${dealId}`;

    if (checkOnly) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        willCreate: {
          code: orderCodeBase,
          direction,
          scheduleMode: schedule?.cadence ?? null,
          description: first?.itemName ?? (bdo.payload.meta?.["title"] as string | undefined) ?? "OBARI Order",
          qty: qtySum || null,
          unit: "unit",
          unitPrice: first ? Number(first.unitPrice) || 0 : 0,
          currency: bdo.payload.currency,
        },
        gates: { equals:true, confirm:true, schedule:!!schedule, adHoc:!!adHoc },
        reasons: { schedule: sched.reason, purchase: demandType === "RETAIL_SALES" ? (prep.needPurchase ? "shortage" : "no_purchase_needed") : "n/a" },
      });
    }

    let orderCode = orderCodeBase;
    let created: any;
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
  created = await (prisma as any).obariOrder.create({
          data: {
            code: orderCode,
            direction,
            expectedWeek: null,
            scheduleMode: schedule?.cadence ?? null,
            itemCode: first?.sku ?? null,
            description: first?.itemName ?? (bdo.payload.meta?.["title"] as string | undefined) ?? "OBARI Order",
            qty: qtySum || null,
            unit: "unit",
            unitPrice: first ? Number(first.unitPrice) || 0 : 0,
            currency: bdo.payload.currency,
            vendorCode: bdo.payload.vendorId ?? null,
            customerCode: bdo.payload.customerId ?? null,
          },
        });
        break;
      } catch (e: any) {
        if (e?.code === "P2002" && attempt < 2) {
          const ymd = toYMD(new Date()).replace(/-/g, "");
          orderCode = `${orderCodeBase}-${ymd}${attempt ? `-${attempt}` : ""}`;
          attempt++;
          continue;
        }
        throw e;
      }
    }

    await (prisma as any).orderEvent?.create?.({
      data: {
        orderId: created.id,
        stage: "ORDER",
        message: `Order created from BDO (${bdo.payload.number}); confirm ${hash16}`,
      },
    }).catch(() => {});

    const audit = {
      createdAt: new Date().toISOString(),
      dealId,
      orderId: created.id,
      orderCode: created.code,
      equalsFile: bdo.file.replace(process.cwd(), "."),
      confirmFile: `.data/bdo-confirms/${dealId}-${hash16}.json`,
      scheduleMode: schedule?.cadence ?? null,
      adHocIncluded: adHoc?.dates?.includes(toYMD(targetDate)) ?? false,
    };
    const auditFile = await saveAudit(created.code, audit);

    return NextResponse.json({ ok: true, order: created, auditFile: auditFile.replace(process.cwd(), ".") });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

