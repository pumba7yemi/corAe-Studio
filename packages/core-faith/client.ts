import { JournalEntry, PrayerDoc } from './types';

export async function saveJournal(entry: JournalEntry) {
  const res = await fetch('/api/ship/home/faith/journal', { method: 'POST', body: JSON.stringify(entry), headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function listLibrary() {
  const res = await fetch('/api/ship/home/faith/library');
  return res.json() as Promise<{ ok: boolean; items: PrayerDoc[] }>;
}

export async function getPrayer(slug: string) {
  const res = await fetch(`/api/ship/home/faith/library/${encodeURIComponent(slug)}`);
  return res.json() as Promise<{ ok: boolean; item?: PrayerDoc }>;
}
