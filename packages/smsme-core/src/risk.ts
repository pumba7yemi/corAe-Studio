import { Plan, SM_Risk, Step } from "./types.js";

export function summarizeRisk(steps: Step[]): Record<SM_Risk, number> {
  const r: Record<SM_Risk, number> = { NONE: 0, LOW: 0, MEDIUM: 0, HIGH: 0, DESTRUCTIVE: 0 };
  for (const s of steps) r[s.risk] = (r[s.risk] ?? 0) + 1;
  return r;
}

/**
 * Insert mitigation hints:
 * - For HIGH/DESTRUCTIVE DROPs / SET_NOT_NULL without default, suggest BACKFILL or VIEW SHIM.
 */
export function injectMitigations(steps: Step[]): Step[] {
  const out: Step[] = [];
  for (const s of steps) {
    out.push(s);
    if (s.kind === "DROP_FIELD" && (s.risk === "DESTRUCTIVE" || s.risk === "HIGH") && s.target) {
      const [model, field] = s.target.split(".");
      out.push({
        kind: "CREATE_VIEW_SHIM",
        risk: "LOW",
        target: `${model}`,
        notes: `Expose legacy ${field} via view during transition.`,
        payload: { exposeField: field }
      });
      out.push({
        kind: "BACKFILL",
        risk: "MEDIUM",
        target: `${model}.${field}`,
        notes: "Copy legacy data to new destination before dropping."
      });
    }
    if (s.kind === "SET_NOT_NULL" && s.risk === "HIGH" && s.target) {
      out.push({
        kind: "BACKFILL",
        risk: "MEDIUM",
        target: s.target,
        notes: "Populate nulls or set default prior to constraint."
      });
    }
  }
  return out;
}