import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type KPI = { label: string; value: string | number; delta?: string };
type RiskOrOpp = { text: string; level?: "low" | "med" | "high" };
type ActionItem = { text: string; due?: string; link?: string };
type MorningExecData = {
  dateISO: string;
  business: string;
  kpis: KPI[];
  risks: RiskOrOpp[];
  actions: ActionItem[];
};

function findLogsDir(appCwd: string) {
  const rootLogs = path.resolve(appCwd, "..", ".logs");
  const localLogs = path.resolve(appCwd, ".logs");
  if (fs.existsSync(rootLogs)) return rootLogs;
  if (fs.existsSync(localLogs)) return localLogs;
  return rootLogs;
}

function getLatestSmokeLogText(logsDir: string): { file?: string; text?: string } {
  if (!fs.existsSync(logsDir)) return {};
  const files = fs
    .readdirSync(logsDir)
    .filter((f) => f.startsWith("smoke-") && f.endsWith(".log"))
    .map((f) => ({ f, mtime: fs.statSync(path.join(logsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!files.length) return {};
  const file = path.join(logsDir, files[0].f);
  const text = fs.readFileSync(file, "utf8");
  return { file, text };
}

function parseSmoke(text?: string) {
  if (!text) return { ok: false, applied: false, ranAtISO: null as string | null };
  const ok = /"ok"\s*:\s*true/.test(text) || /ok:\s*true/.test(text);
  const applied = /"applied"\s*:\s*true/.test(text) || /applied:\s*true/.test(text);
  const tsMatch =
    text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/) ||
    text.match(/(?<=SMOKE START ).+/);
  const ranAtISO = tsMatch ? tsMatch[0] : null;
  return { ok, applied, ranAtISO };
}

export async function GET() {
  const logsDir = findLogsDir(process.cwd());
  const { file, text } = getLatestSmokeLogText(logsDir);
  const parsed = parseSmoke(text);

  const now = new Date();
  const ranDate = parsed.ranAtISO ? new Date(parsed.ranAtISO) : null;
  const ageMin = ranDate ? Math.max(0, (now.getTime() - ranDate.getTime()) / 60000) : Infinity;

  // If no smoke logs are present, fall back to a simple hardcoded briefing
  const data: MorningExecData = {
    dateISO: now.toISOString(),
    business: "corAe Mothership",
    kpis: file || parsed.ok !== undefined
      ? [
          { label: "Ship Smoke", value: parsed.ok ? "PASS" : "FAIL", delta: ranDate ? `ran ${Math.floor(ageMin)}m ago` : "no recent run" },
          { label: "Updates Applied", value: parsed.applied ? "Yes" : "No" },
          { label: "Latest Log", value: file ? path.basename(file) : "—" },
        ]
      : [
          { label: "Sales (AED)", value: 128_450, delta: "+6.2% vs yesterday" },
          { label: "Cash Position (AED)", value: 482_000 },
          { label: "Stock Alerts", value: 3 },
        ],
    risks: [
      !parsed.ok && file
        ? { text: "Smoke test failed or not found", level: "high" }
        : ageMin > 720
        ? { text: "Smoke test stale (>12h)", level: "med" }
        : { text: "All systems responsive", level: "low" },
    ],
    actions: parsed.ok
      ? [
          { text: "Proceed with daily build and Ship checks", due: "Today" },
          { text: "Review last night’s cleanup in .logs if needed" },
        ]
      : [
          { text: "Re-run local smoke-test", due: "Now", link: "pnpm smoke:ship" },
          { text: "Start Ship dev server first if required" },
        ],
  };

  return NextResponse.json(data, { status: 200 });
}
