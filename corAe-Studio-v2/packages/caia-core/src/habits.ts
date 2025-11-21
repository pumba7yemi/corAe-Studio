// packages/caia-core/src/habits.ts
// Minimal in-memory habit engine (swap later for Prisma/Mongo).
export type HabitEntry = {
  id: string;
  task: string;
  at: string;                 // ISO timestamp
  context?: Record<string, unknown>;
};

export type HabitPolicy = {
  key: string;                // signature or task key
  auto: boolean;              // if CAIA should prompt/auto-run this flow
  last?: string | null;       // last engagement ISO
  count: number;              // total records seen
};

const entries: HabitEntry[] = [];
const policies = new Map<string, HabitPolicy>();

function nowISO() { return new Date().toISOString(); }
function id() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }

/** Flatten a signature: prefer explicit signature; fallback to task */
function keyFrom(task?: string, signature?: string) {
  return (signature ?? task ?? "").trim();
}

export async function listHabits(limit = 50): Promise<HabitEntry[]> {
  const n = Math.max(1, Math.min(limit, 500));
  return entries.slice(-n).reverse();
}

export async function getHabit(signatureOrTask: string): Promise<HabitPolicy | null> {
  const k = keyFrom(signatureOrTask);
  return policies.get(k) ?? null;
}

export async function enableAuto(signatureOrTask: string): Promise<HabitPolicy> {
  const k = keyFrom(signatureOrTask);
  const base = policies.get(k) ?? { key: k, auto: false, last: null, count: 0 };
  const next = { ...base, auto: true };
  policies.set(k, next);
  return next;
}

export async function disableAuto(signatureOrTask: string): Promise<HabitPolicy> {
  const k = keyFrom(signatureOrTask);
  const base = policies.get(k) ?? { key: k, auto: false, last: null, count: 0 };
  const next = { ...base, auto: false };
  policies.set(k, next);
  return next;
}

export async function recordHabit(task: string, context?: Record<string, unknown>):
  Promise<{ entry: HabitEntry; policy: HabitPolicy; }> {
  const entry: HabitEntry = { id: id(), task, at: nowISO(), context };
  entries.push(entry);
  const k = keyFrom(task);
  const base = policies.get(k) ?? { key: k, auto: false, last: null, count: 0 };
  const next = { ...base, last: entry.at, count: base.count + 1 };
  policies.set(k, next);
  return { entry, policy: next };
}

// Simple bundle for consumers who prefer a single import.
export const Habits = { listHabits, getHabit, enableAuto, disableAuto, recordHabit };
