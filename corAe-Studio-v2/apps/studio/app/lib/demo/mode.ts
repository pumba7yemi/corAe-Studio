import fs from "node:fs";
import path from "node:path";

// demo mode helper (preflight). Keeps state in apps/studio/.demo_state.json so server and API
// can observe demo mode. Provides deterministic PRNG helpers for stable demo data.

const STATE_FILE = path.join(process.cwd(), "apps", "studio", ".demo_state.json");

export function setDemoState(on: boolean) {
  try {
    const payload = { on: !!on, ts: new Date().toISOString() };
    fs.writeFileSync(STATE_FILE, JSON.stringify(payload, null, 2), { encoding: "utf8" });
    return true;
  } catch (e) {
    console.warn("demo: failed to write state file", e);
    return false;
  }
}

export function getDemoState(): { on: boolean; ts?: string } {
  try {
    if (!fs.existsSync(STATE_FILE)) return { on: false };
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw || "{}");
    return { on: !!parsed.on, ts: parsed.ts };
  } catch (e) {
    return { on: false };
  }
}

export function isDemo(): boolean {
  return getDemoState().on === true;
}

// Deterministic PRNG utilities
function hashString(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoRand(key: string): number {
  const state = getDemoState();
  // include timestamp if present so different demo runs can vary if desired
  const seedBase = `${key}:${state.ts ?? ""}`;
  const seed = hashString(seedBase) || 1;
  const r = mulberry32(seed);
  return r();
}

export function demoPick<T>(key: string, arr: T[]): T {
  if (!arr || arr.length === 0) throw new Error("demoPick: empty array");
  const idx = Math.floor(demoRand(key) * arr.length);
  return arr[idx];
}

export function ifDemo<T>(demoValue: T, realValue: T): T {
  return isDemo() ? demoValue : realValue;
}

export function requireDemo(msg?: string) {
  if (!isDemo()) throw new Error(msg ?? "Demo-only API called outside demo mode");
}

export function getDemoSeed() {
  const s = getDemoState();
  return { on: s.on, ts: s.ts };
}
