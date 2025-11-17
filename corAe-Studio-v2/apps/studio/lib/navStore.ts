// apps/studio/lib/navStore.ts
import fs from 'node:fs/promises';
import path from 'node:path';

export type NavItem = { href: string; label: string };

const DATA_DIR = path.join(process.cwd(), '.data');
const NAV_FILE = path.join(DATA_DIR, 'nav.json');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readNav(): Promise<NavItem[]> {
  try {
    const raw = await fs.readFile(NAV_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic shape guard
    return parsed
      .filter((x: any) => x && typeof x.href === 'string' && typeof x.label === 'string')
      .map((x: NavItem) => x);
  } catch {
    return [];
  }
}

export async function saveNav(items: NavItem[]) {
  await ensureDir();
  const tmp = NAV_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), 'utf8');
  await fs.rename(tmp, NAV_FILE);
}

/** Add (or update label of) a nav item, deduping by href */
export async function addNavItem(item: NavItem) {
  const cur = await readNav();
  const i = cur.findIndex((n) => n.href === item.href);
  if (i >= 0) {
    // update label if changed
    if (cur[i].label !== item.label) cur[i] = item;
    await saveNav(cur);
    return;
  }
  cur.push(item);
  // Sort: base routes first-ish, then alpha
  cur.sort((a, b) => a.href.localeCompare(b.href));
  await saveNav(cur);
}

/** Remove by href (handy if you ever need it) */
export async function removeNavItem(href: string) {
  const cur = await readNav();
  const next = cur.filter((n) => n.href !== href);
  await saveNav(next);
}
