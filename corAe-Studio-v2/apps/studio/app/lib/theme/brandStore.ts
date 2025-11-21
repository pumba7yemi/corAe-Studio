// app/lib/theme/brandStore.ts

export type BrandPreset = {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  radius: number;      // px
  fontFamily: string;
};

// If you need multi-tenant later, key this by tenantId.
const PRESETS = new Map<string, BrandPreset>();
let ACTIVE: BrandPreset | null = null;

// Default preset (corAe-ish)
const DEFAULT_PRESET: BrandPreset = {
  name: "corAe",
  primary: "#1C7CF5",
  secondary: "#22c55e",
  background: "#0b0c10",
  surface: "#111217",
  text: "#eaeaf0",
  muted: "#9aa0aa",
  radius: 14,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'",
};

// initialize
if (!ACTIVE) {
  PRESETS.set(DEFAULT_PRESET.name, DEFAULT_PRESET);
  ACTIVE = DEFAULT_PRESET;
}

export async function savePreset(preset: BrandPreset) {
  PRESETS.set(preset.name, preset);
  return preset;
}

export async function setActive(presetOrName: BrandPreset | string) {
  if (typeof presetOrName === "string") {
    const found = PRESETS.get(presetOrName);
    if (!found) throw new Error(`Brand preset not found: ${presetOrName}`);
    ACTIVE = found;
    return ACTIVE;
  }
  // ensure it exists in the map
  PRESETS.set(presetOrName.name, presetOrName);
  ACTIVE = presetOrName;
  return ACTIVE;
}

export async function getActive(): Promise<BrandPreset> {
  if (!ACTIVE) ACTIVE = DEFAULT_PRESET;
  return ACTIVE;
}

export async function listPresets(): Promise<BrandPreset[]> {
  return Array.from(PRESETS.values());
}

// Utility: convert active brand to CSS variables
export function toCssVars(p: BrandPreset) {
  return {
    "--brand-primary": p.primary,
    "--brand-secondary": p.secondary,
    "--brand-bg": p.background,
    "--brand-surface": p.surface,
    "--brand-text": p.text,
    "--brand-muted": p.muted,
    "--brand-radius": `${p.radius}px`,
    "--brand-font": p.fontFamily,
  } as Record<string, string>;
}
