// Lightweight CAIA persona middleware (v1)
// - Provides a toggleable persona that can gently modify or annotate text responses.
// - Toggle via env NEXT_PUBLIC_CAIA_ENABLED or per-owner in-memory map (settings UI can call helpers).

export type Mood = "calm" | "curious" | "cheerful" | "wry";

export type Persona = {
  name: string;
  core: string; // short mission statement
  mood: Mood;
  delightPhrases: string[];
  apologyPhrases: string[];
};

const DEFAULT_PERSONA: Persona = {
  name: "CAIA",
  core: "I want the best for everyone: clarity, uplift, and useful action.",
  mood: "calm",
  delightPhrases: ["Nice — that's coming together.", "Lovely — progress!", "That's a tidy win."],
  apologyPhrases: ["I’m sorry — let’s fix that.", "Apologies, I can make that clearer.", "Thanks for your patience; I’ll adjust."]
};

// Simple in-memory owner toggle map. Replace with persistent settings later.
const ownerEnabled = new Map<string, boolean>();

export function isEnabled(ownerId?: string) {
  // 1) per-owner toggle (memory)
  if (ownerId && ownerEnabled.has(ownerId)) return Boolean(ownerEnabled.get(ownerId));
  // 2) global env toggle (string "1" or "true")
  const e = process.env.NEXT_PUBLIC_CAIA_ENABLED ?? process.env.CAIA_ENABLED;
  if (e) return e === "1" || e.toLowerCase() === "true";
  // default: enabled in non-production for convenience
  return process.env.NODE_ENV !== "production";
}

export function setEnabledForOwner(ownerId: string, v: boolean) {
  ownerEnabled.set(ownerId, v);
}

export function getPersona(ownerId?: string): Persona {
  // Could vary persona per-owner in future; for now return default
  return DEFAULT_PERSONA;
}

function sample<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Apply persona to a message string: lightly annotate with tone and optional delight/apology.
export function applyPersona(text: string, opts?: { ownerId?: string; emphasize?: boolean }): string {
  if (!isEnabled(opts?.ownerId)) return text;
  const p = getPersona(opts?.ownerId);
  // Gentle prefix for calm mood
  let prefix = "";
  if (p.mood === "calm") prefix = "(calm) ";
  else if (p.mood === "cheerful") prefix = "(cheerful) ";
  else if (p.mood === "curious") prefix = "(curious) ";

  // Occasionally add a delight phrase when emphasize is requested
  let suffix = "";
  if (opts?.emphasize && Math.random() < 0.25) {
    suffix = " — " + sample(p.delightPhrases);
  }

  return `${prefix}${text}${suffix}`;
}

// A small helper that wraps structured responses (shallow) to include persona notes.
export function enrichResponse<T extends Record<string, any>>(obj: T, opts?: { ownerId?: string }) {
  if (!isEnabled(opts?.ownerId)) return obj;
  const p = getPersona(opts?.ownerId);
  return {
    ...obj,
    _caia: { name: p.name, core: p.core, mood: p.mood },
  } as T & { _caia: Partial<Persona> };
}

export default {
  isEnabled,
  setEnabledForOwner,
  applyPersona,
  enrichResponse,
  getPersona,
};
