// apps/studio/lib/theme/themeEngine.ts
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
  radius?: string;   // e.g. "16px"
  font?: string;     // CSS font-family string
};

/** Default baseline (corAe dark) */
const DEFAULT_TOKENS: Required<BrandTokens> = {
  primary:   '#7cc4ff',
  secondary: '#22c55e',
  background:'#0b0f14',
  surface:   '#121821',
  text:      '#e6eef7',
  muted:     '#9fb3c8',
  border:    '#213042',
  radius:    '16px',
  font:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "SF Pro", Arial, sans-serif',
};

/** Minimal starter globals.css content if the file does not exist. */
const STARTER_CSS = `/* corAe Studio globals */

${TOKENS_START}
:root{
  --primary:${DEFAULT_TOKENS.primary};
  --secondary:${DEFAULT_TOKENS.secondary};
  --background:${DEFAULT_TOKENS.background};
  --surface:${DEFAULT_TOKENS.surface};
  --text:${DEFAULT_TOKENS.text};
  --muted:${DEFAULT_TOKENS.muted};
  --border:${DEFAULT_TOKENS.border};
  --radius:${DEFAULT_TOKENS.radius};
  --font:${DEFAULT_TOKENS.font};
}
${TOKENS_END}

/* base layout & components (kept simple; you can extend freely) */
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0; background:var(--background); color:var(--text);
  font-family: var(--font);
}

.container{ max-width:1120px; margin:0 auto; padding:32px 24px; }
.row{ display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
.grid{ display:grid; gap:24px; }
.grid-auto{ grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }

h1{ font-size: clamp(28px, 4vw, 44px); margin:0 0 12px; letter-spacing:.2px }
h2{ font-size: clamp(20px, 3vw, 28px); margin:0 0 12px }
.muted{ color: var(--muted); }
.small{ font-size:.9rem; color: var(--muted); }

.site-nav{
  display:flex; gap:16px; flex-wrap:wrap;
  padding:10px 0 18px; margin-bottom:24px;
  border-bottom:1px solid var(--border);
}
.site-nav a{ color:var(--text); text-decoration:none; opacity:.85 }
.site-nav a:hover{ opacity:1; }

.card{
  background:var(--surface); border:1px solid var(--border);
  border-radius: var(--radius); box-shadow: 0 8px 24px rgba(0,0,0,.25);
  padding: 24px;
}
.card h3{ margin:0 0 6px; font-size:18px }
.card .subtitle{ color:var(--muted); margin-bottom:16px }

.btn{
  padding:10px 14px; border-radius:10px; border:1px solid var(--border);
  background: #0f151d; color:var(--text); cursor:pointer;
}
.btn:hover{ background:#121821; }
.btn.primary{
  background: linear-gradient(180deg, #4aa8ff, #328ef0);
  border-color: #2d7ed3; color:#fff;
}
.btn.ghost{ background:transparent; }
`;

/** Ensure globals.css exists. If missing, create with STARTER_CSS. */
async function ensureCssFile() {
  try {
    await fs.access(CSS_PATH);
  } catch {
    await fs.mkdir(path.dirname(CSS_PATH), { recursive: true });
    await fs.writeFile(CSS_PATH, STARTER_CSS, 'utf8');
  }
}

/** Read globals.css (ensuring it exists first). */
export async function readGlobals(): Promise<string> {
  await ensureCssFile();
  return fs.readFile(CSS_PATH, 'utf8');
}

/** Write globals.css atomically. */
export async function writeGlobals(nextCss: string): Promise<void> {
  await ensureCssFile();
  const tmp = CSS_PATH + '.tmp';
  await fs.writeFile(tmp, nextCss, 'utf8');
  await fs.rename(tmp, CSS_PATH);
}

/**
 * Make sure the token markers exist. If missing, add a token block
 * at the very top of the file and return the updated css string.
 */
function ensureTokenMarkers(css: string): string {
  const hasStart = css.includes(TOKENS_START);
  const hasEnd   = css.includes(TOKENS_END);
  if (hasStart && hasEnd) return css;

  const block = `
${TOKENS_START}
:root{
  --primary:${DEFAULT_TOKENS.primary};
  --secondary:${DEFAULT_TOKENS.secondary};
  --background:${DEFAULT_TOKENS.background};
  --surface:${DEFAULT_TOKENS.surface};
  --text:${DEFAULT_TOKENS.text};
  --muted:${DEFAULT_TOKENS.muted};
  --border:${DEFAULT_TOKENS.border};
  --radius:${DEFAULT_TOKENS.radius};
  --font:${DEFAULT_TOKENS.font};
}
${TOKENS_END}
`.trim();

  return `${block}\n\n${css}`;
}

/** Build the CSS token block from final tokens. */
function buildTokenCss(tokens: Required<BrandTokens>): string {
  return `
:root{
  --primary:${tokens.primary};
  --secondary:${tokens.secondary};
  --background:${tokens.background};
  --surface:${tokens.surface};
  --text:${tokens.text};
  --muted:${tokens.muted};
  --border:${tokens.border};
  --radius:${tokens.radius};
  --font:${tokens.font};
}
`.trim();
}

/**
 * Replace the token block between markers with provided tokens.
 * If markers are missing, they will be added at the top automatically.
 */
export async function applyBrandTokens(tokens: Partial<BrandTokens>): Promise<{applied:boolean}> {
  let css = await readGlobals();
  css = ensureTokenMarkers(css);

  const startIdx = css.indexOf(TOKENS_START);
  const endIdx   = css.indexOf(TOKENS_END, startIdx + TOKENS_START.length);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error('Failed to locate token markers after insertion.');
  }

  const before = css.slice(0, startIdx + TOKENS_START.length);
  const after  = css.slice(endIdx);

  const merged: Required<BrandTokens> = {
    ...DEFAULT_TOKENS,
    ...(tokens as Partial<Required<BrandTokens>>),
  };

  const tokenCss = buildTokenCss(merged);
  const nextCss = `${before}\n${tokenCss}\n${after}`;
  await writeGlobals(nextCss);

  return { applied: true };
}