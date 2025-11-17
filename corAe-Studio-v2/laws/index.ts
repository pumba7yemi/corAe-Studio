// /laws/index.ts
// corAe Constitutional Law Loader — OBARI Core + Annex Registration
// Loads, registers, and freezes all law annexes for the OBARI framework.
// Acts as the single entrypoint for system-wide legal definitions.

import { registerAnnex, freezeRegistry } from "./obari.manifest";
import obariLaw from "./obari.law";
import obariSurveyQuote from "./obari-surveyquote.annex";

/**
 * Register all known laws and annexes
 * This file is evaluated once at server start (or test bootstrap)
 */
export function loadAllLaws() {
  registerAnnex(obariLaw);
  registerAnnex(obariSurveyQuote);
  freezeRegistry();
}

/**
 * Immediately execute on import for standard builds.
 * If lazy-loading is needed later (e.g. in testing), this can be deferred.
 */
loadAllLaws();

export * from "./obari.manifest";
export * from "./obari.law";
export * from "./obari-surveyquote.annex";