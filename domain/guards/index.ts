// /domain/guards/index.ts
// Domain Guards — OBARI Survey→Quote pipeline
// Bridges UI/runtime inputs to constitutional law algorithms.
// Validates minimal survey intent, applies defaults, and evaluates Survey → Quote → (Accepted).

import {
  // law-level types & algorithms
  type SurveyCore,
  type QuoteDraft,
  type QuoteAccepted,
  type QuoteLineSeed,
  type PricingInput,
  type ComplianceBundle,
  populateQuoteFromSurvey,
  acceptQuote,
  gateCompliance,
  transportFlag,
} from "../../laws/obari.law";

// ────────────────────────────────────────────────────────────────
// Public Types
// ────────────────────────────────────────────────────────────────

/**
 * The inbound shape we accept from UI/APIs.
 * - Extends the law's SurveyCore
 * - Optionally carries provisional quote lines (seeded from survey)
 */
export type SurveyInput = SurveyCore & {
  lines?: QuoteLineSeed[];
};

export type EvaluateOptions = {
  /**
   * If provided, these compliance artifacts must be present (e.g., "WTN","RAMS").
   * You may pass the user's current uploads via `providedCompliance`.
   */
  requireCompliance?: string[];
  providedCompliance?: ComplianceBundle["provided"];

  /**
   * Auto-accepts a QuoteDraft (freezes pricing lineage) when true.
   * If false, the function returns a QuoteDraft you can present to the user.
   * Default: true (fast-path for back-office flows).
   */
  autoAccept?: boolean;

  /**
   * If set, reject when margin is below this threshold (0..1).
   * Checked only when autoAccept is true.
   */
  minMarginPct?: number;

  /**
   * Basic policy switch: when true, we emit a transport determination ("CDIQ"|"CDC"|"CDN")
   * as part of diagnostics. (Never blocks evaluation by itself.)
   */
  emitTransportFlag?: boolean;
};

export type LawViolation = {
  code: string;
  path?: string;
  message: string;
};

export type EvaluateOk =
  | {
      kind: "draft";
      draft: QuoteDraft;
      diagnostics?: Record<string, unknown>;
    }
  | {
      kind: "accepted";
      accepted: QuoteAccepted;
      diagnostics?: Record<string, unknown>;
    };

export type EvaluateResult =
  | { ok: true; value: EvaluateOk }
  | { ok: false; error: LawViolation[] };

// ────────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────────

const isNonEmpty = (s?: string) => !!s && s.trim().length > 0;

function ensureLines(si: SurveyInput): QuoteLineSeed[] {
  if (si.lines && si.lines.length > 0) return si.lines;

  // Minimal fallback line (forces caller to fill pricing later).
  const placeholderPricing: PricingInput = {
    model: { kind: "fixed", fixed_price: 0 },
    costs: { base_cost: 0, transport_cost: 0, extras: 0 },
  };

  return [
    {
      title: si.description_raw || "Quoted Item",
      uom: "unit",
      quantity: 1,
      pricing: placeholderPricing,
      compliance: si.compliance_flags ?? [],
    },
  ];
}

function basicValidate(si: SurveyInput): LawViolation[] {
  const errs: LawViolation[] = [];

  if (!isNonEmpty(si.survey_id)) errs.push({ code: "SURVEY_ID_REQUIRED", message: "survey_id is required" });
  if (!isNonEmpty(si.client_id)) errs.push({ code: "CLIENT_ID_REQUIRED", message: "client_id is required" });
  if (!isNonEmpty(si.site_id)) errs.push({ code: "SITE_ID_REQUIRED", message: "site_id is required" });
  if (!isNonEmpty(si.product_family)) errs.push({ code: "PRODUCT_FAMILY_REQUIRED", message: "product_family is required" });
  if (!isNonEmpty(si.description_raw)) errs.push({ code: "DESCRIPTION_REQUIRED", message: "description_raw is required" });

  if (!si.geography?.country) {
    errs.push({ code: "GEO_COUNTRY_REQUIRED", path: "geography.country", message: "country is required" });
  }

  // Very light sanity on transport selection
  if (si.transport == null || typeof si.transport.in_quote !== "boolean") {
    errs.push({ code: "TRANSPORT_FLAG_REQUIRED", path: "transport.in_quote", message: "transport.in_quote must be set" });
  }

  return errs;
}

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

/**
 * Evaluate SurveyInput → QuoteDraft (→ Accepted if autoAccept=true).
 * Performs minimal validation, builds a draft via law algorithms,
 * optionally enforces compliance & margin thresholds, and returns diagnostics.
 */
export function evaluateSurveyToQuote(
  survey: SurveyInput,
  opts: EvaluateOptions = {}
): EvaluateResult {
  const violations = basicValidate(survey);
  if (violations.length) return { ok: false, error: violations };

  const lines = ensureLines(survey);
  const draft = populateQuoteFromSurvey(survey, lines);

  // Compliance (non-blocking unless explicitly required)
  let complianceGate:
    | { ok: boolean; missing: string[] }
    | undefined;

  if (opts.requireCompliance?.length) {
    const bundle: ComplianceBundle = {
      required: opts.requireCompliance,
      provided: opts.providedCompliance ?? [],
    };
    complianceGate = gateCompliance(bundle);
    if (!complianceGate.ok) {
      return {
        ok: false,
        error: complianceGate.missing.map((k) => ({
          code: "COMPLIANCE_MISSING",
          path: `compliance:${k}`,
          message: `Missing required compliance artifact: ${k}`,
        })),
      };
    }
  }

  // Auto-accept (freeze pricing lineage)
  const doAccept = opts.autoAccept !== false;
  if (!doAccept) {
    const diagnostics: Record<string, unknown> = {};
    if (opts.emitTransportFlag) {
      // Use a temporary accept to compute transport flag without freezing outside world
      const tmpAccepted = acceptQuote(draft);
      diagnostics.transport = transportFlag(tmpAccepted);
      diagnostics.margin_pct = tmpAccepted.totals.margin_pct;
    }
    return { ok: true, value: { kind: "draft", draft, diagnostics } };
  }

  const accepted = acceptQuote(draft);

  // Enforce minimum margin, if requested
  if (typeof opts.minMarginPct === "number") {
    const m = accepted.totals.margin_pct;
    if (m < opts.minMarginPct) {
      return {
        ok: false,
        error: [
          {
            code: "MARGIN_TOO_LOW",
            message: `Margin ${Math.round(m * 100)}% is below minimum ${Math.round(
              opts.minMarginPct * 100
            )}%`,
          },
        ],
      };
    }
  }

  const diagnostics: Record<string, unknown> = {};
  if (opts.emitTransportFlag) {
    diagnostics.transport = transportFlag(accepted);
  }
  if (complianceGate) diagnostics.compliance_ok = complianceGate.ok;

  return { ok: true, value: { kind: "accepted", accepted, diagnostics } };
}

/**
 * Produce a minimal, law-compliant scaffold for UI/testing.
 * Callers can pre-fill `lines` with pricing when available.
 */
export function makeMinimalSurvey(seed: Partial<SurveyInput> = {}): SurveyInput {
  return {
    survey_id: seed.survey_id ?? "S-DRAFT",
    client_id: seed.client_id ?? "CL-DRAFT",
    site_id: seed.site_id ?? "SITE-DRAFT",
    product_family: seed.product_family ?? "general",
    cdjrs: seed.cdjrs ?? "service",
    description_raw: seed.description_raw ?? "Describe the requirement",
    requirements: seed.requirements ?? [],
    usage_pattern: seed.usage_pattern ?? { freq: "adhoc" },
    geography: seed.geography ?? { country: "UK" },
    schedule_pref: seed.schedule_pref ?? { days: [], window: "" },
    transport: seed.transport ?? { in_quote: false, own_transport: false },
    department_hint: seed.department_hint,
    compliance_flags: seed.compliance_flags ?? [],
    attachments: seed.attachments ?? [],
    lines: seed.lines ?? undefined,
  };
}

// Re-exports (for convenience to callers importing only from /domain/guards)
export type { QuoteDraft, QuoteAccepted, QuoteLineSeed } from "../../laws/obari.law";