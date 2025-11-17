// apps/studio/app/api/wizard/first-trade/submit/route.ts
// corAe — First Trade → persist to Prisma → call OBARI Staging
//
// POST: { state: FirstTradeStateLike }
//   - Writes FirstDeal (header) with skuSet[]
//   - Calls /api/business/oms/obari/order/staging with mapped BDO draft
//   - On success, writes BdoRecord snapshot
//   - Returns { ok, tradeId, snapshot }
//
// Notes:
// - Matches schema in apps/studio/prisma/schema/first-trade.prisma
// - Money to OBARI is minor units (pence/cents)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ----------------------------- Types (light) ----------------------------- */
type LineIn = {
  sku?: string;
  title?: string;
  qty?: number | string;
  uom?: string;
  unitPriceMajor?: number | string; // e.g. 12.34
  sector?: "pallets" | "recyclables" | "machinery" | "consumables" | "service" | "other";
};

type FirstTradeStateLike = {
  companyId?: string; // <- required by FirstDeal schema (CompanyIdentity.id)
  companyMode?: "sales" | "procurement";
  ourParty?: { id?: string; name?: string };
  counterparty?: { id?: string; name?: string; siteId?: string; siteName?: string };
  schedule?: { kind?: "scheduled" | "ad_hoc"; rule?: string; day?: string; window?: string };
  transport?: { inQuote?: boolean; mode?: "vendor" | "third_party" | "client" };
  geography?: { country?: string; region?: string; postcode?: string };
  references?: { clientPO?: string; quoteId?: string; productIds?: string[] };
  pricingModel?: "A+X" | "fixed";
  partyName?: string; // for UI shortcut
  notes?: string;
  lines?: LineIn[];
};

type BdoLine = {
  sku: string;
  title: string;
  qty: number;
  uom?: string;
  unit_price: number; // minor
  sector_hint?: "pallets" | "recyclables" | "machinery" | "consumables" | "service" | "other";
};

type BdoOrderDraft = {
  bdo_id: string;
  direction: "inbound" | "outbound";
  counterparty: { id: string; name: string };
  our_party: { id: string; name: string };
  schedule:
    | { kind: "scheduled"; rule: string; day?: string; window?: string }
    | { kind: "ad_hoc" };
  transport: { in_quote: boolean; mode?: "vendor" | "third_party" | "client" };
  lines: BdoLine[];
  geography?: { country: string; region: string; postcode: string };
  references?: { quote_id?: string; product_ids?: string[]; client_po?: string };
  notes?: string;
};

/* -------------------------------- Utils --------------------------------- */
const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const toMinor = (n: unknown) => Math.round(Number(n ?? 0) * 100);
const asNum = (n: unknown, d = 0) => (Number.isFinite(Number(n)) ? Number(n) : d);
const directionOf = (mode?: string): "inbound" | "outbound" =>
  String(mode || "sales").toLowerCase() === "procurement" ? "inbound" : "outbound";
const partyTypeOf = (mode?: string): "vendor" | "customer" =>
  directionOf(mode) === "inbound" ? "vendor" : "customer";

const mapCadence = (rule?: string) => {
  const r = String(rule || "").toUpperCase();
  const allowed = new Set([
    "WEEKLY",
    "FORTNIGHTLY",
    "EVERY_3_WEEKS",
    "EVERY_4_WEEKS",
    "MONTHLY",
    "QUARTERLY",
    "BIANNUAL",
    "ANNUAL",
  ]);
  return allowed.has(r) ? r : "EVERY_4_WEEKS";
};

const mapPricing = (p?: string): "A_PLUS_X" | "FIXED" =>
  String(p || "").toUpperCase().replace("+", "_PLUS_") === "A_PLUS_X" ? "A_PLUS_X" : "FIXED";

/* ----------------------- Map Wizard → OBARI (BDO) ----------------------- */
function buildBdo(state: FirstTradeStateLike): BdoOrderDraft {
  const direction = directionOf(state.companyMode);
  const schedule =
    state.schedule?.kind === "ad_hoc"
      ? { kind: "ad_hoc" as const }
      : {
          kind: "scheduled" as const,
          rule: mapCadence(state.schedule?.rule),
          day: state.schedule?.day || undefined,
          window: state.schedule?.window || undefined,
        };

  const lines: BdoLine[] =
    (state.lines || []).map((l) => ({
      sku: (l.sku || "Product0001").trim(),
      title: (l.title || l.sku || "Product").trim(),
      qty: asNum(l.qty, 1),
      uom: l.uom || "EA",
      unit_price: toMinor(l.unitPriceMajor),
      sector_hint: (l.sector as BdoLine["sector_hint"]) || "other",
    })) || [];

  return {
    bdo_id: id("BDO"),
    direction,
    counterparty: {
      id: state.counterparty?.id || (direction === "inbound" ? "Vendor0001" : "Customer0001"),
      name: state.counterparty?.name || (direction === "inbound" ? "Vendor 0001" : "Customer 0001"),
    },
    our_party: {
      id: state.ourParty?.id || "OPS",
      name: state.ourParty?.name || "Operations",
    },
    schedule,
    transport: {
      in_quote: Boolean(state.transport?.inQuote),
      mode: state.transport?.mode || "third_party",
    },
    lines: lines.length
      ? lines
      : [{ sku: "Product0001", title: "Seed Item", qty: 1, uom: "EA", unit_price: 100 }],
    geography: {
      country: state.geography?.country || "UK",
      region: state.geography?.region || "GEN",
      postcode: state.geography?.postcode || "GEN1",
    },
    references: {
      quote_id: state.references?.quoteId || undefined,
      product_ids: state.references?.productIds || undefined,
      client_po: state.references?.clientPO || undefined,
    },
    notes: state.notes || undefined,
  };
}

/* --------------------------------- POST --------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const state = (body?.state ?? body) as FirstTradeStateLike;

    // Guard: CompanyIdentity linkage is required by the schema
    const companyId = String(state.companyId || "").trim();
    if (!companyId) {
      return NextResponse.json(
        { ok: false, error: "companyId is required (CompanyIdentity.id)" },
        { status: 400 }
      );
    }

    // 1) Persist header (FirstDeal) — lines collapse to skuSet for MVP
    const created = await prisma.firstDeal.create({
      data: {
        companyId,
        mode: "survey", // UI can set "visit" later if you expose it
        partyType: partyTypeOf(state.companyMode),
        partyName:
          state.partyName ||
          state.counterparty?.name ||
          (partyTypeOf(state.companyMode) === "vendor" ? "Vendor 0001" : "Customer 0001"),
        pricingModel: mapPricing(state.pricingModel),
        skuSet: (state.lines || [])
          .map((l) => (l.sku || "").trim())
          .filter(Boolean)
          .slice(0, 200), // safety cap
        status: "draft",
      },
    });

    // 2) Build OBARI BDO draft from the state
    const bdo = buildBdo(state);

    // 3) Call OBARI Staging to mint snapshot + order numbers
    const res = await fetch("/api/business/oms/obari/order/staging", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bdo),
    });

    const data = await res.json().catch(() => ({}));

    // 4) If staging OK, write BdoRecord (snapshot)
    if (res.ok && data?.ok) {
      const snapshot = data.snapshot as
        | { snapshot_id?: string; order_numbers?: { po_no?: string; so_no?: string }; direction?: string }
        | undefined;

      const reference =
        snapshot?.snapshot_id ||
        snapshot?.order_numbers?.po_no ||
        snapshot?.order_numbers?.so_no ||
        id("BDOREF");

      await prisma.bdoRecord.create({
        data: {
          dealId: created.id,
          reference,
          stage: "ORDER",
          remarks: `OBARI staged ${snapshot?.direction || bdo.direction}`,
          autoGenerated: true,
        },
      });

      return NextResponse.json({ ok: true, tradeId: created.id, snapshot });
    }

    // Soft-fail: we already persisted the FirstDeal header
    return NextResponse.json(
      {
        ok: false,
        tradeId: created.id,
        error:
          data?.error ||
          "Staging failed (OBARI). Your FirstDeal was saved; retry staging later.",
      },
      { status: 502 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "failed to submit first trade" },
      { status: 400 }
    );
  }
}