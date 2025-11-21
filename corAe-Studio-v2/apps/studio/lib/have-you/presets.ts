// Local fallback for the missing package: define minimal types and a PRESETS object.
// Extend these as needed to match the real @corae/have-you-core implementation.
type Domain = "HOME" | "WORK" | "BUSINESS";

export type HaveYouItem = {
  id: string;
  label: string;
  // add other fields here if required
};

export const PRESETS: Record<Domain, HaveYouItem[]> = {
  HOME: [],
  WORK: [],
  BUSINESS: [],
};

// You can extend presets per-tenant here if needed
export async function getPreset(domain: Domain): Promise<HaveYouItem[]> {
  return PRESETS[domain];
}

export async function getAllPresets(): Promise<HaveYouItem[]> {
  return [...PRESETS.HOME, ...PRESETS.WORK, ...PRESETS.BUSINESS];
}