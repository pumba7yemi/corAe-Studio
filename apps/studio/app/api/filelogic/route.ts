// apps/studio/app/api/filelogic/route.ts
import { NextRequest } from "next/server";
import { readShipMemory, writeShipMemory } from "@/src/caia/memory";

export const runtime = "nodejs";
export const revalidate = 0;

type Domain = "home" | "work" | "business";
type View = "recent" | "flags" | "roles";

type FLItem = {
  id: string;
  name: string;
  path: string;
  owner?: string;
  flags?: string[];          // e.g., ["locked","shared","approved"]
  role?: string;             // optional simple role tag
  updatedAt: string;         // ISO
};

type FilelogicState = { items: FLItem[] };

function okDomain(x: string | null): x is Domain {
  return x === "home" || x === "work" || x === "business";
}
function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function load(domain: Domain): Promise<FilelogicState> {
  const scope = `filelogic:${domain}`;
  const key = "items";
  const data = (await readShipMemory(scope, key)) as FilelogicState | undefined;
  if (!data || !Array.isArray(data.items)) return { items: [] };
  return data;
}

async function save(domain: Domain, state: FilelogicState) {
  const scope = `filelogic:${domain}`;
  const key = "items";
  await writeShipMemory(scope, key, state);
}

function nowISO() {
  return new Date().toISOString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domainParam = searchParams.get("domain");
  const view = (searchParams.get("view") as View) || "recent";

  if (!okDomain(domainParam)) {
    return Response.json({ error: "invalid domain" }, { status: 400 });
  }
  const domain = domainParam;

  const state = await load(domain);
  let items = state.items;

  // Simple view filters (extend later as needed)
  if (view === "flags") {
    items = items.filter((i) => Array.isArray(i.flags) && i.flags.length > 0);
  } else if (view === "roles") {
    items = items.filter((i) => typeof i.role === "string" && i.role.length > 0);
  } // "recent" → no extra filter

  // Return as { items }
  return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
}

type CreatePayload = { name: string; path: string; owner?: string; role?: string; flags?: string[] };
type MovePayload = { id: string; path: string };
type LockPayload = { id: string; lock?: boolean };
type SharePayload = { id: string; share?: boolean };
type ApprovePayload = { id: string; approve?: boolean };

type PostBody =
  | { action: "create"; domain: Domain; payload: CreatePayload }
  | { action: "move"; domain: Domain; payload: MovePayload }
  | { action: "lock"; domain: Domain; payload: LockPayload }
  | { action: "share"; domain: Domain; payload: SharePayload }
  | { action: "approve"; domain: Domain; payload: ApprovePayload };

export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body?.domain || !okDomain(body.domain)) {
    return Response.json({ error: "invalid domain" }, { status: 400 });
  }

  const state = await load(body.domain);
  const items = state.items.slice();

  switch (body.action) {
    case "create": {
      const p = body.payload as CreatePayload;
      if (!p?.name || !p?.path) {
        return Response.json({ error: "name and path required" }, { status: 400 });
      }
      const item: FLItem = {
        id: uuid(),
        name: p.name,
        path: p.path,
        owner: p.owner,
        role: p.role,
        flags: Array.isArray(p.flags) ? p.flags.slice() : [],
        updatedAt: nowISO(),
      };
      items.unshift(item);
      break;
    }

    case "move": {
      const p = body.payload as MovePayload;
      const idx = items.findIndex((i) => i.id === p.id);
      if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
      items[idx] = { ...items[idx], path: p.path, updatedAt: nowISO() };
      break;
    }

    case "lock": {
      const p = body.payload as LockPayload;
      const idx = items.findIndex((i) => i.id === p.id);
      if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
      const flags = new Set(items[idx].flags ?? []);
      if (p.lock === false) flags.delete("locked"); else flags.add("locked");
      items[idx] = { ...items[idx], flags: Array.from(flags), updatedAt: nowISO() };
      break;
    }

    case "share": {
      const p = body.payload as SharePayload;
      const idx = items.findIndex((i) => i.id === p.id);
      if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
      const flags = new Set(items[idx].flags ?? []);
      if (p.share === false) flags.delete("shared"); else flags.add("shared");
      items[idx] = { ...items[idx], flags: Array.from(flags), updatedAt: nowISO() };
      break;
    }

    case "approve": {
      const p = body.payload as ApprovePayload;
      const idx = items.findIndex((i) => i.id === p.id);
      if (idx === -1) return Response.json({ error: "not found" }, { status: 404 });
      const flags = new Set(items[idx].flags ?? []);
      if (p.approve === false) flags.delete("approved"); else flags.add("approved");
      items[idx] = { ...items[idx], flags: Array.from(flags), updatedAt: nowISO() };
      break;
    }

    default:
      return Response.json({ error: "invalid action" }, { status: 400 });
  }

  const next: FilelogicState = { items };
  await save(body.domain, next);
  return Response.json({ ok: true, items: next.items }, { headers: { "Cache-Control": "no-store" } });
}

