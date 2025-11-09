// apps/studio/app/api/caia/memory/route.ts
import { NextRequest } from "next/server";
// Import via local alias shim so TS sees concrete source; avoid direct package import
// packages/caia-core/memory.ts
import { readDockyardMemory, readShipMemory, writeDockyardMemory, writeShipMemory } from '../../../../lib/caia/memoryHelpers';

// GET examples:
// /api/caia/memory?scope=demo&key=hello
// /api/caia/memory?scope=demo
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "";
  const key = searchParams.get("key");

  if (!scope) return Response.json({ error: "scope required" }, { status: 400 });

  if (key) {
    const value = await readDockyardMemory(scope, key);
    return Response.json({ value });
  }

  const data = await readShipMemory(scope);
  return Response.json({ data });
}

// POST examples:
// { "scope": "demo", "key": "hello", "value": "world" }
// { "scope": "demo", "data": { "x": "1" }, "target": "ship" }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { scope, key, value, data, target } = body as any;

  if (!scope) return Response.json({ error: "scope required" }, { status: 400 });

  if (target === "ship") {
    if (!data) return Response.json({ error: "data required" }, { status: 400 });
    await writeShipMemory(scope, data);
    return Response.json({ ok: true, target: "ship" });
  }

  if (!key) return Response.json({ error: "key required" }, { status: 400 });
  await writeDockyardMemory(scope, key, String(value ?? ""));
  return Response.json({ ok: true, target: "dockyard" });
}