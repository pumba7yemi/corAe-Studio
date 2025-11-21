// prepare.ts — extracted helper + prepareBdoOrder implementation
import { createHash } from "node:crypto";

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
  direction: "inbound" | "outbound";
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

export interface BdoPrepDeps {
  stockAdapter: (inquiry: StockCheckInput) => Promise<StockCheckResult>;
  mailerAdapter: (msg: SendEmailInput) => Promise<{ ok: boolean; id?: string }>;
  registryAdapter: (rec: PrepRecord) => Promise<void>;
  contactResolver: (
    direction: "outbound" | "inbound",
    party: { id: string; site_id?: string }
  ) => Promise<{ to: string[]; cc?: string[] }>;
}

/* helpers */
const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

function classify(d: BdoOrderDraft): "scheduled" | "ad_hoc" {
  return d.schedule.kind === "scheduled" ? "scheduled" : "ad_hoc";
}

function transportFlag(d: BdoOrderDraft): "CDIQ" | "CDC" | "CDN" {
  if (d.transport.in_quote) return "CDIQ";
  return d.transport.mode ? "CDC" : "CDN";
}

function currency(minor: Minor, symbol = "£"): string {
  return `${symbol}${(minor / 100).toFixed(2)}`;
}

function subjectFor(d: BdoOrderDraft): string {
  const tag = classify(d) === "scheduled" ? "Scheduled" : "Ad-hoc";
  const flow = d.direction === "outbound" ? "Sales" : "Purchase";
  const site = d.counterparty.site_name ? ` — ${d.counterparty.site_name}` : "";
  const ref = d.references?.client_po ? ` • Ref: ${d.references.client_po}` : "";
  return `[${tag}] ${flow} Order Prep${site}${ref}`;
}

function htmlFor(d: BdoOrderDraft, stock: StockCheckResult[], tflag: "CDIQ" | "CDC" | "CDN"): string {
  const sched =
    d.schedule.kind === "scheduled"
      ? `<p><strong>Schedule:</strong> ${d.schedule.rule}${d.schedule.day ? ` • ${d.schedule.day}` : ""}${d.schedule.window ? ` • ${d.schedule.window}` : ""}</p>`
      : `<p><strong>Schedule:</strong> Ad-hoc — please confirm earliest acceptable date/time window.</p>`;

  const lines = d.lines
    .map((ln) => {
      const r = stock.find((s) => s.sku === ln.sku);
      const status = r?.ok
        ? "OK"
        : r?.reason
        ? `Hold (${r.reason}${r.suggested_eta_iso ? `, ETA: ${r.suggested_eta_iso}` : ""})`
        : "Pending";
      return `<tr>
        <td>${ln.sku}</td>
        <td>${ln.title}</td>
        <td style="text-align:right">${ln.qty}${ln.uom ? " " + ln.uom : ""}</td>
        <td style="text-align:right">${currency(ln.unit_price)}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join("");

  const total = d.lines.reduce((acc, l) => acc + l.unit_price * l.qty, 0);

  const who = d.direction === "outbound" ? "client" : "vendor";

  const actionTransport =
    tflag === "CDC"
      ? "Approve separate transport cost (we will share options)."
      : tflag === "CDN"
      ? "Confirm that we should arrange transport (we will price and confirm)."
      : "No transport action required.";

  return `
  <div style="font-family: Inter, Arial, sans-serif; line-height:1.45">
    <p>Dear ${d.counterparty.name},</p>
    <p>We’re preparing your order and performing a quick availability check prior to booking/dispatch.</p>
    ${sched}
    <p><strong>Transport:</strong> ${tflag} ${
    tflag === "CDIQ"
      ? "(collection/delivery included in quoted price)"
      : tflag === "CDC"
      ? "(separate transport cost will be applied)"
      : "(collection/delivery needed — we will arrange and confirm pricing)"
  }</p>
    <table width="100%" cellspacing="0" cellpadding="6" style="border-collapse:collapse;border:1px solid #ddd">
      <thead>
        <tr style="background:#f6f7f9">
          <th align="left">SKU</th>
          <th align="left">Item</th>
          <th align="right">Qty</th>
          <th align="right">Unit Price</th>
          <th align="left">Status</th>
        </tr>
      </thead>
      <tbody>${lines}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" align="right" style="border-top:1px solid #ddd"><strong>Total (ex VAT):</strong></td>
          <td align="right" style="border-top:1px solid #ddd"><strong>${currency(total)}</strong></td>
          <td style="border-top:1px solid #ddd"></td>
        </tr>
      </tfoot>
    </table>

    <p style="margin-top:12px"><strong>Action requested (${who}):</strong></p>
    <ul>
      <li>Confirm the schedule/date window (or propose alternatives).</li>
      <li>Confirm site access constraints, if any.</li>
      <li>${actionTransport}</li>
      <li>If not already supplied, please confirm your order reference (PO/SO) for paperwork.</li>
    </ul>

    <p>Kind regards,<br/>Operations</p>
  </div>`;
}

export async function prepareBdoOrder(draft: BdoOrderDraft, deps: BdoPrepDeps): Promise<PrepRecord> {
  if (!draft?.bdo_id) throw new Error("bdo_id missing");
  if (!draft.lines?.length) throw new Error("at least one line is required");

  const kind = classify(draft);

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

  const tflag = transportFlag(draft);

  const { to, cc } = await deps.contactResolver(draft.direction, {
    id: draft.counterparty.id,
    site_id: draft.counterparty.site_id,
  });

  const subject = subjectFor(draft);
  const html = htmlFor(draft, checks, tflag);

  await deps.mailerAdapter({
    to: to && to.length ? to : ["operations@example.com"],
    cc,
    bcc: ["ops-archive@example.com"],
    subject,
    html,
  });

  const totalMinor = draft.lines.reduce((acc, l) => acc + l.unit_price * l.qty, 0);

  const rec: PrepRecord = {
    event_id: id("BDOPREP"),
    bdo_id: draft.bdo_id,
    timestamp_iso: new Date().toISOString(),
    classification: kind,
    direction: draft.direction,
    stock_summary: {
      total: checks.length,
      ok: checks.filter((c) => c.ok).length,
      fail: checks.filter((c) => !c.ok).length,
    },
    transport_flag: tflag,
    email_meta: { subject, to },
    totals_minor: { ex_vat: totalMinor, lines: draft.lines.length },
  };

  await deps.registryAdapter(rec);
  return rec;
}
