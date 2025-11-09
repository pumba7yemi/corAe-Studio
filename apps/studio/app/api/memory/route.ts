import { NextRequest, NextResponse } from "next/server";

/**
 * corAe Memory API (Phase 3.x)
 * -----------------------------------------------------
 * Unifies memory reads/writes with graceful fallbacks.
 *
 * Resolution order:
 *   1) @corae/cims-core.memoryStore  (or @corae/memory-core.store)
 *   2) Project store "@/app/lib/memory" or "@/lib/memory" (export const store = { list, add, search? })
 *   3) Local in-memory Map (per-tenant)
 *
 * Endpoints:
 *   GET  /api/memory?tenant=demo[&threadId=ID][&q=search][&limit=50]
 *         → { ok, items }
 *   POST /api/memory
 *         body: { text, kind?, tenant?, threadId?, tags? }
 *         → { ok, item }
 */

export type MemoryKind = "note" | "message" | "task" | "fact";

export type MemoryItem = {
  id: string;
  tenantId: string;
  text: string;
  kind: MemoryKind;
  threadId?: string;
  tags?: string[];
  createdAt: string; // ISO
};

type Store = {
  list(params: {
    tenantId: string;
    threadId?: string;
    q?: string;
    limit?: number;
  }): Promise<MemoryItem[]>;
  add(params: {
    tenantId: string;
    text: string;
    kind?: MemoryKind;
    threadId?: string;
    tags?: string[];
  }): Promise<MemoryItem>;
  // Optional search specialization (used if present)
  search?(
    tenantId: string,
    q: string,
    limit?: number,
    threadId?: string
  ): Promise<MemoryItem[]>;
};

// -------------- Local fallback (per-tenant) --------------
const LOCAL = new Map<string, MemoryItem[]>(); // tenantId -> items[]

function uid(prefix = "mem") {
  try {
    // @ts-ignore (edge/node both available under Next 15)
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const LocalStore: Store = {
  async list({ tenantId, threadId, q, limit = 50 }) {
    let items = LOCAL.get(tenantId) ?? [];
    if (threadId) items = items.filter((i) => i.threadId === threadId);
    if (q?.trim()) {
      const s = q.toLowerCase();
      items = items.filter((i) => i.text.toLowerCase().includes(s));
    }
    return items.slice(-limit);
  },
  async add({ tenantId, text, kind = "note", threadId, tags }) {
    const item: MemoryItem = {
      id: uid(),
      tenantId,
      text,
      kind,
      threadId,
      tags,
      createdAt: new Date().toISOString(),
    };
    const arr = LOCAL.get(tenantId) ?? [];
    arr.push(item);
    LOCAL.set(tenantId, arr);
    return item;
  },
};

// -------------- Dynamic adapter resolution --------------
let RESOLVED: Store | null = null;

async function getStore(): Promise<Store> {
  if (RESOLVED) return RESOLVED;

  // 1) Prefer @corae/cims-core.memoryStore (or dedicated @corae/memory-core)
  try {
    const core: any = await import("@corae/cims-core");
    if (core?.memoryStore) {
      const s = core.memoryStore;
      if (s.listMessages || s.addMessage) {
        // If someone wired the "messages" API by name, adapt it.
        RESOLVED = {
          async list({ tenantId, threadId, q, limit }) {
            // If core exposes search, prefer it
            if (s.search) return (await s.search({ tenantId, q, threadId, limit })) as MemoryItem[];
            // Otherwise list + filter
            const list = (await s.list({ tenantId, threadId, limit })) as MemoryItem[] | any[];
            if (!q?.trim()) return list ?? [];
            const sQ = q.toLowerCase();
            return (list ?? []).filter((i) => String(i.text ?? i.body ?? "").toLowerCase().includes(sQ));
          },
          async add({ tenantId, text, kind = "note", threadId, tags }) {
            const item = (await s.add({ tenantId, text, kind, threadId, tags })) as MemoryItem;
            return item;
          },
          search: s.search
            ? (tenantId: string, q: string, limit?: number, threadId?: string) =>
                s.search({ tenantId, q, limit, threadId })
            : undefined,
        };
        return RESOLVED;
      }
      // If memoryStore has standard list/add signatures:
      if (s.list && s.add) {
        RESOLVED = {
          async list({ tenantId, threadId, q, limit }) {
            if (s.search && q?.trim()) return (await s.search({ tenantId, q, threadId, limit })) as MemoryItem[];
            const list = (await s.list({ tenantId, threadId, limit })) as MemoryItem[];
            if (!q?.trim()) return list ?? [];
            const sQ = q.toLowerCase();
            return (list ?? []).filter((i) => i.text.toLowerCase().includes(sQ));
          },
          async add({ tenantId, text, kind = "note", threadId, tags }) {
            return (await s.add({ tenantId, text, kind, threadId, tags })) as MemoryItem;
          },
          search: s.search
            ? (tenantId: string, q: string, limit?: number, threadId?: string) =>
                s.search({ tenantId, q, threadId, limit })
            : undefined,
        };
        return RESOLVED;
      }
    }
  } catch {
    /* ignore and try next */
  }

  try {
    // @ts-ignore: optional dependency; may not be installed in all projects
    // Instruct bundler not to resolve this during build to avoid monorepo resolution issues;
    // load dynamically at runtime if present.
    const mod: any = await import(/* webpackIgnore: true */ "@corae/memory-core").catch(() => null);
    if (mod?.store?.list && mod?.store?.add) {
      const s = mod.store;
      RESOLVED = {
        async list({ tenantId, threadId, q, limit }) {
          if (s.search && q?.trim()) return (await s.search(tenantId, q, limit, threadId)) as MemoryItem[];
          const list = (await s.list({ tenantId, threadId, limit })) as MemoryItem[];
          if (!q?.trim()) return list ?? [];
          const sQ = q.toLowerCase();
          return (list ?? []).filter((i) => i.text.toLowerCase().includes(sQ));
        },
        async add({ tenantId, text, kind = "note", threadId, tags }) {
          return (await s.add({ tenantId, text, kind, threadId, tags })) as MemoryItem;
        },
        search: s.search
          ? (tenantId: string, q: string, limit?: number, threadId?: string) =>
              s.search(tenantId, q, limit, threadId)
          : undefined,
      };
      return RESOLVED;
    }
  } catch {
    /* ignore and try next */
  }

  // 2) Project store (explicit attempts instead of computed import)
  try {
    // @ts-ignore: optional dependency; may not be installed in all projects
    // Instruct bundler not to resolve this during build to avoid monorepo resolution issues;
    // load dynamically at runtime if present.
    const modApp: any = await import(/* webpackIgnore: true */ "@/app/lib/memory").catch(() => null);
    if (modApp?.store?.list && modApp?.store?.add) {
      const s = modApp.store;
      RESOLVED = {
        async list({ tenantId, threadId, q, limit }) {
          if (s.search && q?.trim()) return (await s.search(tenantId, q, limit, threadId)) as MemoryItem[];
          const list = (await s.list({ tenantId, threadId, limit })) as MemoryItem[];
          if (!q?.trim()) return list ?? [];
          const sQ = q.toLowerCase();
          return (list ?? []).filter((i) => i.text.toLowerCase().includes(sQ));
        },
        async add({ tenantId, text, kind = "note", threadId, tags }) {
          return (await s.add({ tenantId, text, kind, threadId, tags })) as MemoryItem;
        },
        search: s.search
          ? (tenantId: string, q: string, limit?: number, threadId?: string) => s.search(tenantId, q, limit, threadId)
          : undefined,
      };
      return RESOLVED!;
    }
  } catch {}

  try {
    const modLib: any = await import("@/lib/memory").catch(() => null);
    if (modLib?.store?.list && modLib?.store?.add) {
      const s = modLib.store;
      RESOLVED = {
        async list({ tenantId, threadId, q, limit }) {
          if (s.search && q?.trim()) return (await s.search(tenantId, q, limit, threadId)) as MemoryItem[];
          const list = (await s.list({ tenantId, threadId, limit })) as MemoryItem[];
          if (!q?.trim()) return list ?? [];
          const sQ = q.toLowerCase();
          return (list ?? []).filter((i) => i.text.toLowerCase().includes(sQ));
        },
        async add({ tenantId, text, kind = "note", threadId, tags }) {
          return (await s.add({ tenantId, text, kind, threadId, tags })) as MemoryItem;
        },
        search: s.search
          ? (tenantId: string, q: string, limit?: number, threadId?: string) => s.search(tenantId, q, limit, threadId)
          : undefined,
      };
      return RESOLVED!;
    }
  } catch {}

  // 3) Fallback local
  RESOLVED = LocalStore;
  return RESOLVED;
}

// -------------- Handlers --------------
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const tenantId = (url.searchParams.get("tenant") ?? "demo").trim();
    const threadId = url.searchParams.get("threadId")?.trim() || undefined;
    const q = url.searchParams.get("q")?.trim() || undefined;
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 50;

    const store = await getStore();
    const items =
      (q && store.search ? await store.search(tenantId, q, safeLimit, threadId) : await store.list({ tenantId, threadId, q, limit: safeLimit })) ??
      [];

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("GET /api/memory error:", err);
    // degrade safely
    return NextResponse.json({ ok: true, items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const tenantId = (body?.tenant ?? "demo").toString().trim();
    const text = (body?.text ?? "").toString();
    const kind = (body?.kind ?? "note") as MemoryKind;
    const threadId = body?.threadId ? String(body.threadId) : undefined;
    const tags = Array.isArray(body?.tags) ? (body.tags as string[]) : undefined;

    if (!text.trim()) {
      return NextResponse.json({ ok: false, error: "text required" }, { status: 400 });
    }

    const store = await getStore();
    const item = await store.add({ tenantId, text: text.trim(), kind, threadId, tags });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("POST /api/memory error:", err);
    // Keep UI stable — do not 500 spam
    return NextResponse.json({ ok: false, error: "Unable to save memory" }, { status: 200 });
  }
}
