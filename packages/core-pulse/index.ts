export type PulseInputs = {
  automatedMinutes: number;           // minutes of automation from CAIA/CIMS
  routineAdherence: number;           // 0..1 proportion of planned routine followed
  tasksCompleted: number;             // integer count
  purposeTags?: string[];             // user-declared tags for alignment scoring
};

export type PulseSummary = {
  timeSavedMin: number;               // 0..1440
  flowRating: number;                 // 0..100
  purposeIndex: number;               // 0..100
  updatedAt: string;                  // ISO
};

export { computePulse } from "./compute";
export { memoryPulseStore } from "./adapters/memory";
