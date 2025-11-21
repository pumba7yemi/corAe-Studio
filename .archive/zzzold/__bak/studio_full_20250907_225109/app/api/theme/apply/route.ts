// apps/studio/app/api/theme/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { applyBrandTokens } from '../../../../lib/theme/themeEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The persisted preset shape */
type BrandPreset = {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  radius: number;          // px value, e.g. 16
  fontFamily: string;      // CSS font-family string
};

const DATA_DIR = path.join(process.cwd(), 'apps', 'studio', '.data', 'brand');
const ACTIVE_FILE = path.join(DATA_DIR, 'active.json');
const PRESETS_FILE = path.join(DATA_DIR, 'presets.json');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonSafe<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonAtomic(file: string, data: unknown) {
  await ensureDir();
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

function normalizePreset(body: any): BrandPreset {
  const preset: BrandPreset = {
    name: String(body?.name || 'custom'),
    primary: String(body?.primary || '#7cc4ff'),
    secondary: String(body?.secondary || '#22c55e'),
    background: String(body?.background || '#0b0f14'),
    surface: String(body?.surface || '#121821'),
    text: String(body?.text || '#e6eef7'),
    muted: String(body?.muted || '#9fb3c8'),
    border: String(body?.border || '#213042'),
    radius: Number(body?.radius ?? 16),
    fontFamily: String(
      body?.fontFamily ||
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "SF Pro", Arial, sans-serif'
    ),
  };
  return preset;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const preset = normalizePreset(body);

    // 1) Apply tokens to globals.css via themeEngine
    await applyBrandTokens({
      primary: preset.primary,
      secondary: preset.secondary,
      background: preset.background,
      surface: preset.surface,
      text: preset.text,
      muted: preset.muted,
      border: preset.border,
      radius: `${preset.radius}px`,
      font: preset.fontFamily,
    });

    // 2) Persist active preset and update presets list
    await ensureDir();

    // write active
    await writeJsonAtomic(ACTIVE_FILE, preset);

    // append/update in presets list
    const presets = await readJsonSafe<BrandPreset[]>(PRESETS_FILE, []);
    const idx = presets.findIndex((p) => p.name === preset.name);
    if (idx >= 0) presets[idx] = preset;
    else presets.push(preset);
    await writeJsonAtomic(PRESETS_FILE, presets);

    return NextResponse.json({ ok: true, applied: preset.name, preset });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}