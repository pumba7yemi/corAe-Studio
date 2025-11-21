// apps/studio/lib/obari/flow-guard.client.ts
// OBARI Order Chain Lock — CLIENT side (no next/headers)
// Stores a compact token in a cookie + sessionStorage.
// Pages import from this file. API routes should use flow-guard.server.ts.

export type WeekRef = "W1" | "W2" | "W3" | "W4";
export type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";

export type ObariFlowToken = {
  scheduleId: string;
  scheduleMode: ScheduleMode;
  expectedWeek: WeekRef;
  prepDone?: boolean;
  createdAt: string; // ISO
};

const COOKIE_NAME = "obari_flow";
const COOKIE_PATH = "/";

// ---- cookie helpers (client-safe) ----
function setCookie(name: string, value: string) {
  // Lax to allow API reads, expires when browser session ends
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=${COOKIE_PATH}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return m ? decodeURIComponent(m[1]) : null;
}

// ---- public API (client) ----

/** Create/replace the OBARI flow token. */
export function signFlowToken(input: {
  scheduleId: string;
  scheduleMode: ScheduleMode;
  expectedWeek: WeekRef;
  prepDone?: boolean;
}): ObariFlowToken {
  if (typeof window === "undefined") throw new Error("signFlowToken is client-only");
  const tok: ObariFlowToken = {
    scheduleId: input.scheduleId,
    scheduleMode: input.scheduleMode,
    expectedWeek: input.expectedWeek,
    prepDone: Boolean(input.prepDone),
    createdAt: new Date().toISOString(),
  };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(tok))));
  setCookie(COOKIE_NAME, b64);
  sessionStorage.setItem(COOKIE_NAME, b64);
  return tok;
}

/** Read the token (or null). */
export function readFlowToken(): ObariFlowToken | null {
  if (typeof window === "undefined") return null;
  const b64 = sessionStorage.getItem(COOKIE_NAME) ?? getCookie(COOKIE_NAME);
  if (!b64) return null;
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as ObariFlowToken;
  } catch {
    return null;
  }
}

/** Patch & persist the token. No-ops if missing. */
export function updateFlowToken(patch: Partial<ObariFlowToken>): ObariFlowToken | null {
  const current = readFlowToken();
  if (!current) return null;
  const next: ObariFlowToken = { ...current, ...patch };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(next))));
  setCookie(COOKIE_NAME, b64);
  sessionStorage.setItem(COOKIE_NAME, b64);
  return next;
}

/**
 * Require a token with schedule (used by Prep page).
 * Throws an Error on the client if missing; caller decides navigation.
 */
export function requireScheduleGuard(): ObariFlowToken {
  const tok = readFlowToken();
  if (!tok?.scheduleId) {
    throw new Error("OBARI schedule context missing");
  }
  return tok;
}

/**
 * Require a token with prepDone=true (used by Order page).
 * Throws an Error on the client if missing; caller decides navigation.
 */
export function requirePrepGuard(): ObariFlowToken {
  const tok = requireScheduleGuard();
  if (!tok.prepDone) {
    throw new Error("OBARI prep stage not completed");
  }
  return tok;
}
