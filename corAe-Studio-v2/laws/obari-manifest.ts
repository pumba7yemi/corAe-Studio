// /laws/obari.manifest.ts
// Canonical registry for OBARI “laws” (annexes). One import point for the app.
// Add new annexes here to make them discoverable across Orders → Bookings → Active → Reporting → Invoice.

export type LawKey =
  | "obari.surveyquote"; // Survey → Quote → Product canonical flow

export type LawAnnexMeta = {
  id: LawKey;
  title: string;
  version: string;          // semver
  summary: string;          // short human description
  domain: "orders" | "bookings" | "active" | "reporting" | "invoice" | "cross";
};

export interface LawAnnex<TExports = unknown> {
  meta: LawAnnexMeta;
  // Public API surface exposed by the annex (types, helpers, rule fns, zod schemas, etc.)
  api: TExports;
}

// ---- Annex imports ----------------------------------------------------------
// Each annex should default-export: { meta, api }
import SurveyQuoteAnnex from "./obari-surveyquote.annex";

// ---- Registry ---------------------------------------------------------------
const registry: Record<LawKey, LawAnnex<any>> = {
  "obari.surveyquote": SurveyQuoteAnnex,
};

// ---- Public accessors -------------------------------------------------------
/** Return a law annex by key or throw if missing (fail-fast to keep rules honest). */
export function requireLaw<K extends LawKey>(key: K): LawAnnex<any> {
  const law = registry[key];
  if (!law) {
    throw new Error(`OBARI law not registered: ${key}`);
  }
  return law;
}

/** Safe getter that returns undefined when not found. */
export function getLaw<K extends LawKey>(key: K): LawAnnex<any> | undefined {
  return registry[key];
}

/** List all registered laws (lightweight — returns meta only by default). */
export function listLaws(opts?: { withApi?: boolean }) {
  const withApi = !!opts?.withApi;
  return Object.values(registry).map((law) =>
    withApi ? law : law.meta
  );
}

// ---- Guard discovery hook ---------------------------------------------------
// Domain guards (e.g., /domain/guards.ts) can consult this to know which annex
// declares preconditions relevant to a given stage without direct coupling.
export function listStageLaws(
  stage: LawAnnexMeta["domain"] | "any"
): LawAnnexMeta[] {
  return Object.values(registry)
    .map((l) => l.meta)
    .filter((m) => stage === "any" || m.domain === stage || m.domain === "cross");
}

// Convenience re-exports (so consumers can do `import { requireLaw } from "laws/obari.manifest"`)
export default {
  requireLaw,
  getLaw,
  listLaws,
  listStageLaws,
};