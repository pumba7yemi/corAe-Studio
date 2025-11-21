import { TimeSenseMatrix, initMatrixFromOnboarding, TaskTiming, updateRealTiming, shouldTriggerCorrection } from "./matrix";

const STORAGE_KEY = "corae:timesense:matrix";

export function loadMatrix(): TimeSenseMatrix | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TimeSenseMatrix;
  } catch {
    return null;
  }
}

export function saveMatrix(m: TimeSenseMatrix) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

export function recordTaskCompletion(matrix: TimeSenseMatrix, key: string, durationMinutes: number): { matrix: TimeSenseMatrix; triggeredCorrection?: TaskTiming } {
  const tasks = matrix.tasks.slice();
  const idx = tasks.findIndex((t) => t.key === key);
  if (idx === -1) {
    const t: TaskTiming = { key, estimatedMinutes: Math.round(durationMinutes), realMinutesAvg: durationMinutes, samples: 1 };
    tasks.push(t);
    const newMatrix = { ...matrix, tasks };
    saveMatrix(newMatrix);
    return { matrix: newMatrix };
  }

  const t0 = tasks[idx];
  const updated = updateRealTiming(t0, durationMinutes);
  tasks[idx] = updated;
  const newMatrix = { ...matrix, tasks };
  saveMatrix(newMatrix);
  if (shouldTriggerCorrection(updated)) return { matrix: newMatrix, triggeredCorrection: updated };
  return { matrix: newMatrix };
}

export function ensureMatrixFromOnboarding(payload: Partial<TimeSenseMatrix>): TimeSenseMatrix {
  const existing = loadMatrix();
  if (existing) return existing;
  const init = initMatrixFromOnboarding(payload);
  saveMatrix(init);
  return init;
}
