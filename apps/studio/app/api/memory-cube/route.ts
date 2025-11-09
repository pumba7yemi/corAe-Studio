import { NextResponse } from "next/server";

/**
 * Local stub for ../../caia/memory-cube to avoid missing-module errors.
 * Replace with the real implementation when the module is available.
 */
type Context = { vertical?: string; brand?: string; tenant?: string };
type Entry = { type: string; note?: string; data?: any; immutable?: boolean; id?: string; createdAt?: string };

function readOverlay(ctx: Context, limit = 200): Entry[] {
  // return an empty list by default; real implementation should read stored entries
  return [];
}

function logToLayer(layer: string, ctx: Context, entry: Entry): Entry {
  // basic shim that returns the entry with an id and timestamp
  return {
    ...entry,
    id: Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  };
}

function wipeLayer(layer: string, ctx?: Context, force = false) {
  // basic shim; real implementation should erase data and return a meaningful result
  return { ok: true, wiped: 0, force: Boolean(force), layer, ctx };
}

/**
 * Local fallback for resolveContext to avoid a missing-module compile error.
 * Keep the same shape as the project's shared implementation; replace with the
 * real import when the module is available.
 */
function resolveContext(ctx?: { vertical?: string; brand?: string; tenant?: string }) {
  return {
    vertical: ctx?.vertical,
    brand: ctx?.brand,
    tenant: ctx?.tenant,
  };
}

/** GET /api/caia/memory-cube?vertical=hotel&brand=sunrise&tenant=hotel-123&limit=200 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 200);
  const ctx = resolveContext({
    vertical: searchParams.get("vertical") || undefined,
    brand: searchParams.get("brand") || undefined,
    tenant: searchParams.get("tenant") || undefined,
  });
  const entries = readOverlay(ctx, limit);
  return NextResponse.json({ ctx, entries });
}

/** POST body: { layer: "global"|"vertical"|"brand"|"tenant", ctx?: {vertical,brand,tenant}, entry: {type,note,data,immutable?} } */
export async function POST(req: Request) {
  const body = await req.json();
  const layer = body.layer || "tenant";
  const ctx = resolveContext(body.ctx);
  const entry = logToLayer(layer, ctx, body.entry);
  return NextResponse.json({ ok: true, entry, ctx });
}

/** DELETE body: { layer, ctx, force? } */
export async function DELETE(req: Request) {
  const body = await req.json();
  const layer = body.layer || "tenant";
  const ctx = resolveContext(body.ctx);
  const res = wipeLayer(layer, ctx, Boolean(body.force));
  return NextResponse.json(res);
}
