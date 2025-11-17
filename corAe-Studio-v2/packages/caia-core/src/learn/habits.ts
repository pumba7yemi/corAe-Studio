// packages/caia-core/src/learn/habits.ts
// Minimal, ship-memory–backed habit learner with threshold policy.

import { readShipMemory, writeShipMemory } from "../memory";

const SCOPE = "habit-learner";
const KEY = "entries";

// Stages
// 1-2: observe
// 3: suggestion
// 4-6: offer_auto
// 7-19: confirm_each
// 20+: default_auto_with_confirm
export type HabitStage = "observe" | "suggest" | "offer_auto" | "confirm_each" | "default_auto_with_confirm";

export interface HabitEntry {
  signature: string;         // canonical signature for the action
  count: number;             // how many times seen
  lastAt: string;            // ISO timestamp
  autoEnabled?: boolean;     // user opted into auto-run for this habit
  autoSince?: string;        // when auto was enabled
  lastContext?: Record<string, unknown>; // optional last context snapshot
}

export interface HabitPolicy {
  stage: HabitStage;
  shouldAsk: boolean;        // ask user before acting
  shouldSuggest: boolean;    // surface “I noticed…” suggestion
  shouldOfferAuto: boolean;  // show “make it automatic?” CTA
  autoRun: boolean;          // proceed automatically (may still ask confirm)
}

function normalizeTask(task: string): string {
  // Simple canonicalization: lowercase, trim, collapse spaces, strip volatile numbers/ids.
  // You can refine with a tokenizer later.
  return task
    .toLowerCase()
    .replace(/\b(id|ref|ticket|order)[- ]?\d+\b/g, "$1")
    .replace(/\d{4,}/g, "")     // trim long numerics
    .replace(/[^\w\s:/-]+/g, "")// remove punctuation noise (keep a few separators)
    .replace(/\s+/g, " ")
    .trim();
}

function stageForCount(count: number, autoEnabled?: boolean): HabitStage {
  if (autoEnabled) return "default_auto_with_confirm";
  if (count >= 20) return "default_auto_with_confirm";
  if (count >= 7)  return "confirm_each";
  if (count >= 4)  return "offer_auto";
  if (count >= 3)  return "suggest";
  return "observe";
}

export function policyFor(entry: HabitEntry): HabitPolicy {
  const stage = stageForCount(entry.count, entry.autoEnabled);
  return {
    stage,
    shouldAsk: stage !== "observe",                 // ask from 3rd use onward
    shouldSuggest: stage === "suggest",
    shouldOfferAuto: stage === "offer_auto",
    autoRun: stage === "default_auto_with_confirm" && !!entry.autoEnabled
  };
}

async function loadAll(): Promise<Record<string, HabitEntry>> {
  const bag: any = await readShipMemory(SCOPE);
  const raw = typeof bag[KEY] === "string" ? (bag[KEY] as string) : "";
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, HabitEntry>; } catch { return {}; }
}

async function saveAll(entries: Record<string, HabitEntry>): Promise<void> {
  await writeShipMemory(SCOPE, { [KEY]: JSON.stringify(entries) });
}

export async function recordHabit(task: string, context?: Record<string, unknown>): Promise<{ entry: HabitEntry; policy: HabitPolicy; }> {
  const signature = normalizeTask(task);
  const all = await loadAll();
  const now = new Date().toISOString();

  const entry: HabitEntry = all[signature]
    ? { ...all[signature], count: all[signature].count + 1, lastAt: now, lastContext: context }
    : { signature, count: 1, lastAt: now, lastContext: context };

  all[signature] = entry;
  await saveAll(all);

  return { entry, policy: policyFor(entry) };
}

// User opt-in/out toggles (e.g., when they click “Yes, make this automatic”)
export async function enableAuto(signatureOrTask: string): Promise<HabitEntry> {
  const signature = normalizeTask(signatureOrTask);
  const all = await loadAll();
  const now = new Date().toISOString();
  const base = all[signature] ?? { signature, count: 0, lastAt: now };
  const updated: HabitEntry = { ...base, autoEnabled: true, autoSince: now };
  all[signature] = updated;
  await saveAll(all);
  return updated;
}

export async function disableAuto(signatureOrTask: string): Promise<HabitEntry> {
  const signature = normalizeTask(signatureOrTask);
  const all = await loadAll();
  if (!all[signature]) throw new Error(`No habit for signature: ${signature}`);
  const updated: HabitEntry = { ...all[signature], autoEnabled: false };
  all[signature] = updated;
  await saveAll(all);
  return updated;
}

// Query helpers
export async function getHabit(signatureOrTask: string): Promise<HabitEntry | null> {
  const signature = normalizeTask(signatureOrTask);
  const all = await loadAll();
  return all[signature] ?? null;
}

export async function listHabits(limit = 100): Promise<HabitEntry[]> {
  const all = await loadAll();
  return Object.values(all)
    .sort((a, b) => (b.lastAt.localeCompare(a.lastAt)))
    .slice(0, limit);
}
