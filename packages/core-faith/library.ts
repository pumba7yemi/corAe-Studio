import fs from 'node:fs/promises';
import path from 'node:path';
import { PrayerDoc } from './types';

const ROOT = path.resolve(process.cwd(), 'apps', 'studio', '.data', 'faith', 'library');

async function ensureRoot() {
  await fs.mkdir(ROOT, { recursive: true });
}

export async function listPrayerDocs(): Promise<PrayerDoc[]> {
  await ensureRoot();
  const files = await fs.readdir(ROOT);
  const items: PrayerDoc[] = [];
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    try {
      const txt = await fs.readFile(path.join(ROOT, f), 'utf8');
      items.push(JSON.parse(txt));
    } catch (e) {
      // ignore parse errors
    }
  }
  items.sort((a, b) => (b.createdISO || '').localeCompare(a.createdISO || ''));
  return items;
}

export async function getPrayerDoc(slug: string): Promise<PrayerDoc | null> {
  await ensureRoot();
  const p = path.join(ROOT, `${slug}.json`);
  try {
    const txt = await fs.readFile(p, 'utf8');
    return JSON.parse(txt) as PrayerDoc;
  } catch (e) {
    return null;
  }
}

export async function savePrayerDoc(doc: PrayerDoc): Promise<void> {
  await ensureRoot();
  const p = path.join(ROOT, `${doc.slug}.json`);
  if (!doc.createdISO) doc.createdISO = new Date().toISOString();
  await fs.writeFile(p, JSON.stringify(doc, null, 2), 'utf8');
}
