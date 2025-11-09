import fs from 'node:fs/promises';
import path from 'node:path';

export type BrandPreset = {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  radius: number; // px
  fontFamily: string; // CSS font-family string
};

const DATA_DIR = path.join(process.cwd(), '.data', 'brand');
const PRESETS_DIR = path.join(DATA_DIR, 'presets');
const ACTIVE_FILE = path.join(DATA_DIR, 'active.json');
const TOKENS_CSS = path.join(process.cwd(), 'app', 'globals.css'); // we re-generate the :root vars region inside

async function ensureDirs() {
  await fs.mkdir(PRESETS_DIR, { recursive: true });
}

export async function listPresets(): Promise<BrandPreset[]> {
  await ensureDirs();
  const files = await fs.readdir(PRESETS_DIR).catch(() => []);
  const out: BrandPreset[] = [];
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(PRESETS_DIR, f), 'utf8');
      const p = JSON.parse(raw);
      out.push(p);
    } catch {}
  }
  return out;
}

export async function savePreset(preset: BrandPreset) {
  await ensureDirs();
  const file = path.join(PRESETS_DIR, safeName(preset.name) + '.json');
  await fs.writeFile(file, JSON.stringify(preset, null, 2), 'utf8');
}

export async function readActive(): Promise<BrandPreset | null> {
  try {
    const raw = await fs.readFile(ACTIVE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setActive(preset: BrandPreset) {
  await ensureDirs();
  await fs.writeFile(ACTIVE_FILE, JSON.stringify(preset, null, 2), 'utf8');
  await rewriteGlobalsCssTokens(preset);
}

/**
 * Rewrites the token block in globals.css between:
 *   /* @tokens:start *\/  and  /* @tokens:end *\/
 * so you keep the rest of your CSS intact.
 */
async function rewriteGlobalsCssTokens(preset: BrandPreset) {
  const css = await fs.readFile(TOKENS_CSS, 'utf8');
  const start = '/* @tokens:start */';
  const end = '/* @tokens:end */';

  const tokenBlock = `
${start}
:root {
  --primary: ${preset.primary};
  --secondary: ${preset.secondary};
  --background: ${preset.background};
  --surface: ${preset.surface};
  --text: ${preset.text};
  --muted: ${preset.muted};

  --radius: ${preset.radius}px;
  --font: ${preset.fontFamily};
}
${end}`.trim();

  if (css.includes(start) && css.includes(end)) {
    const before = css.split(start)[0].trimEnd();
    const after = css.split(end)[1]?.trimStart() ?? '';
    const next = [before, tokenBlock, after].join('\n\n');
    await fs.writeFile(TOKENS_CSS, next, 'utf8');
  } else {
    // If markers don’t exist, prepend the block.
    const next = tokenBlock + '\n\n' + css;
    await fs.writeFile(TOKENS_CSS, next, 'utf8');
  }
}

function safeName(n: string) {
  return n.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/^-+|-+$/g, '');
}
