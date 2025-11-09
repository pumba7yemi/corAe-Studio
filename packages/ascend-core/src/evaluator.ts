type Metrics = {
  accuracy14DayPct?: number;             // for Operative → Executive
  renewalsOnTime?: boolean;              // Executive checkpoint
  explainsObariToCash?: boolean;         // boolean from weekly micro-quiz
  gmPct?: number;                        // gross margin %
  arDays?: number;                       // accounts receivable days
  repeatOrderRate?: number;              // for Sales track
};

export function evaluateAscend(current: "Operative"|"Executive"|"Manager",
                               track: "SystemCreator"|"GrowthCreator"|"HybridCreator",
                               m: Metrics): { ready: boolean; reason: string } {
  if (current === "Operative") {
    const ready = (m.accuracy14DayPct ?? 0) >= 100;
    return { ready, reason: ready ? "100% accuracy sustained" : "Needs 100% accuracy for 14 days" };
  }
  if (current === "Executive") {
    const ready =
      !!m.renewalsOnTime &&
      !!m.explainsObariToCash;
    return { ready, reason: ready ? "Understands OBARI → cash and closes renewals" : "Needs renewal discipline + OBARI literacy" };
  }
  if (current === "Manager") {
    const gmOk = (m.gmPct ?? 0) >=  targetGM(track);
    const arOk = (m.arDays ?? 999) <= targetARDays(track);
    const repOk = track !== "GrowthCreator" || (m.repeatOrderRate ?? 0) >=  targetRepeatRate();
    const ready = gmOk && arOk && repOk;
    return { ready, reason: ready ? "Sustained margin/AR (and repeat rate for sales track)" : "Hit GM/AR (and repeat) targets consistently" };
  }
  return { ready: false, reason: "Already Creator" };
}

function targetGM(track: string)      { return track === "GrowthCreator" ? 24 : 20; }
function targetARDays(track: string)  { return track === "GrowthCreator" ? 30 : 35; }
function targetRepeatRate()           { return 0.35; } // 35% repeat orders