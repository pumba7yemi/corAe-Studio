export type TaskTiming = {
  key: string;
  estimatedMinutes: number;
  realMinutesAvg: number;
  samples: number;
};

export type TimeSenseMatrix = {
  version: 1;
  tasks: TaskTiming[];
  commuteMinutesEstimated: number;
  commuteMinutesRealAvg: number;
  wakeTimeEstimated: string; // e.g. "07:30"
  wakeTimeRealAvg?: string;
};

export function initMatrixFromOnboarding(payload: Partial<TimeSenseMatrix>): TimeSenseMatrix {
  return {
    version: 1,
    tasks: payload.tasks ?? [],
    commuteMinutesEstimated: payload.commuteMinutesEstimated ?? 0,
    commuteMinutesRealAvg: payload.commuteMinutesRealAvg ?? 0,
    wakeTimeEstimated: payload.wakeTimeEstimated ?? "07:00",
    wakeTimeRealAvg: payload.wakeTimeRealAvg ?? undefined,
  };
}

export function updateRealTiming(task: TaskTiming, newSampleMinutes: number): TaskTiming {
  const total = task.realMinutesAvg * task.samples + newSampleMinutes;
  const samples = task.samples + 1;
  const realMinutesAvg = total / samples;
  return { ...task, realMinutesAvg, samples };
}

export function shouldTriggerCorrection(task: TaskTiming, thresholdFraction = 0.2, minSamples = 3): boolean {
  if (task.samples < minSamples) return false;
  return task.realMinutesAvg > task.estimatedMinutes * (1 + thresholdFraction);
}
