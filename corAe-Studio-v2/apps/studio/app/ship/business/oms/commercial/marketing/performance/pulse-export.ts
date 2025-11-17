// /apps/ship/business/oms/commercial/marketing/performance/pulse-export.ts
// corAe OMS — Marketing Performance → Pulse Export
// Purpose: relay key KPI metrics from Appraisals to the Pulse dashboard.
// Pure TypeScript; no external imports; plain JSON payloads.

type PulseMetric = {
  id: string;                // unique (slug from appraisal)
  company: string;
  sector: string;
  generatedAt: string;       // ISO timestamp
  leadScore: number;         // 0–100
  conversionStage: "new" | "contacted" | "intro" | "pilot" | "won" | "archived";
  summary: string;           // one-line insight
  benchmarks: Record<string, number>;
};

/**
 * Very light scoring logic — replace with your analytics later.
 *  - text length → maturity
 *  - sector benchmarks → difficulty
 *  - random jitter for demo realism
 */
export function scoreLead(
  company: string,
  sector: string,
  highlights: string
): PulseMetric {
  const base = Math.min(100, Math.max(20, highlights.length / 5));
  const jitter = Math.floor(Math.random() * 10);
  const score = Math.min(100, base + jitter);

  const benchmarks = (
    sector === "property"
      ? {
          hoursReclaimedPct: 35,
          ttrImprovementPct: 40,
          arrearsImprovementPct: 15,
        }
      : {
          hoursReclaimedPct: 30,
          slaImprovementPct: 25,
        }
  ) as Record<string, number>;

  const summary =
    score > 75
      ? "High-potential prospect; strong digital presence."
      : score > 50
      ? "Moderate potential; structured but manual processes visible."
      : "Early-stage or low-structure; education-led approach required.";

  return {
    id: `${sector}-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    company,
    sector,
    generatedAt: new Date().toISOString(),
    leadScore: score,
    conversionStage: "new",
    summary,
    benchmarks,
  };
}

/**
 * Simulated export → Pulse.
 * In production, this will post to the Pulse API or append to a queue.
 */
export async function exportToPulse(metric: PulseMetric) {
  const file = `.data/pulse/leads/${metric.id}.json`;
  const fs = await import("fs/promises");
  await fs.mkdir(".data/pulse/leads", { recursive: true });
  await fs.writeFile(file, JSON.stringify(metric, null, 2), "utf8");
  return { ok: true, path: file };
}

/** Demo trigger (used by Appraisal Generator after create) */
export async function pushAppraisalToPulse(
  company: string,
  sector: string,
  highlights: string
) {
  const metric = scoreLead(company, sector, highlights);
  const res = await exportToPulse(metric);
  console.log("Pulse export:", res.path);
  return metric;
}

// Example (manual test)
// pushAppraisalToPulse("VS Property Group", "property", "lettings, management, investment");
