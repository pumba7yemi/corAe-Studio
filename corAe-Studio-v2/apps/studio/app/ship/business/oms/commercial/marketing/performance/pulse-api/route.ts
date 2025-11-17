// /apps/ship/business/oms/commercial/marketing/performance/pulse-api/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";

type Body = {
  company: string;
  sector: string;
  highlights: string;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function scoreLead(company: string, sector: string, highlights: string) {
  const base = Math.min(100, Math.max(20, Math.floor(highlights.length / 5)));
  const jitter = Math.floor(Math.random() * 10);
  const score = Math.min(100, base + jitter);

  const benchmarks =
    sector.toLowerCase() === "property"
      ? { hoursReclaimedPct: 35, ttrImprovementPct: 40, arrearsImprovementPct: 15 }
      : { hoursReclaimedPct: 30, slaImprovementPct: 25 };

  const summary =
    score > 75
      ? "High-potential prospect; strong digital presence."
      : score > 50
      ? "Moderate potential; structured but manual processes visible."
      : "Early-stage or low-structure; education-led approach required.";

  return {
    id: `${sector}-${slugify(company)}`,
    company,
    sector,
    generatedAt: new Date().toISOString(),
    leadScore: score,
    conversionStage: "new",
    summary,
    benchmarks,
  };
}

export async function POST(req: Request) {
  try {
    const { company, sector, highlights } = (await req.json()) as Body;

    if (!company || !sector) {
      return NextResponse.json({ ok: false, error: "company and sector required" }, { status: 400 });
    }

    const metric = scoreLead(company, sector, highlights || "");
    const dir = ".data/pulse/leads";
    await fs.mkdir(dir, { recursive: true });
    const path = `${dir}/${metric.id}.json`;
    await fs.writeFile(path, JSON.stringify(metric, null, 2), "utf8");

    return NextResponse.json({ ok: true, path, metric });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
