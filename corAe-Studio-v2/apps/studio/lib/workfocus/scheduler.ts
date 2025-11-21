const WEEKDAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

function nextWeekday(target: number, now = new Date()) {
  const d = new Date(now);
  const diff = (target - d.getDay() + 7) % 7 || 7; // always the NEXT occurrence
  d.setDate(d.getDate() + diff);
  return d;
}
function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, nth: number) {
  const d = new Date(year, monthIndex, 1);
  const offset = (weekday - d.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  const dt = new Date(year, monthIndex, day);
  return dt.getMonth() === monthIndex ? dt : null;
}
function parseTimeLike(text: string) {
  const t = (text || "").toLowerCase().trim();
  const m1 = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (m1) {
    let h = parseInt(m1[1],10); const m = m1[2] ? parseInt(m1[2],10) : 0;
    const ap = m1[3]; if (ap === "pm" && h < 12) h += 12; if (ap === "am" && h === 12) h = 0;
    return { h, m };
  }
  const m2 = t.match(/\b(\d{1,2}):(\d{2})\b/);
  if (m2) return { h: parseInt(m2[1],10), m: parseInt(m2[2],10) };
  return null;
}

/** Compute next occurrence from free text like:
 *  - "Every Wednesday"
 *  - "Wednesday" (assumes next)
 *  - "Week 1 & 3 Thursday"
 *  - "Before 2 PM Thursday" (time comes from deadline)
 */
export function computeNextOccurrence(whenText?: string, deadlineText?: string, now = new Date()): Date | null {
  if (!whenText) return null;
  const text = whenText.toLowerCase();

  // Every <weekday>
  let m = text.match(/every\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (m) {
    const wd = WEEKDAYS.indexOf(m[1]);
    const d = nextWeekday(wd, now);
    const t = parseTimeLike(deadlineText || "");
    d.setHours(t?.h ?? 9, t?.m ?? 0, 0, 0);
    return d;
  }

  // Bare <weekday>
  m = text.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (m) {
    const wd = WEEKDAYS.indexOf(m[1]);
    const d = nextWeekday(wd, now);
    const t = parseTimeLike(deadlineText || whenText);
    d.setHours(t?.h ?? 9, t?.m ?? 0, 0, 0);
    return d;
  }

  // Week 1 & 3 Thursday
  m = text.match(/week\s+([1-4](?:\s*&\s*[1-4])*)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (m) {
    const nths = m[1].split("&").map(s => parseInt(s.trim(),10));
    const wd = WEEKDAYS.indexOf(m[2]);
    const base = new Date(now); base.setHours(0,0,0,0);

    const candidates: Date[] = [];
    for (let addMonth = 0; addMonth < 2; addMonth++) {
      const y = base.getFullYear(), mth = base.getMonth() + addMonth;
      for (const nth of nths) {
        const dt = nthWeekdayOfMonth(y, mth, wd, nth);
        if (dt) candidates.push(dt);
      }
    }
    candidates.sort((a,b)=>a.getTime()-b.getTime());
    const chosen = candidates.find(d => d.getTime() > now.getTime()) || candidates[0];
    if (!chosen) return null;
    const t = parseTimeLike(deadlineText || whenText);
    chosen.setHours(t?.h ?? 9, t?.m ?? 0, 0, 0);
    return chosen;
  }

  return null; // unparsed => show at bottom
}
