import { NextResponse, NextRequest } from "next/server";

/**
 * DEV-ONLY: Echo endpoint (150% reconciled)
 *
 * GET  /api/cims/_debug/echo?foo=bar&msg=hello
 *   → echoes method, url, query, selected headers, and (if present) { echo: msg }
 *
 * POST /api/cims/_debug/echo
 *   body: any JSON
 *   → echoes method, url, query, selected headers, and parsed body
 *
 * Useful for verifying client fetches from the CIMS UI.
 */

function pickHeaders(req: NextRequest) {
  const keys = ["content-type", "authorization", "x-requested-with"];
  const out: Record<string, string | null> = {};
  for (const k of keys) out[k] = req.headers.get(k);
  return out;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (query[k] = v));

  // Convenience: mirror the simpler "echo msg" behavior if msg is provided
  const msg = url.searchParams.get("msg") ?? undefined;

  return NextResponse.json({
    ok: true,
    method: "GET",
    url: url.toString(),
    query,
    headers: pickHeaders(req),
    ...(msg ? { echo: msg } : {}),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (query[k] = v));

  const body = await req.json().catch(() => null);

  return NextResponse.json({
    ok: true,
    method: "POST",
    url: url.toString(),
    query,
    headers: pickHeaders(req),
    body,
    timestamp: new Date().toISOString(),
  });
}
