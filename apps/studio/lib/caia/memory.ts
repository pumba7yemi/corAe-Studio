// apps/studio/lib/caia/memory.ts
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'build', '.data', 'caia');
const DOCKYARD_FILE = path.join(DATA_DIR, 'dockyard.memory.jsonl'); // growth memory (private)
const SHIP_FILE = path.join(DATA_DIR, 'ship.memory.readonly.jsonl'); // optional public snippets
const SEED_FILE = path.join(ROOT, 'build', 'brain', 'base.seed.json');

export type MemoryItem = {
  ts: string;     // ISO
  role: 'user' | 'assistant' | 'system' | 'note';
  text: string;
  user?: string;  // who asked
  scope?: 'dockyard' | 'ship';
};

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // touch files
  await fs.writeFile(DOCKYARD_FILE, await fs.readFile(DOCKYARD_FILE).catch(() => ''), 'utf8');
  await fs.writeFile(SHIP_FILE, await fs.readFile(SHIP_FILE).catch(() => ''), 'utf8');
}

export async function appendDockyardMemory(item: Omit<MemoryItem, 'scope'>) {
  await ensure();
  const it: MemoryItem = { ...item, scope: 'dockyard' };
  await fs.appendFile(DOCKYARD_FILE, JSON.stringify(it) + '\n', 'utf8');
}

export async function readDockyardMemory(limit = 200): Promise<MemoryItem[]> {
  await ensure();
  const raw = await fs.readFile(DOCKYARD_FILE, 'utf8').catch(() => '');
  const lines = raw.split('\n').filter(Boolean).slice(-limit);
  return lines.map(l => JSON.parse(l));
}

export async function readShipSeed(): Promise<{ system: string[]; facts: string[]; name: string; version: string }> {
  const raw = await fs.readFile(SEED_FILE, 'utf8').catch(() => '');
  if (!raw) return { version: '0', name: 'Empty', system: [], facts: [] };
  const j = JSON.parse(raw);
  return { version: String(j.version || '1'), name: j.name || 'Seed', system: j.system || [], facts: j.facts || [] };
}

export async function readShipMemory(limit = 200): Promise<MemoryItem[]> {
  await ensure();
  const raw = await fs.readFile(SHIP_FILE, 'utf8').catch(() => '');
  const lines = raw.split('\n').filter(Boolean).slice(-limit);
  return lines.map(l => JSON.parse(l));
}
