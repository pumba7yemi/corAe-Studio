// apps/studio/lib/obari/store.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { Booking, Deal, PriceLockChain, WeekRun } from './types';

const ROOT = path.join(process.cwd(), 'var', 'obari');
const DEALS = path.join(ROOT, 'deals.json');
const BOOKINGS = path.join(ROOT, 'bookings.json');
const WEEKS = path.join(ROOT, 'weeks.json');

type Tables = {
  deals: Deal[];
  bookings: Booking[];
  weeks: WeekRun[];
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  for (const file of [DEALS, BOOKINGS, WEEKS]) {
    try { await fs.access(file); } catch { await fs.writeFile(file, '[]', 'utf8'); }
  }
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensure();
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as T[];
}

async function writeJson<T>(file: string, rows: T[]): Promise<void> {
  await ensure();
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

export async function listDeals() { return readJson<Deal>(DEALS); }
export async function saveDeals(rows: Deal[]) { return writeJson<Deal>(DEALS, rows); }

export async function listBookings() { return readJson<Booking>(BOOKINGS); }
export async function saveBookings(rows: Booking[]) { return writeJson<Booking>(BOOKINGS, rows); }

export async function listWeeks() { return readJson<WeekRun>(WEEKS); }
export async function saveWeeks(rows: WeekRun[]) { return writeJson<WeekRun>(WEEKS, rows); }

// Helpers
export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function makePriceLockChain(lockedBy: string, rules: PriceLockChain['rules']): PriceLockChain {
  return {
    id: newId('plc'),
    rules,
    createdAt: new Date().toISOString(),
    lockedBy,
  };
}