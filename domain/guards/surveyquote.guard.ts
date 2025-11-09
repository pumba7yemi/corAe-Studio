// /domain/guards/surveyquote.guard.ts
// OBARI Guard — Survey→Quote pipeline
// Dedicated guard that wraps evaluation with law enforcement and diagnostics logging.

import {
  evaluateSurveyToQuote,
  makeMinimalSurvey,
  type SurveyInput,
  type EvaluateResult,
  type EvaluateOptions,
} from "./index";

import { logLawEvent } from "../../lib/audit";
import { sha256 } from "../../lib/crypto";

/**
 * Evaluate a survey and record audit trail.
 * Returns lawful Survey→Quote evaluation result.
 */
export async function guardSurveyToQuote(
  survey: SurveyInput,
  opts: EvaluateOptions = {}
): Promise<EvaluateResult> {
  const res = evaluateSurveyToQuote(survey, opts);

  // Every run is logged for lineage tracking
  const lineage = {
    at: new Date().toISOString(),
    survey_id: survey.survey_id,
    hash: sha256(JSON.stringify(survey)),
    ok: res.ok,
    kind: res.ok ? res.value.kind : "error",
  };

  await logLawEvent("OBARI_SURVEYQUOTE_EVALUATION", lineage);

  return res;
}

/**
 * Create a minimal, prefilled survey for testing or UI scaffolding.
 */
export function scaffoldSurvey(seed: Partial<SurveyInput> = {}): SurveyInput {
  return makeMinimalSurvey(seed);
}