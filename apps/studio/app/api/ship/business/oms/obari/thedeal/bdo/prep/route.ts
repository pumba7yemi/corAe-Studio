// OBARI — BDO Prep Engine (unified SO/PO)
// apps/ship/business/oms/obari/thedeal/orders/bdo/prep/route.ts

export type Minor = number;
export type Cadence =
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "EVERY_3_WEEKS"
  | "EVERY_4_WEEKS"
  | "MONTHLY"
  | "QUARTERLY"
  | "BIANNUAL"
  | "ANNUAL";

export interface BdoLine {
  sku: string;
  title: string;
  qty: number;
  uom?: string;
  unit_price: Minor;
  sector_hint?: "pallets" | "recyclables" | "machinery" | "consumables" | "service" | "other";
}

export interface BdoOrderDraft {
  bdo_id: string;
  direction: "inbound" | "outbound"; // inbound=PO, outbound=SO
  counterparty: { id: string; name: string; site_id?: string; site_name?: string };
  our_party: { id: string; name: string };
  schedule: { kind: "scheduled"; rule: Cadence; day?: string; window?: string } | { kind: "ad_hoc" };
  transport: { in_quote: boolean; mode?: "vendor" | "third_party" | "client" };
  lines: BdoLine[];
  geography?: { country: string; region?: string; postcode?: string };
  references?: { quote_id?: string; product_ids?: string[]; client_po?: string };
  notes?: string;
}

export interface StockCheckInput {
  sku: string;
  location_hint?: string;
  quantity: number;
  sector_hint?: BdoLine["sector_hint"];
}

export interface StockCheckResult {
  sku: string;
  ok: boolean;
  reason?: "OOS" | "LEADTIME" | "N/A_SERVICE" | "N/A_COLLECTION";
  suggested_eta_iso?: string;
}

export interface SendEmailInput {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
}

export interface PrepRecord {
  event_id: string;
  bdo_id: string;
  timestamp_iso: string;
  classification: "scheduled" | "ad_hoc";
  direction: "inbound" | "outbound";
  stock_summary: { total: number; ok: number; fail: number };
  transport_flag: "CDIQ" | "CDC" | "CDN";
  email_meta: { subject: string; to: string[] };
  totals_minor: { ex_vat: Minor; lines: number };
}

import { NextResponse } from "next/server";
import { prepareBdoOrder, BdoPrepDeps } from "./prepare";

// Minimal route: export only HTTP handlers to satisfy Next's typegen constraints.
export async function POST(request: Request) {
  const draft: BdoOrderDraft = await request.json();

  const deps: BdoPrepDeps = {
    stockAdapter: async (q) => ({ sku: q.sku, ok: true }),
    mailerAdapter: async () => ({ ok: true }),
    registryAdapter: async () => undefined,
    contactResolver: async () => ({ to: ["ops@example.com"] }),
  };

  try {
    const rec = await prepareBdoOrder(draft, deps);
    return NextResponse.json({ ok: true, rec });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}