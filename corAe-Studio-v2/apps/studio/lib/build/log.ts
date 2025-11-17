// lib/build/log.ts
// Central append/read logger for One-Build + Dev Agent

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const LOGS_DIR = path.join(ROOT, "build", "logs");
const LOG_FILE = path.join(LOGS_DIR, "one-build.log.jsonl");

export type LogLevel = "INFO" | "WARN" | "ERROR";

export type BuildEvent = {
  ts: string;                 // ISO timestamp
  level: LogLevel;            // "INFO" | "WARN" | "ERROR"
  scope: string;              // e.g. "agent", "ship", "onebuild.restore"
  action: string;             // e.g. "JOB_START", "JOB_DONE", "RESTORE_FILE"
  file?: string;              // optional file path
  notes?: string;             // free text notes
  meta?: Record<string, unknown>; // arbitrary JSON
};

async function ensure(): Promise<void> {
  await fs.mkdir(LOGS_DIR, { recursive: true });
  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, "", "utf8");
  }
}

export async function logEvent(ev: BuildEvent): Promise<void> {
  await ensure();
  await fs.appendFile(LOG_FILE, JSON.stringify(ev) + "\n", "utf8");
}

export async function readEvents(limit = 200): Promise<BuildEvent[]> {
  await ensure();
  const raw = await fs.readFile(LOG_FILE, "utf8").catch(() => "");
  if (!raw) return [];
  const lines = raw.split("\n").filter(Boolean).slice(-limit);
  return lines.map((l) => JSON.parse(l) as BuildEvent);
}

/**
 * Compatibility alias for older imports (createShipBundle calls).
 * Some files import { listEvents } — keep that API available.
 */
export const listEvents = readEvents;
