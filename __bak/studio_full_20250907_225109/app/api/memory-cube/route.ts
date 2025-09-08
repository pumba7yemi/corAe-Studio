import { NextResponse } from "next/server";
import { resolveContext } from "@/lib/caia/tenancy";
import { logToLayer, readOverlay, wipeLayer } from "@/lib/caia/memory-cube";

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