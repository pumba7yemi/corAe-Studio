// apps/studio/app/api/caia/memory/route.ts
import { NextRequest } from "next/server";
// Import via local alias shim so TS sees concrete source; avoid direct package import
// packages/caia-core/memory.ts
import fs from "fs/promises";
import path from "path";

const BASE_DIR = path.resolve(process.cwd(), "runtime", "caia-memory");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonFile(file: string): Promise<any> {
  try {
    const txt = await fs.readFile(file, "utf8");
    return JSON.parse(txt || "{}");
  } catch (err: any) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function writeJsonFile(file: string, data: any) {
  await ensureDir(path.dirname(file));
  const tmp = `${file}.tmp-${Date.now()}`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

// ───────────────────────────────────────────
// READ / APPEND (existing primitives)
// ───────────────────────────────────────────

export async function readDockyardMemory(scope: string, key?: string) {
  const file = path.join(BASE_DIR, "dockyard", `${scope}.json`);
  const data = await readJsonFile(file);
  if (typeof key === "string") return data?.[key];
  return data;
}

export async function appendDockyardMemory(scope: string, entry: Record<string, string>) {
  const file = path.join(BASE_DIR, "dockyard", `${scope}.json`);
  const current = (await readJsonFile(file)) || {};
  const merged = { ...current, ...entry };
  await writeJsonFile(file, merged);
  return merged;
}

export async function readShipMemory(scope: string) {
  const file = path.join(BASE_DIR, "ship", `${scope}.json`);
  return await readJsonFile(file);
}

export async function appendShipMemory(scope: string, data: any) {
  const file = path.join(BASE_DIR, "ship", `${scope}.json`);
  const current = (await readJsonFile(file)) || {};
  // shallow merge; caller provides intended shape
  const merged = { ...current, ...data };
  await writeJsonFile(file, merged);
  return merged;
}

// ───────────────────────────────────────────
// WRITE WRAPPERS (used by API route.ts)
// ───────────────────────────────────────────
export async function writeDockyardMemory(scope: string, key: string, value: string) {
  return appendDockyardMemory(scope, { [key]: value });
}

export async function writeShipMemory(scope: string, data: any) {
  return appendShipMemory(scope, data);
}
// ───────────────────────────────────────────

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