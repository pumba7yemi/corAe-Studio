import type { PulseInputs, PulseSummary } from "./index";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number, dp = 0) => Number(n.toFixed(dp));

// naive tag scoring: reward presence of values-oriented tags
const POSITIVE_TAGS = new Set([
  "faith","family","service","growth","learning","health","gratitude","focus"
]);

export function computePulse(input: PulseInputs): PulseSummary {
  const timeSavedMin = clamp(input.automatedMinutes ?? 0, 0, 1440);

  // flow mixes adherence and completion intensity
  const completedFactor = clamp(input.tasksCompleted / 20, 0, 1); // saturate ~20 tasks
  const flow = 0.6 * clamp(input.routineAdherence ?? 0, 0, 1) + 0.4 * completedFactor;
  const flowRating = round(clamp(flow * 100, 0, 100), 0);

  // purpose: proportion of positive tags in declared set
  const tags = input.purposeTags ?? [];
  const aligned = tags.filter(t => POSITIVE_TAGS.has(t.toLowerCase())).length;
  const purposeIndex = round(tags.length ? (aligned / tags.length) * 100 : 50, 0); // neutral 50 if unknown

  return {
    timeSavedMin,
    flowRating,
    purposeIndex,
    updatedAt: new Date().toISOString(),
  };
}
