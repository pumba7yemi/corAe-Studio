/**
 * corAe • Have-You Logic™ Engine
 * Evaluates and triggers reminders based on stored Have-You items.
 */
import { HaveYou, EvaluateResult } from "./types";

const mem = { items: [] as HaveYou[] };
const newid = () => "hv_" + Math.random().toString(36).slice(2, 10);

/** Register new items (called by bulkUpsert in route.ts) */
export function register(items: HaveYou[], scope: HaveYou["scope"] = "HOME") {
  for (const it of items) {
    if (!it.text || !it.schedule) continue;
    mem.items.unshift({
      ...it,
      id: it.id ?? newid(),
      scope,
      enabled: it.enabled ?? true,
    });
  }
  mem.items = mem.items.slice(0, 1000);
}

/** Core evaluator — returns all prompts due this minute */
export function evaluate(now = new Date()): EvaluateResult {
  const triggered: HaveYou[] = [];
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const day = ["SUN","MON","TUE","WED","THU","FRI","SAT"][now.getDay()];
  const key = `${day} ${hh}:${mm}`;

  for (const it of mem.items) {
    if (!it.enabled) continue;
    const s = it.schedule.toUpperCase().trim();
    if (s === `DAILY ${hh}:${mm}` || s === key) {
      triggered.push(it);
    }
  }

  // Next check in 1 minute
  const nextCheck = new Date(now.getTime() + 60_000).toISOString();
  return { triggered, nextCheck };
}

/** Utility for manual trigger (e.g. CRON job or test endpoint) */
export function runTick(scope?: HaveYou["scope"]) {
  const res = evaluate();
  // If a scope is provided, filter the triggered items to that scope
  const filtered = scope ? { ...res, triggered: res.triggered.filter((h) => h.scope === scope) } : res;
  if (filtered.triggered.length) {
    console.log(`Have-You Triggered (${filtered.triggered.length}):`);
    for (const h of filtered.triggered) console.log("→", h.text, "(", h.scope, ")");
  }
  return filtered;
}

/** Export in-memory state (for GET requests) */
export function list(scope?: HaveYou["scope"]) {
  return scope ? mem.items.filter((i) => i.scope === scope) : mem.items;
}