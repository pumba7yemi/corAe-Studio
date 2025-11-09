// app/lib/automate/cronMatch.ts
const DOW_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

function parsePart(part: string, min: number, max: number, dow = false): Set<number> {
  const out = new Set<number>();
  const add = (v: number) => { if (v >= min && v <= max) out.add(v); };

  for (const seg of part.split(",")) {
    if (seg === "*") { for (let i = min; i <= max; i++) add(i); continue; }
    const [range, stepStr] = seg.split("/");
    const step = stepStr ? parseInt(stepStr, 10) : 1;
    if (range.includes("-")) {
      const [aRaw, bRaw] = range.split("-");
      const a = dow ? (DOW_MAP[aRaw.toUpperCase()] ?? parseInt(aRaw, 10)) : parseInt(aRaw, 10);
      const b = dow ? (DOW_MAP[bRaw.toUpperCase()] ?? parseInt(bRaw, 10)) : parseInt(bRaw, 10);
      for (let i = a; i <= b; i += step) add(i);
    } else {
      const single = dow ? (DOW_MAP[range.toUpperCase()] ?? parseInt(range, 10)) : parseInt(range, 10);
      for (let i = single; i <= max; i += step) { add(i); break; }
    }
  }
  return out;
}

/** Supports 5-field cron: "m h dom mon dow". Example: "0 9 * * MON-FRI" */
export function cronMatchesNow(expr: string, d = new Date()): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return false;

  const [mExp, hExp, domExp, monExp, dowExp] = parts;
  const mSet = parsePart(mExp, 0, 59);
  const hSet = parsePart(hExp, 0, 23);
  const domSet = parsePart(domExp, 1, 31);
  const monSet = parsePart(monExp, 1, 12);
  const dowSet = parsePart(dowExp, 0, 6, true);

  const m = d.getMinutes();
  const h = d.getHours();
  const dom = d.getDate();
  const mon = d.getMonth() + 1;
  const dow = d.getDay();

  return mSet.has(m) && hSet.has(h) && domSet.has(dom) && monSet.has(mon) && dowSet.has(dow);
}