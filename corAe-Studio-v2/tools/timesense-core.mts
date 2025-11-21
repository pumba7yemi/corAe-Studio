// corAe TimeSense Core Engine — v2
// Location: corAe-Studio-v2/tools/timesense-core.mts

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "corAe-Studio-v2");
const CORAE_DIR = path.join(ROOT, ".corae");
const PLAN_FILE = path.join(CORAE_DIR, "timesense-day-plan.json");

export type TimeSource =
  | "have-you"
  | "3x3dtd"
  | "cims"
  | "script"
  | "system"
  | "work";

export type TimeBlockStatus = "pending" | "active" | "completed" | "skipped";

export interface TimeBlock {
  id: string;
  label: string;
  source: TimeSource;
  start: string;      // ISO 8601
  end: string;        // ISO 8601
  priority: number;   // 1..5 (1 = highest)
  nonNegotiable: boolean;
  status: TimeBlockStatus;
}

export interface DriftEvent {
  id: string;
  blockId: string;
  minutesBehind: number;
  detectedAt: string;
  mode: "predictive" | "recovered" | "unresolved";
}

export interface TimeSenseDayPlan {
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  mode: "normal" | "compression" | "expansion";
  aheadOfSchedule: boolean;
  behindSchedule: boolean;
  driftEvents: DriftEvent[];
  blocks: TimeBlock[];
}

export interface ScriptTask {
  id: string;
  label: string;
  source: TimeSource;
  durationMinutes: number;
  nonNegotiable?: boolean;
  basePriority?: number;
}

export interface BuildDayInput {
  date: string;                // YYYY-MM-DD
  wakeTime: string;            // "HH:MM"
  sleepTime: string;           // "HH:MM"
  scriptTasks: ScriptTask[];   // from onboarding / 3x3dtd / have-you
}

function ensureDir() {
  if (!fs.existsSync(CORAE_DIR)) {
    fs.mkdirSync(CORAE_DIR, { recursive: true });
  }
}

function readExistingPlan(): TimeSenseDayPlan | null {
  try {
    if (!fs.existsSync(PLAN_FILE)) return null;
    const raw = fs.readFileSync(PLAN_FILE, "utf8");
    return JSON.parse(raw) as TimeSenseDayPlan;
  } catch {
    return null;
  }
}

function writePlan(plan: TimeSenseDayPlan): void {
  ensureDir();
  fs.writeFileSync(PLAN_FILE, JSON.stringify(plan, null, 2), "utf8");
}

function minutesBetween(day: string, start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const s = new Date(`${day}T${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:00Z`).getTime();
  const e = new Date(`${day}T${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}:00Z`).getTime();
  return Math.max(0, Math.round((e - s) / 60000));
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function buildDayPlan(input: BuildDayInput): TimeSenseDayPlan {
  const { date, wakeTime, sleepTime, scriptTasks } = input;
  const totalDayMinutes = minutesBetween(date, wakeTime, sleepTime) || 16 * 60;
  const safeTasks = scriptTasks ?? [];

  const basePlan: TimeSenseDayPlan = {
    date,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: "normal",
    aheadOfSchedule: false,
    behindSchedule: false,
    driftEvents: [],
    blocks: [],
  };

  if (!safeTasks.length) {
    writePlan(basePlan);
    return basePlan;
  }

  const totalDuration = safeTasks.reduce(
    (sum, t) => sum + (t.durationMinutes || 15),
    0
  );

  const compressionFactor =
    totalDuration > totalDayMinutes
      ? totalDayMinutes / totalDuration
      : 1;

  const mode: TimeSenseDayPlan["mode"] =
    compressionFactor < 0.8
      ? "compression"
      : totalDuration < totalDayMinutes * 0.6
      ? "expansion"
      : "normal";

  const [wh, wm] = wakeTime.split(":").map(Number);
  let cursor = new Date(
    `${date}T${String(wh).padStart(2, "0")}:${String(wm).padStart(2, "0")}:00Z`
  ).getTime();

  const blocks: TimeBlock[] = safeTasks.map((t, index) => {
    const rawMinutes = t.durationMinutes || 15;
    const minutes = Math.max(10, Math.round(rawMinutes * compressionFactor));
    const startIso = new Date(cursor).toISOString();
    const endIso = new Date(cursor + minutes * 60000).toISOString();
    cursor += minutes * 60000;

    return {
      id: t.id || `ts-block-${index}`,
      label: t.label,
      source: t.source || "script",
      start: startIso,
      end: endIso,
      priority: clamp(t.basePriority ?? (t.nonNegotiable ? 1 : 3), 1, 5),
      nonNegotiable: !!t.nonNegotiable,
      status: "pending",
    };
  });

  const plan: TimeSenseDayPlan = {
    ...basePlan,
    mode,
    blocks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writePlan(plan);
  return plan;
}

export function getCurrentPlan(): TimeSenseDayPlan | null {
  return readExistingPlan();
}

export function updateBlockStatus(
  blockId: string,
  status: TimeBlockStatus,
  now: Date = new Date()
): TimeSenseDayPlan | null {
  const plan = readExistingPlan();
  if (!plan) return null;

  const idx = plan.blocks.findIndex((b) => b.id === blockId);
  if (idx === -1) return plan;

  plan.blocks[idx].status = status;
  plan.updatedAt = now.toISOString();

  writePlan(plan);
  return plan;
}

export interface DriftCheckResult {
  plan: TimeSenseDayPlan | null;
  activeBlock: TimeBlock | null;
  minutesBehind: number;
  mode: "ok" | "at-risk" | "behind";
}

export function checkDrift(now: Date = new Date()): DriftCheckResult {
  const plan = readExistingPlan();
  if (!plan) {
    return {
      plan: null,
      activeBlock: null,
      minutesBehind: 0,
      mode: "ok",
    };
  }

  const nowTs = now.getTime();
  let active: TimeBlock | null = null;

  for (const block of plan.blocks) {
    const s = new Date(block.start).getTime();
    const e = new Date(block.end).getTime();
    if (nowTs >= s && nowTs <= e) {
      active = block;
      break;
    }
  }

  if (!active) {
    return { plan, activeBlock: null, minutesBehind: 0, mode: "ok" };
  }

  const elapsedMinutes = Math.round(
    (nowTs - new Date(active.start).getTime()) / 60000
  );

  let mode: DriftCheckResult["mode"] = "ok";
  let minutesBehind = 0;

  if (active.status === "pending" && elapsedMinutes > 5) {
    mode = "at-risk";
    minutesBehind = elapsedMinutes - 5;
  } else if (active.status === "active" && elapsedMinutes > 10) {
    mode = "behind";
    minutesBehind = elapsedMinutes - 10;
  }

  if (minutesBehind > 0) {
    plan.behindSchedule = true;
    plan.aheadOfSchedule = false;
    plan.driftEvents.push({
      id: `drift-${Date.now()}`,
      blockId: active.id,
      minutesBehind,
      detectedAt: now.toISOString(),
      mode: mode === "behind" ? "unresolved" : "predictive",
    });
    plan.updatedAt = now.toISOString();
    writePlan(plan);
  }

  return { plan, activeBlock: active, minutesBehind, mode };
}
