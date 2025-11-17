import fs from 'node:fs/promises';
import path from 'node:path';

const CSS_PATH = path.join(process.cwd(), 'apps', 'studio', 'app', 'globals.css');
const TOKENS_START = '/* @tokens:start */';
const TOKENS_END   = '/* @tokens:end */';

export type BrandTokens = {
  primary: string;
  secondary?: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  radius?: string;
  font?: string;
};

export async function readGlobals(): Promise<string> {
  return fs.readFile(CSS_PATH, 'utf8');
}

export async function writeGlobals(nextCss: string): Promise<void> {
  await fs.writeFile(CSS_PATH, nextCss, 'utf8');
}

export async function applyBrandTokens(tokens: Partial<BrandTokens>): Promise<{applied:boolean}> {
  const css = await readGlobals();
  const start = css.indexOf(TOKENS_START);
  const end   = css.indexOf(TOKENS_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Brand token markers not found in globals.css');
  }
  const before = css.slice(0, start + TOKENS_START.length);
  const after  = css.slice(end);

  // Build new token block
  const merged = {
    primary: '#7cc4ff',
    secondary: '#22c55e',
    background: '#0b0f14',
    surface: '#121821',
    text: '#e6eef7',
    muted: '#9fb3c8',
    border: '#213042',
    radius: '16px',
    font: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "SF Pro", Arial, sans-serif',
    ...tokens
  };

  const tokenCss = `
:root {
  --primary: ${merged.primary};
  --secondary: ${merged.secondary};
  --background: ${merged.background};
  --surface: ${merged.surface};
  --text: ${merged.text};
  --muted: ${merged.muted};
  --border: ${merged.border};
  --radius: ${merged.radius};
  --font: ${merged.font};
}
`.trim();

  const nextCss = `${before}\n${tokenCss}\n${after}`;
  await writeGlobals(nextCss);
  return { applied: true };
}
