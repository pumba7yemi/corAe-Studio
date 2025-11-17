// apps/ship/business/oms/obari/thedeal/schedule/index.ts
// OBARI — TheDeal · Stage 2: Schedule
// Purpose:
// - Provide a constitutional scheduler that produces a schedule snapshot
//   {mode, weekRef?, month?, year?, startDate, endDate, label}
// - Persist/restore that snapshot to the canonical sessionStorage key
//   "obari.schedule.selection" (used by Order › Prep 150.logic)
// - Keep math deterministic, simple, and business-friendly.
// Notes:
// - All dates are ISO (YYYY-MM-DD) in local time (no TZ juggling).
// - “CYCLE_28” uses a fixed anchor and 4×7d blocks (W1..W4).
// - “MONTHLY” and “HYBRID” are month-aware; HYBRID = rolling 4-week window
//   but we still include (month, year) for reporting coherence.

export type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";
export type WeekRef = "W1" | "W2" | "W3" | "W4";

export type SavedSchedule = {
  mode: ScheduleMode;
  weekRef?: WeekRef | null;
  month?: number | null; // 1..12 when MONTHLY
  year?: number | null;  // e.g., 2025 when MONTHLY
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  label?: string | null;
};

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compute a schedule window for OBARI TheDeal.
 *
 * @param mode         "CYCLE_28" | "MONTHLY" | "HYBRID"
 * @param opts.date    reference date (default: today)
 * @param opts.weekRef optional W1..W4 (used by CYCLE_28; optional for MONTHLY/HYBRID)
 * @param opts.month   explicit month (1..12) for MONTHLY; default uses today’s month
 * @param opts.year    explicit year for MONTHLY; default uses today’s year
 */
export function computeScheduleWindow(
  mode: ScheduleMode,
  opts: { date?: Date; weekRef?: WeekRef; month?: number; year?: number } = {}
): SavedSchedule {
  const now = stripTime(opts.date ?? new Date());

  if (mode === "CYCLE_28") {
    const week = opts.weekRef ?? inferCycleWeekRef(now);
    const { start, end } = cycle28Window(now, week);
    return {
      mode,
      weekRef: week,
      month: null,
      year: null,
      startDate: toISO(start),
      endDate: toISO(end),
      label: `28-day cycle · ${week} · ${fmtRange(start, end)}`,
    };
  }

  if (mode === "MONTHLY") {
    const m = clampMonth(opts.month ?? now.getMonth() + 1);
    const y = opts.year ?? now.getFullYear();
    const { start, end } = monthWindow(y, m);
    return {
      mode,
      weekRef: inferMonthlyBand(now) as WeekRef,
      month: m,
      year: y,
      startDate: toISO(start),
      endDate: toISO(end),
      label: `Monthly · ${yyyyMm(y, m)} · ${fmtRange(start, end)}`,
    };
  }

  // HYBRID: rolling 4-week window (28d) starting at the beginning of the current “monthly band”
  // Bands: 1–7 (W1), 8–14 (W2), 15–21 (W3), 22–end (W4). Start at band’s day 1, extend 27 days.
  if (mode === "HYBRID") {
    const bandStart = monthlyBandStart(now);
    const start = bandStart;
    const end = addDays(start, 27);
    return {
      mode,
      weekRef: inferMonthlyBand(now) as WeekRef,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      startDate: toISO(start),
      endDate: toISO(end),
      label: `Hybrid (rolling 4-week) · ${fmtRange(start, end)}`,
    };
  }

  // exhaustive guard
  const _exhaustive: never = mode;
  throw new Error(`Unsupported mode: ${_exhaustive}`);
}

/**
 * Persist a schedule snapshot to the canonical key the UI expects.
 * Safe to call in any environment (no-op on server).
 */
export function saveScheduleToSession(s: SavedSchedule): void {
  if (typeof window === "undefined" || !window?.sessionStorage) return;
  window.sessionStorage.setItem(SCHEDULE_KEY, JSON.stringify(s));
}

/**
 * Load a previously persisted schedule snapshot, if available.
 * Returns null when not found or in non-browser environments.
 */
export function loadScheduleFromSession(): SavedSchedule | null {
  if (typeof window === "undefined" || !window?.sessionStorage) return null;
  const raw = window.sessionStorage.getItem(SCHEDULE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SavedSchedule;
    // minimal shape check
    if (!parsed?.mode || !parsed?.startDate || !parsed?.endDate) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Convenience: produce + persist in one call.
 */
export function makeAndSaveSchedule(
  mode: ScheduleMode,
  opts?: { date?: Date; weekRef?: WeekRef; month?: number; year?: number }
): SavedSchedule {
  const s = computeScheduleWindow(mode, opts);
  saveScheduleToSession(s);
  return s;
}

// Canonical sessionStorage key used by Order › Prep 150.logic
export const SCHEDULE_KEY = "obari.schedule.selection";

// ────────────────────────────────────────────────────────────────────────────
// Internals — CYCLE_28
// ────────────────────────────────────────────────────────────────────────────

/**
 * For a deterministic 28-day cycle, we fix an anchor date and split into 4×7 blocks.
 * Anchor: 2024-01-01 (local). You can move this to your fiscal anchor if needed.
 */
const CYCLE_ANCHOR = new Date(2024, 0, 1); // Jan 1, 2024

function cycle28Window(ref: Date, week: WeekRef): { start: Date; end: Date } {
  const daysFromAnchor = diffDays(CYCLE_ANCHOR, ref);
  const cycleIndex = Math.floor(daysFromAnchor / 28); // which 28-day cycle we’re in
  const cycleStart = addDays(CYCLE_ANCHOR, cycleIndex * 28);

  const offsetMap: Record<WeekRef, number> = { W1: 0, W2: 7, W3: 14, W4: 21 };
  const start = addDays(cycleStart, offsetMap[week]);
  const end = addDays(start, 6); // 7 days inclusive
  return { start, end };
}

/**
 * If a week isn’t explicitly chosen, infer it from the anchor cycle position.
 */
function inferCycleWeekRef(ref: Date): WeekRef {
  const daysFromAnchor = diffDays(CYCLE_ANCHOR, ref);
  const within = mod(daysFromAnchor, 28);
  if (within < 7) return "W1";
  if (within < 14) return "W2";
  if (within < 21) return "W3";
  return "W4";
}

// ────────────────────────────────────────────────────────────────────────────
/* Internals — MONTHLY & HYBRID */
// ────────────────────────────────────────────────────────────────────────────

function monthWindow(year: number, month1to12: number): { start: Date; end: Date } {
  const m = clampMonth(month1to12);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 0); // day 0 = last day of previous month
  return { start, end };
}

function inferMonthlyBand(ref: Date): WeekRef {
  const d = ref.getDate();
  if (d <= 7) return "W1";
  if (d <= 14) return "W2";
  if (d <= 21) return "W3";
  return "W4";
}

function monthlyBandStart(ref: Date): Date {
  const band = inferMonthlyBand(ref);
  const dayStart = band === "W1" ? 1 : band === "W2" ? 8 : band === "W3" ? 15 : 22;
  return new Date(ref.getFullYear(), ref.getMonth(), dayStart);
}

// ────────────────────────────────────────────────────────────────────────────
// Date helpers
// ────────────────────────────────────────────────────────────────────────────

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}
function diffDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const a0 = stripTime(a).getTime();
  const b0 = stripTime(b).getTime();
  return Math.floor((b0 - a0) / msPerDay);
}
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}
function clampMonth(m: number): number {
  if (m < 1) return 1;
  if (m > 12) return 12;
  return m;
}
function yyyyMm(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, "0")}`;
}
function fmtRange(s: Date, e: Date): string {
  return `${toISO(s)} → ${toISO(e)}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Example (commented):
// const snap = computeScheduleWindow("CYCLE_28", { weekRef: "W2" });
// saveScheduleToSession(snap);
// const again = loadScheduleFromSession();
// ────────────────────────────────────────────────────────────────────────────