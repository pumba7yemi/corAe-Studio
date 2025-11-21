import fs from 'node:fs/promises';
import path from 'node:path';
import type { JournalEntry } from './types';

const ROOT = path.resolve(process.cwd(), 'apps', 'studio', '.data', 'faith', 'journal');

export async function saveJournal(entry: JournalEntry) {
  await fs.mkdir(ROOT, { recursive: true });
  const p = path.join(ROOT, `${entry.dateISO}.json`);
  await fs.writeFile(p, JSON.stringify(entry, null, 2), 'utf8');
  return { ok: true };
}

export async function loadJournal(dateISO: string) {
  try {
    const txt = await fs.readFile(path.join(ROOT, `${dateISO}.json`), 'utf8');
    return JSON.parse(txt);
  } catch {
    return undefined;
  }
}
