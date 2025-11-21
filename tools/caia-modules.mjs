import fs from 'fs/promises';
import path from 'path';

const CANDIDATES = [
  path.join(process.cwd(), '.corae', 'caia.modules.json'),
  path.join(process.cwd(), '..', '.corae', 'caia.modules.json'),
  path.join(process.cwd(), '..', '..', '.corae', 'caia.modules.json'),
  path.join(process.cwd(), '..', '..', '..', '.corae', 'caia.modules.json'),
];

async function find() {
  for (const p of CANDIDATES) {
    try {
      await fs.access(p);
      return p;
    } catch {}
  }
  return null;
}

export async function loadModules() {
  const p = await find();
  if (!p) throw new Error('.corae/caia.modules.json not found');
  const txt = await fs.readFile(p, 'utf8');
  return JSON.parse(txt);
}

export default { loadModules };
