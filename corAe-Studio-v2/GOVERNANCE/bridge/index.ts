import fs from "node:fs";
import path from "node:path";

const V2_ROOT = process.cwd();

export function readGovernanceRuntimeJSON<T = any>(file: string): T | null {
  try {
    const p = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "core", file);
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readSubject1Doc(name: string): string | null {
  try {
    const p = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "subject1", name);
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export const GOVERNANCE_ROOT = "corAe-Studio-v2/GOVERNANCE";
export const GOVERNANCE_VERSION = "SGL-UNIFIED-01";
