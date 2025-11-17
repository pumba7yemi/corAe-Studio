// apps/studio/lib/obari/flow-guard.ts
// OBARI Order Chain Lock — 150.logic
// Identify (schedule) → Prepare → Execute. Enforced by a signed cookie token.

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const COOKIE_NAME = "obari.flow";
const ALG = "sha256";

// Minimal payload carried across the chain
export type FlowToken = {
  // established at Schedule step
  scheduleId: string;          // required after schedule is chosen
  scheduleMode?: "CYCLE_28" | "MONTHLY" | "HYBRID";
  expectedWeek?: "W1" | "W2" | "W3" | "W4";

  // set true at Prep step once inputs confirmed
  prepDone?: boolean;

  // optional: track who/when (can be expanded later)
  uid?: string;
  ts?: number; // epoch seconds
};

type SignedToken = {
  v: 1;
  p: FlowToken;
  s: string; // hex signature (HMAC)
};

function getSecret(): string {
  // Dev-safe default, override in env for prod.
  return process.env.OBARI_FLOW_SECRET || "dev-secret-change-me";
}

function hmac(payload: string): string {
  return crypto.createHmac(ALG, getSecret()).update(payload, "utf8").digest("hex");
}

// Serialize, sign, and store cookie
export function signFlowToken(payload: FlowToken): void {
  const p = { ...payload, ts: Math.floor(Date.now() / 1000) };
  const base = JSON.stringify({ v: 1, p });
  const s = hmac(base);
  const data: SignedToken = { v: 1, p, s };
  // Cast to any because project TypeScript environment may treat cookies() as a promise
  // in some build contexts; this keeps the API usage the same while silencing type errors.
  (cookies() as any).set(COOKIE_NAME, Buffer.from(JSON.stringify(data)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

// Read+verify cookie
export function readFlowToken(): FlowToken | null {
  const raw = (cookies() as any).get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SignedToken;
    if (parsed?.v !== 1 || !parsed?.p || !parsed?.s) return null;
    const base = JSON.stringify({ v: 1, p: parsed.p });
    if (hmac(base) !== parsed.s) return null; // signature mismatch
    return parsed.p;
  } catch {
    return null;
  }
}

// Update token immutably (merge) and re-sign
export function updateFlowToken(patch: Partial<FlowToken>): void {
  const current = readFlowToken() || ({} as FlowToken);
  signFlowToken({ ...current, ...patch });
}

/* ---------------- Page Guards (server-only) ---------------- */

// Require schedule context to enter PREP.
export function requireScheduleGuard(): FlowToken {
  const tok = readFlowToken();
  if (!tok?.scheduleId) {
    // preserve intentful UX — carry referer if you want
    redirect("/obari/order/schedule");
  }
  return tok;
}

// Require schedule + prepDone to enter ORDER.
export function requirePrepGuard(): FlowToken {
  const tok = readFlowToken();
  if (!tok?.scheduleId) redirect("/obari/order/schedule");
  if (!tok?.prepDone) redirect("/obari/order/prep");
  return tok;
}

/* ---------------- API Guard ---------------- */

// Use inside API routes to block issuing without prep confirmation
export function assertPrepForApi(): FlowToken {
  // For API, avoid redirect loops — return 403 when invalid.
  const rawCookie = (headers() as any).get("cookie") || "";
  const val = rawCookie.split(/;\s*/).find((c: string) => c.startsWith(`${COOKIE_NAME}=`))?.split("=")[1];
  if (!val) throwForbidden("Missing OBARI flow token.");

  try {
    const parsed = JSON.parse(Buffer.from(val, "base64url").toString("utf8")) as SignedToken;
    const base = JSON.stringify({ v: 1, p: parsed.p });
    if (hmac(base) !== parsed.s) throwForbidden("Invalid OBARI token signature.");
    if (!parsed.p?.scheduleId) throwForbidden("Schedule not established.");
    if (!parsed.p?.prepDone) throwForbidden("Prep not confirmed.");
    return parsed.p;
  } catch (e: any) {
    throwForbidden("Corrupt OBARI flow token.");
  }
}

function throwForbidden(msg: string): never {
  const err = new Error(msg);
  // @ts-expect-error stamp status for the route handler to format
  err.status = 403;
  throw err;
}
