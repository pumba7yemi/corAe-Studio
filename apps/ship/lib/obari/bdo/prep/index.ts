// OBARI — BDO Prep (Unified SO/PO)
// Single entrypoint used by API routes to prepare an order prior to booking.
// Direction:
//  - "inbound"  = PURCHASE (we buy from a vendor → PO email to vendor)
//  - "outbound" = SALES    (we sell to a client → SO email to client)
//
// Responsibilities
//  1) Classify timing (scheduled vs ad_hoc) from draft.schedule
//  2) Run quick sector-aware stock/availability checks (no reservations)
//  3) Compute transport policy flag (CDIQ/CDC/CDN)
//  4) Compose and send the appropriate email (vendor/client facing)
//  5) Persist an audit PrepRecord

/* ─────────────────────────── Types ─────────────────────────── */

export type Minor = number; // pence/cents

export type Cadence =
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "EVERY_3_WEEKS"
  | "EVERY_4_WEEKS"
  | "MONTHLY"
  | "QUARTERLY"
  | "BIANNUAL"
  | "ANNUAL";

export type Direction = "inbound" | "outbound";

export interface BdoLine {
  sku: string;
  title: string;
  qty: number;
  uom?: string;
  unit_price: Minor; // snapshot from accepted quote/product
  sector_hint?: "pallets" | "recyclables" | "machinery" | "consumables" | "service" | "other";
}

export interface BdoOrderDraft {
  bdo_id: string;
  direction: Direction;
  our_party: { id: string; name: string };
  counterparty: { id: string; name: string; site_id?: string; site_name?: string };
  schedule:
    | { kind: "scheduled"; rule: Cadence; day?: string; window?: string }
    | { kind: "ad_hoc" };
  transport: { in_quote: boolean; mode?: "vendor" | "third_party" | "client" };
  lines: BdoLine[];
  geography?: { country: string; region?: string; postcode?: string };
  references?: { quote_id?: string; product_ids?: string[]; client_po?: string };
  notes?: string;
}

export interface StockCheckInput {
  sku: string;
  location_hint?: string; // region/postcode/depot
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
  transport_flag: "CDIQ" | "CDC" | "CDN";
  stock_summary: { total: number; ok: number; fail: number };
  email_meta: { subject: string; to: string[]; direction: Direction };
}

export interface BdoPrepDeps {
  stockAdapter: (q: StockCheckInput) => Promise<StockCheckResult>;
  mailerAdapter: (msg: SendEmailInput) => Promise<{ ok: boolean; id?: string }>;
  registryAdapter: (rec: PrepRecord) => Promise<void>;
  // Resolve primary contacts for the counterparty (client when outbound, vendor when inbound)
  contactResolver: (
    direction: Direction,
    party: { id: string; site_id?: string }
  ) => Promise<{ to: string[]; cc?: string[] }>;
}

/* ───────────────────────── Utilities ───────────────────────── */

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

const classify = (d: BdoOrderDraft) => (d.schedule.kind === "scheduled" ? "scheduled" : "ad_hoc");

const transportFlag = (d: BdoOrderDraft): "CDIQ" | "CDC" | "CDN" => {
  if (d.transport.in_quote) return "CDIQ";
  return d.transport.mode ? "CDC" : "CDN";
};

const money = (n: Minor, symbol = "£") => `${symbol}${(n / 100).toFixed(2)}`;

/* ───────────────────── Email composition ───────────────────── */

function buildSubject(d: BdoOrderDraft): string {
  const tag = classify(d) === "scheduled" ? "Scheduled" : "Ad-hoc";
  const cp = d.counterparty.site_name ? ` — ${d.counterparty.site_name}` : "";
  const ref = d.references?.client_po ? ` • Ref: ${d.references.client_po}` : "";
  // “SO Prep” for outbound, “PO Prep” for inbound
  const lane = d.direction === "outbound" ? "SO Prep" : "PO Prep";
  return `[${tag}] ${lane}${cp}${ref}`;
}

function transportText(flag: "CDIQ" | "CDC" | "CDN"): string {
  if (flag === "CDIQ") return "Collection/Delivery included in quoted price.";
  if (flag === "CDC") return "Transport will be charged separately (to be confirmed).";
  return "Collection/Delivery required — we will arrange and confirm pricing.";
}

function buildTable(d: BdoOrderDraft, checks: StockCheckResult[]): string {
  const rows = d.lines
    .map((ln) => {
      const r = checks.find((c) => c.sku === ln.sku);
      const status = r?.ok
        ? "OK"
        : r?.reason
          ? `Hold (${r.reason}${r.suggested_eta_iso ? `, ETA: ${r.suggested_eta_iso}` : ""})`
          : "Pending";
      return `<tr>
        <td>${ln.sku}</td>
        <td>${ln.title}</td>
        <td style="text-align:right">${ln.qty}${ln.uom ? " " + ln.uom : ""}</td>
        <td style="text-align:right">${money(ln.unit_price)}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join("");
  const total = d.lines.reduce((a, l) => a + l.unit_price * l.qty, 0 as Minor);
  return `
    <table width="100%" cellspacing="0" cellpadding="6" style="border-collapse:collapse;border:1px solid #e5e7eb">
      <thead>
        <tr style="background:#f9fafb">
          <th align="left">SKU</th><th align="left">Item</th>
          <th align="right">Qty</th><th align="right">Unit Price</th><th align="left">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" align="right" style="border-top:1px solid #e5e7eb"><strong>Total (ex VAT):</strong></td>
          <td align="right" style="border-top:1px solid #e5e7eb"><strong>${money(total)}</strong></td>
          <td style="border-top:1px solid #e5e7eb"></td>
        </tr>
      </tfoot>
    </table>`;
}

function buildEmailHTML(d: BdoOrderDraft, checks: StockCheckResult[], flag: "CDIQ" | "CDC" | "CDN"): string {
  const sched =
    d.schedule.kind === "scheduled"
      ? `<p><strong>Schedule:</strong> ${d.schedule.rule}${
          d.schedule.day ? ` • ${d.schedule.day}` : ""
        }${d.schedule.window ? ` • ${d.schedule.window}` : ""}</p>`
      : `<p><strong>Schedule:</strong> Ad-hoc — please confirm earliest acceptable date/time window.</p>`;

  const action =
    d.direction === "outbound"
      ? `<li>Confirm date window and any access constraints.</li>`
      : `<li>Confirm readiness/lead time and any access constraints.</li>`;

  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.5">
    <p>Dear ${d.counterparty.name},</p>
    <p>We’re preparing the ${d.direction === "outbound" ? "Sales" : "Purchase"} Order for the window below.</p>
    ${sched}
    <p><strong>Transport:</strong> ${transportText(flag)}</p>
    ${buildTable(d, checks)}
    <p style="margin-top:12px"><strong>Action requested:</strong></p>
    <ul>
      ${action}
      <li>${
        flag === "CDC"
          ? "Approve separate transport cost (options will be provided)."
          : flag === "CDN"
          ? "Confirm we should arrange transport (pricing to follow)."
          : "No transport action needed."
      }</li>
      <li>Please share your reference (${d.direction === "outbound" ? "SO" : "PO"}) for paperwork.</li>
    </ul>
    ${d.notes ? `<p class="muted">Notes: ${d.notes}</p>` : ""}
    <p>Kind regards,<br/>Operations</p>
  </div>`;
}

/* ──────────────────────── Core Orchestrator ──────────────────────── */

export async function prepareBdoOrder(draft: BdoOrderDraft, deps: BdoPrepDeps): Promise<PrepRecord> {
  // 1) Classify
  const classification = classify(draft);

  // 2) Stock / availability (sector-aware; no reservations)
  const checks = await Promise.all(
    draft.lines.map((ln) =>
      deps.stockAdapter({
        sku: ln.sku,
        location_hint: draft.geography?.region ?? draft.geography?.postcode,
        quantity: ln.qty,
        sector_hint: ln.sector_hint,
      })
    )
  );

  // 3) Transport policy flag
  const tflag = transportFlag(draft);

  // 4) Email → counterparty (client for outbound; vendor for inbound)
  const contacts = await deps.contactResolver(draft.direction, {
    id: draft.counterparty.id,
    site_id: draft.counterparty.site_id,
  });
  const subject = buildSubject(draft);
  const html = buildEmailHTML(draft, checks, tflag);

  await deps.mailerAdapter({
    to: contacts.to?.length ? contacts.to : ["operations@example.com"],
    cc: contacts.cc,
    bcc: ["ops-archive@example.com"],
    subject,
    html,
  });

  // 5) Audit record
  const rec: PrepRecord = {
    event_id: id("BDO_PREP"),
    bdo_id: draft.bdo_id,
    timestamp_iso: new Date().toISOString(),
    classification,
    transport_flag: tflag,
    stock_summary: {
      total: checks.length,
      ok: checks.filter((c) => c.ok).length,
      fail: checks.filter((c) => !c.ok).length,
    },
    email_meta: { subject, to: contacts.to ?? [], direction: draft.direction },
  };

  await deps.registryAdapter(rec);
  return rec;
}

/* ───────────────────────── Barrel Exports ───────────────────────── */

export type {
  BdoOrderDraft as Draft,
  BdoLine as Line,
  BdoPrepDeps as Deps,
  StockCheckInput as StockIn,
  StockCheckResult as StockOut,
  SendEmailInput as MailIn,
};