/// <reference types="vitest" />

import { describe, it, expect } from "vitest";
// vitest exposes describe/it/expect as globals in the test environment
// use vitest globals provided by the test environment (no import needed)
import { computePulse } from "../compute";

describe("computePulse", () => {
  it("caps time and yields reasonable scores", () => {
    const out = computePulse({ automatedMinutes: 5000, routineAdherence: 0.8, tasksCompleted: 30, purposeTags: ["faith","work"] });
    expect(out.timeSavedMin).toBe(1440);
    expect(out.flowRating).toBeGreaterThan(0);
    expect(out.purposeIndex).toBeGreaterThan(0);
  });
});
