import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const V2 = path.join(ROOT, 'corAe-Studio-v2');

const FORBIDDEN_DUPLICATE_DIRS = [
  'apps/life/app/home',
  'apps/life/app/work',
  'apps/life/app/business',
  'apps/life/app/ship',
];

export function checkRepoHygiene() {
  const offenders = [];
  for (const rel of FORBIDDEN_DUPLICATE_DIRS) {
    const p = path.join(V2, rel);
    if (fs.existsSync(p)) offenders.push(rel);
  }
  return { ok: offenders.length === 0, offenders };
}
