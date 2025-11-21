import type { TimeSenseMatrix } from "../timesense/matrix";

export type TaskScript = {
  id: string;
  title: string;
  steps: string[];
  timeCost: number; // estimated minutes driven by TimeSense
  timeCostReal?: number; // rolling average
};

export function applyTimeSenseToScript(script: TaskScript, matrix: TimeSenseMatrix): TaskScript {
  const match = matrix.tasks.find((t) => t.key === script.id || t.key === script.title);
  if (match) {
    return { ...script, timeCost: match.estimatedMinutes, timeCostReal: match.realMinutesAvg };
  }
  return script;
}
