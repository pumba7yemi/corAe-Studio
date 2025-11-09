/* ──────────────────────────────────────────────────────────────
   corAe Home — Date Utility
   Lightweight helpers for day naming and ISO date handling.
   Keeps client-side code framework-agnostic.
────────────────────────────────────────────────────────────── */

/** Return today's weekday (e.g. "Monday") */
export function getTodayName(): string {
  return new Date().toLocaleDateString(undefined, { weekday: "long" });
}

/** Format date to short readable form (e.g. 13 Oct 2025) */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Compare whether two dates share the same calendar day */
export function isSameDay(a: Date | string, b: Date | string): boolean {
  const d1 = typeof a === "string" ? new Date(a) : a;
  const d2 = typeof b === "string" ? new Date(b) : b;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/** Add N days to a date */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}