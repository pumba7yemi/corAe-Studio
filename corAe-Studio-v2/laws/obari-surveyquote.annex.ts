// /laws/obari-surveyquote.annex.ts
// OBARI Law Annex — Survey → Quote → Product (reconciled, self-contained)
// Implements enforceable algorithms + manifest/API in one file.
// All monetary values are minor units (pence/cents).

// ────────────────────────────────────────────────────────────────
// Minimal manifest typings (self-contained)
// ────────────────────────────────────────────────────────────────
export interface LawAnnex<TApi = unknown> {
  meta: {
    id: string;
    title: string;
    version: string;
    summary: string;
    domain: "orders" | string;
  };
  api: TApi;
}

// ────────────────────────────────────────────────────────────────
// Annex metadata
// ────────────────────────────────────────────────────────────────
export const OBARI_SURVEYQUOTE_VERSION = "1.0.0";
export const OBARI_SURVEYQUOTE_TITLE = "Survey → Quote → Product Annex";

export const meta = {
  id: "obari.surveyquote",
  title: OBARI_SURVEYQUOTE_TITLE,
  version: OBARI_SURVEYQUOTE_VERSION,
  summary:
    "Defines the lawful conversion from survey data to a valid OBARI quote, then to product and order. Ensures parties, CDJRS, geography, schedule, and pricing integrity (with PriceLock & transport flags).",
  domain: "orders" as const,
};

// ────────────────────────────────────────────────────────────────
/** Pricing Models & Money */
// ────────────────────────────────────────────────────────────────
export type Money = number; // minor units
export type Pct = number;   // 0..1

export type PricingModel =
  | { kind: "cost_plus"; markup_pct?: Pct; markup_abs?: Money }
  | { kind: "fixed"; fixed_price: Money }
  | {
      kind: "tiered";
      basis: "qty" | "period";
      tiers: Array<{ up_to?: number; price: Money }>;
    };

export interface CostBreakdown {
  base_cost: Money;
  transport_cost?: Money;
  extras?: Money;
}

export interface PricingInput {
  model: PricingModel;
  costs: CostBreakdown;
  quantity?: number;     // for tiered qty
  period_units?: number; // for tiered period
}

export interface PricingOutput {
  effective_cost: Money;
  sell_price: Money;
  margin_abs: Money;
  margin_pct: Pct;
}

export function computeEffectiveCost(c: CostBreakdown): Money {
  return (c.base_cost ?? 0) + (c.transport_cost ?? 0) + (c.extras ?? 0);
}

export function computeSellPrice(pi: PricingInput): PricingOutput {
  const effective_cost = computeEffectiveCost(pi.costs);
  const m = pi.model;

  let sell = 0;
  if (m.kind === "cost_plus") {
    const pct = m.markup_pct ?? 0;
    const abs = m.markup_abs ?? 0;
    sell = Math.round(effective_cost * (1 + pct) + abs);
  } else if (m.kind === "fixed") {
    sell = m.fixed_price;
  } else {
    const basisValue = m.basis === "qty" ? (pi.quantity ?? 0) : (pi.period_units ?? 0);
    if (basisValue <= 0) throw new Error("Tiered pricing requires non-zero basis");
    const tier =
      m.tiers.find(t => t.up_to !== undefined && basisValue <= (t.up_to as number)) ??
      m.tiers[m.tiers.length - 1];
    sell = tier.price;
  }

  const margin_abs = sell - effective_cost;
  const margin_pct = sell > 0 ? margin_abs / sell : 0;
  return { effective_cost, sell_price: sell, margin_abs, margin_pct };
}

// ────────────────────────────────────────────────────────────────
/** Schema: Survey → Quote → Product/Order */
// ────────────────────────────────────────────────────────────────
export interface SurveyCore {
  survey_id: string;
  client_id: string;
  site_id: string;
  product_family: string; // "pallets","machinery","consumables","service","recyclables", etc.
  cdjrs: "collection" | "delivery" | "job" | "rental" | "service";
  description_raw: string;
  requirements: string[];
  usage_pattern?: { freq: "adhoc" | "scheduled" | "rental"; cadence?: string };
  geography: { country: string; region?: string; postcode?: string };
  schedule_pref?: { days?: string[]; window?: string };
  transport: { in_quote: boolean; own_transport?: boolean };
  department_hint?: string;         // Chart of Accounts mapping hint
  compliance_flags?: string[];      // e.g. ["RAMS","WTN","Permit"]
  attachments?: Array<{ name: string; kind: "image"|"pdf"|"doc"; uri: string }>;
}

export interface QuoteLineSeed {
  sku_hint?: string;
  title?: string;
  pricing: PricingInput;
  quantity?: number;
  uom?: string;
  compliance?: string[];
}

export interface QuoteDraft {
  survey_id: string;
  client_id: string;
  site_id: string;
  lines: QuoteLineSeed[];
  terms?: { incoterms?: string; payment?: string; notes?: string };
  transport: { mode?: "vendor"|"customer"|"third_party"; in_quote: boolean };
  schedule?: { kind: "adhoc"|"scheduled"|"rental"; rule?: string };
  geography?: SurveyCore["geography"];
  department?: string;
  description?: string;
}

export interface QuoteAccepted extends QuoteDraft {
  quote_id: string;
  status: "accepted";
  totals: {
    cost: Money;
    sell: Money;
    margin_abs: Money;
    margin_pct: Pct;
  };
}

export function populateQuoteFromSurvey(s: SurveyCore, seeds: QuoteLineSeed[]): QuoteDraft {
  return {
    survey_id: s.survey_id,
    client_id: s.client_id,
    site_id: s.site_id,
    lines: seeds,
    transport: { in_quote: s.transport.in_quote, mode: resolveTransportMode(s) },
    schedule: deriveSchedule(s),
    geography: s.geography,
    department: mapDepartment(s),
    description: normalizeDescription(s),
    terms: { notes: "Quote generated under OBARI Survey→Quote law." },
  };
}

function resolveTransportMode(s: SurveyCore): "vendor"|"customer"|"third_party" {
  if (s.transport.own_transport) return "vendor";
  return "third_party"; // force explicit selection later if unknown
}

function deriveSchedule(s: SurveyCore): QuoteDraft["schedule"] {
  if (!s.usage_pattern || s.usage_pattern.freq === "adhoc") return { kind: "adhoc" };
  if (s.usage_pattern.freq === "rental") {
    return { kind: "rental", rule: s.usage_pattern.cadence ?? "MONTHLY" };
  }
  return { kind: "scheduled", rule: s.usage_pattern.cadence ?? "WEEKLY" };
}

function normalizeDescription(s: SurveyCore): string {
  const needs = s.requirements?.length ? ` Needs: ${s.requirements.join("; ")}.` : "";
  return `[${s.product_family.toUpperCase()} • ${s.cdjrs}] ${s.description_raw}${needs}`.trim();
}

function mapDepartment(s: SurveyCore): string {
  const fam = s.product_family.toLowerCase();
  if (fam.includes("recycl")) return "4000-Sales-Waste";
  if (fam.includes("pallet")) return "4010-Sales-Pallets";
  if (fam.includes("machin")) return "4020-Sales-Machinery";
  if (fam.includes("consum")) return "4030-Sales-Consumables";
  if (fam.includes("serv"))   return "4040-Sales-Services";
  return s.department_hint ?? "4999-Sales-Other";
}

// ────────────────────────────────────────────────────────────────
/** Acceptance (PriceLock) */
// ────────────────────────────────────────────────────────────────
export function acceptQuote(d: QuoteDraft): QuoteAccepted {
  const totals = d.lines.reduce(
    (acc, ln) => {
      const out = computeSellPrice(ln.pricing);
      const qty = ln.quantity ?? 1;
      acc.cost += out.effective_cost * qty;
      acc.sell += out.sell_price * qty;
      return acc;
    },
    { cost: 0 as Money, sell: 0 as Money }
  );
  const margin_abs = totals.sell - totals.cost;
  const margin_pct = totals.sell > 0 ? margin_abs / totals.sell : 0;
  return {
    ...d,
    quote_id: cryptoId("Q"),
    status: "accepted",
    totals: { cost: totals.cost, sell: totals.sell, margin_abs, margin_pct },
  };
}

function cryptoId(prefix: string): string {
  // Replace with ULID/UUIDv7 in production
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ────────────────────────────────────────────────────────────────
/** Derivation to Product & Order (BDO) */
// ────────────────────────────────────────────────────────────────
export interface ProductRecord {
  product_id: string;
  code: string; // POIG-generated in production
  title: string;
  description: string;
  department: string;
  pricing_snapshot: PricingOutput;
  compliance: string[];
  geography: SurveyCore["geography"];
}

export interface OrderRecord {
  order_id: string;
  quote_id: string;
  product_id: string;
  client_id: string;
  site_id: string;
  schedule: QuoteDraft["schedule"];
  transport: QuoteDraft["transport"];
  status: "pending" | "active" | "reported" | "invoiced" | "closed" | "invalid";
}

export function deriveProductsFromQuote(q: QuoteAccepted): ProductRecord[] {
  return q.lines.map((ln, idx) => {
    const snap = computeSellPrice(ln.pricing);
    return {
      product_id: cryptoId(`P${idx}`),
      code: buildProductCode(q, ln),
      title: ln.title ?? q.description ?? "Product",
      description: q.description ?? "",
      department: q.department ?? "4999-Sales-Other",
      pricing_snapshot: snap,
      compliance: uniq([...(ln.compliance ?? []), ...(q?.terms?.notes ? [] : [])]),
      geography: q.geography!,
    };
  });
}

export function createOrdersFromQuote(q: QuoteAccepted, products: ProductRecord[]): OrderRecord[] {
  return products.map(p => ({
    order_id: cryptoId("O"),
    quote_id: q.quote_id,
    product_id: p.product_id,
    client_id: q.client_id,
    site_id: q.site_id,
    schedule: q.schedule!,
    transport: q.transport!,
    status: "pending",
  }));
}

function buildProductCode(q: QuoteAccepted, _ln: QuoteLineSeed): string {
  // Placeholder — hook into POIG / Number Index pipeline in production
  const fam = (q.description ?? "GEN").split(" ")[0].slice(0,3).toUpperCase();
  const geo = (q.geography?.region ?? "UK").slice(0,2).toUpperCase();
  return `${fam}-${geo}-${Date.now().toString().slice(-5)}`;
}

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

// ────────────────────────────────────────────────────────────────
/** Compliance Gating */
// ────────────────────────────────────────────────────────────────
export interface ComplianceArtifact {
  kind: string;        // "RAMS","WTN","Permit","Insurance", etc.
  uri: string;
  issued_at?: string;  // ISO
  expires_at?: string; // ISO
}

export interface ComplianceBundle {
  required: string[];
  provided: ComplianceArtifact[];
}

export function gateCompliance(bundle: ComplianceBundle): { ok: boolean; missing: string[] } {
  const have = new Set(bundle.provided.map(a => a.kind.toUpperCase()));
  const missing = bundle.required.filter(r => !have.has(r.toUpperCase()));
  return { ok: missing.length === 0, missing };
}

// ────────────────────────────────────────────────────────────────
/** Transport Policy (CDIQ / CDC / CDN) */
// ────────────────────────────────────────────────────────────────
export type TransportFlag = "CDIQ" | "CDC" | "CDN";

export function transportFlag(q: QuoteAccepted): TransportFlag {
  if (q.transport.in_quote) return "CDIQ";
  return q.transport.mode ? "CDC" : "CDN";
}

// ────────────────────────────────────────────────────────────────
/** Lawful Evaluation (Survey → Quote draft) */
// ────────────────────────────────────────────────────────────────
export interface EvaluateOptions {
  strict?: boolean; // if true, fail on missing nice-to-have fields
}

export interface LawViolation {
  field: string;
  message: string;
}

export function evaluateSurveyToQuote(
  survey: SurveyCore,
  opts?: EvaluateOptions
): { ok: true; value: QuoteDraft } | { ok: false; error: LawViolation[] } {
  const errors: LawViolation[] = [];

  // Minimal lawful checks
  if (!survey.survey_id) errors.push({ field: "survey_id", message: "Survey id is required." });
  if (!survey.client_id) errors.push({ field: "client_id", message: "Client id is required." });
  if (!survey.site_id) errors.push({ field: "site_id", message: "Site id is required." });
  if (!survey.product_family) errors.push({ field: "product_family", message: "Product family required." });
  if (!survey.cdjrs) errors.push({ field: "cdjrs", message: "CDJRS kind required." });
  if (!survey.geography?.country) errors.push({ field: "geography.country", message: "Country required." });

  if (opts?.strict) {
    if (!survey.description_raw) errors.push({ field: "description_raw", message: "Description required (strict)." });
  }

  if (errors.length > 0) return { ok: false, error: errors };

  // Minimal seed line so UI/test harness can enrich later
  const seeds: QuoteLineSeed[] = [
    {
      title: survey.description_raw || `${survey.product_family} (${survey.cdjrs})`,
      uom: "unit",
      quantity: 1,
      pricing: {
        model: { kind: "cost_plus", markup_pct: 0.1 },
        costs: { base_cost: 0, transport_cost: survey.transport.in_quote ? 0 : 0, extras: 0 },
      },
      compliance: survey.compliance_flags ?? [],
    },
  ];

  const draft = populateQuoteFromSurvey(survey, seeds);
  return { ok: true, value: draft };
}

// Sample scaffold for UI/tests
export function makeMinimalSurvey(partial: Partial<SurveyCore> = {}): SurveyCore {
  return {
    survey_id: "S-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    client_id: partial.client_id ?? "CL-XXX",
    site_id: partial.site_id ?? "SITE-XXX",
    product_family: partial.product_family ?? "service",
    cdjrs: partial.cdjrs ?? "service",
    description_raw: partial.description_raw ?? "New service request",
    requirements: partial.requirements ?? [],
    usage_pattern: partial.usage_pattern ?? { freq: "adhoc" },
    geography: partial.geography ?? { country: "UK", region: "Region", postcode: "POST" },
    schedule_pref: partial.schedule_pref ?? { days: [], window: undefined },
    transport: partial.transport ?? { in_quote: false, own_transport: false },
    department_hint: partial.department_hint,
    compliance_flags: partial.compliance_flags ?? [],
    attachments: partial.attachments ?? [],
  };
}

// ────────────────────────────────────────────────────────────────
/** Annex API surface (wraps the above under “law”) */
// ────────────────────────────────────────────────────────────────
export const api = {
  evaluate: evaluateSurveyToQuote,
  sample: makeMinimalSurvey,
  immutableCheck: (prevHash: string, nextHash: string) => {
    if (prevHash === nextHash) return { ok: true as const };
    return {
      ok: false as const,
      error: "Attempted to mutate a confirmed surveyquote evaluation (violates PriceLock Chain).",
    };
  },
};

// Default export for manifest registration
const annex: LawAnnex<typeof api> = { meta, api };
export default annex;