// apps/studio/lib/obari/utils.ts
// corAe OBARI helpers — 150.logic
// Month-anchored 28-day cadence: W1..W4 are anchored to the first Sunday of the month.

export type WeekRef = "W1" | "W2" | "W3" | "W4";

/** Return the Sunday of the given date (00:00 local). */
function startOfWeekSunday(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay(); // 0=Sun..6=Sat
  const diff = day;        // days back to Sunday
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - diff);
  return dt;
}

/** First Sunday on/after the 1st of the month (00:00 local). */
function firstSundayOfMonth(year: number, month0: number): Date {
  const first = new Date(year, month0, 1, 0, 0, 0, 0);
  // if the 1st is Sunday, keep it; else step forward to next Sunday
  const d = first.getDay(); // 0..6
  if (d === 0) return first;
  const next = new Date(first);
  next.setDate(first.getDate() + (7 - d));
  return next;
}

/**
 * Compute which W1..W4 the given date falls in.
 * Rule: The first Sunday of the month anchors W1; each 7-day block advances Wn.
 * Cross-month spans still map cyclically W1→W4.
 */
export function getCurrentWeekRef(base: Date = new Date()): WeekRef {
  const sunday = startOfWeekSunday(base);
  const anchor = firstSundayOfMonth(base.getFullYear(), base.getMonth());

  // Weeks since anchor
  const deltaDays = Math.floor((sunday.getTime() - anchor.getTime()) / 86400000);
  const weekIdx = Math.max(0, Math.floor(deltaDays / 7)); // 0..N
  const slot = (weekIdx % 4) + 1; // 1..4 cyclic

  return `W${slot}` as WeekRef;
}

/** Next week ref cyclically (W1→W2→W3→W4→W1). */
export function getNextWeekRef(base: Date = new Date()): WeekRef {
  const current = getCurrentWeekRef(base);
  const order: WeekRef[] = ["W1", "W2", "W3", "W4"];
  const i = order.indexOf(current);
  return order[(i + 1) % 4];
}

/** Optionally generate a human label for hubs, e.g., "2025-Wk37 Hub". */
export function formatHubLabel(d: Date = new Date()): string {
  // ISO week number approximation for display (not used for DB keys)
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-Wk${String(weekNo).padStart(2, "0")} Hub`;
}

/**
 * Current hub window for display/keys using the same month-anchored logic.
 * Returns the 7-day span that contains `base` and its WeekRef + label.
 */
export function getCurrentHubWindow(base: Date = new Date()): {
  start: Date; // inclusive
  end: Date;   // exclusive
  weekRef: WeekRef;
  label: string;
} {
  const weekRef = getCurrentWeekRef(base);
  const anchor = firstSundayOfMonth(base.getFullYear(), base.getMonth());
  const sunday = startOfWeekSunday(base);

  const daysFromAnchor = Math.floor((sunday.getTime() - anchor.getTime()) / 86400000);
  const weekIdx = Math.max(0, Math.floor(daysFromAnchor / 7));

  const start = new Date(anchor);
  start.setDate(anchor.getDate() + weekIdx * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return {
    start,
    end,
    weekRef,
    label: formatHubLabel(base),
  };
}
