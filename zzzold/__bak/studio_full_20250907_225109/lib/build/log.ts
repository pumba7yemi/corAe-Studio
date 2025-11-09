// lib/build/log.ts
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const LOGS_DIR = path.join(ROOT, 'build', 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'one-build.log.jsonl');

export type BuildEvent = {
  ts: string; // ISO timestamp
  level: 'INFO' | 'WARN' | 'ERROR';
  scope: string;
  action: string;
  file?: string;
  notes?: string;
  meta?: Record<string, any>;
};

async function ensureLogDir() {
  await fs.mkdir(LOGS_DIR, { recursive: true });
  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, '', 'utf8');
  }
}

export async function logEvent(ev: BuildEvent) {
  await ensureLogDir();
  await fs.appendFile(LOG_FILE, JSON.stringify(ev) + '\n', 'utf8');
}

export async function readEvents(limit = 200): Promise<BuildEvent[]> {
  await ensureLogDir();
  const raw = await fs.readFile(LOG_FILE, 'utf8').catch(() => '');
  const lines = raw.split('\n').filter(Boolean).slice(-limit);
  return lines.map((l) => JSON.parse(l));
}