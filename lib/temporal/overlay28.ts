// corAe — temporal/overlay28
// One-file utility to build a 28-day cadence overlay and merge Pulse + DTD entries.
// Kept framework-agnostic so it can be used by any app route.

// ---------- Types ----------
export type WeekRef = "W1" | "W2" | "W3" | "W4";

export type PulseEvent = {
  id: string;
  title: string;
  startISO: string;           // YYYY-MM-DDTHH:mm:ss.sssZ
  stage?: "ORDER" | "BOOKING" | "ACTIVE" | "REPORTING" | "INVOICING";
};

export type DtdEntry = {
  id: string;
  date: string;               // YYYY-MM-DD
  title: string;
  note?: string | null;
  tags?: string[];
};

export type OverlayCell = {
  isoDate: string;            // YYYY-MM-DD
  label: string;              // Day label (e.g., Tue 14)
  dayInCycle: number;         // 0..27
  week: WeekRef;
  pulse: PulseEvent[];
  dtd: DtdEntry[];
};

// ---------- helpers ----------
const DAY = 86400000;

function clampDay(d: Date) {
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function labelOf(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit" });
}

function weekFromDay(dayInCycle: number): WeekRef {
  if (dayInCycle <= 6)  return "W1";
  if (dayInCycle <= 13) return "W2";
  if (dayInCycle <= 20) return "W3";
  return "W4";
}

function toDateOnly(iso: string): string {
  // Accept either date-only or full ISO; always return YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return fmtYMD(d);
}

// ---------- core builders ----------
export function buildOverlay(args: {
  anchorISO?: string;    // default: today
  cycle?: number;        // default: 28
}): OverlayCell[] {
  const cycle = Math.max(1, Math.floor(args.cycle ?? 28));
  const anchor = clampDay(new Date(args.anchorISO ?? Date.now()));
  const anchorYMD = fmtYMD(anchor);

  // Start the window at the beginning of the 28-day cycle that includes anchor
  const epoch = clampDay(new Date(anchor)); // copy
  // shift back to cycle boundary: use epoch day index mod cycle
  const dayIndex = Math.floor((epoch.getTime() - clampDay(new Date(epoch)).getTime()) / DAY); // always 0
  const offset = ((dayIndex % cycle) + cycle) % cycle; // 0..cycle-1
  const start = new Date(epoch.getTime() - offset * DAY);

  const cells: OverlayCell[] = [];
  for (let i = 0; i < cycle; i++) {
    const d = new Date(start.getTime() + i * DAY);
    cells.push({
      isoDate: fmtYMD(d),
      label: labelOf(d),
      dayInCycle: i,
      week: weekFromDay(i),
      pulse: [],
      dtd: [],
    });
  }

  // ensure anchor exists in window (for sanity)
  if (!cells.some((c) => c.isoDate === anchorYMD)) {
    // if somehow out of range, rebuild strictly from anchor-27..anchor
    const start2 = new Date(anchor.getTime() - (cycle - 1) * DAY);
    cells.length = 0;
    for (let i = 0; i < cycle; i++) {
      const d = new Date(start2.getTime() + i * DAY);
      cells.push({
        isoDate: fmtYMD(d),
        label: labelOf(d),
        dayInCycle: i,
        week: weekFromDay(i),
        pulse: [],
        dtd: [],
      });
    }
  }

  return cells;
}

export function mergeWithDTD(
  cells: OverlayCell[],
  pulse: PulseEvent[] = [],
  dtd: DtdEntry[] = [],
): OverlayCell[] {
  const byDate = new Map<string, OverlayCell>(cells.map((c) => [c.isoDate, { ...c, pulse: [], dtd: [] }]));

  for (const p of pulse) {
    const ymd = toDateOnly(p.startISO);
    const cell = byDate.get(ymd);
    if (cell) cell.pulse.push(p);
  }

  for (const d of dtd) {
    const ymd = toDateOnly(d.date);
    const cell = byDate.get(ymd);
    if (cell) cell.dtd.push(d);
  }

  return Array.from(byDate.values()).sort((a, b) => (a.isoDate < b.isoDate ? -1 : 1));
}

/** Convenience: build overlay and merge sources in one call. */
export function buildOverlayWithDTD(args: {
  anchorISO?: string;
  cycle?: number;
  pulse?: PulseEvent[];
  dtd?: DtdEntry[];
}): { map: OverlayCell[]; merged: OverlayCell[] } {
  const map = buildOverlay({ anchorISO: args.anchorISO, cycle: args.cycle });
  const merged = mergeWithDTD(map, args.pulse ?? [], args.dtd ?? []);
  return { map, merged };
}

export function hasActivity(c: OverlayCell): boolean {
  return (c.pulse?.length ?? 0) + (c.dtd?.length ?? 0) > 0;
}