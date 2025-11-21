import type { PulseInputs, PulseSummary } from "../index";
import { computePulse } from "../compute";

class MemoryPulseStore {
  private summary: PulseSummary = {
    timeSavedMin: 0,
    flowRating: 0,
    purposeIndex: 50,
    updatedAt: new Date().toISOString(),
  };

  upsertDelta(delta: Partial<PulseInputs>): PulseSummary {
    // Merge with zero defaults for idempotence
    const merged = {
      automatedMinutes: 0,
      routineAdherence: 0,
      tasksCompleted: 0,
      purposeTags: [] as string[],
      ...delta,
    };
    this.summary = computePulse(merged);
    return this.summary;
  }

  getSummary(): PulseSummary { return this.summary; }
}

export const memoryPulseStore = new MemoryPulseStore();
