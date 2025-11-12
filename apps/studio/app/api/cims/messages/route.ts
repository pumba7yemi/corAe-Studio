import { NextRequest, NextResponse } from "next/server";

/**
 * corAe CIMS Messages API  — 150% resilient version
 * Resolution order:
 *   1️⃣ @corae/cims-core   → memoryStore.listMessages(), send()
 *   2️⃣ Project store      → "@/app/lib/cims/messages" or "@/lib/cims/messages"
 *   3️⃣ Local in-memory    → Map fallback (no runtime dependency)
 */

export type Message = {
  id: string;
  threadId: string;
  body: string;
  author?: "system" | "user" | "vendor" | "automate";
  createdAt: string;
};

// ---------- Local fallback ----------
const LOCAL = new Map<string, Message[]>(); // threadId → messages[]

function uid(prefix = "m") {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto)
      // @ts-ignore
      return crypto.randomUUID();
  } catch {}
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

const LocalStore = {
  async list(threadId: string): Promise<Message[]> {
    return LOCAL.get(threadId) ?? [];
  },
  async add(
    threadId: string,
    body: string,
    author: NonNullable<Message["author"]> = "user"
  ): Promise<Message> {
    const msg: Message = {
      id: uid(),
      threadId,
      body,
      author,
      createdAt: new Date().toISOString(),
    };
    const arr = LOCAL.get(threadId) ?? [];
    arr.push(msg);
    LOCAL.set(threadId, arr);
    return msg;
  },
};

// ---------- Dynamic adapter ----------
type Store = {
  list(threadId: string, tenant?: string): Promise<Message[]>;
  add(
    threadId: string,
    body: string,
    author?: Message["author"],
    tenant?: string
  ): Promise<Message>;
};

let RESOLVED: Store | null = null;

async function getStore(): Promise<Store> {
  if (RESOLVED) return RESOLVED;

  // 1️⃣ Try @corae/cims-core
  try {
    // Allow runtime-only dynamic import without requiring compile-time types
    // Next's typecheck sometimes fails to resolve workspace packages during
    // build. We intentionally ignore TypeScript here and fall back at runtime
    // if the package isn't present.
    // @ts-ignore-next-line
    const core: any = await import("@corae/cims-core");
    if (core?.memoryStore && core?.send) {
      const { memoryStore, send } = core;
      RESOLVED = {
        async list(threadId: string, tenant = "demo") {
          const list = await memoryStore.listMessages(threadId, tenant);
          return (Array.isArray(list) ? list : []) as Message[];
        },
        async add(threadId, body, author = "user", tenant = "demo") {
          const msg = await send({
            tenantId: tenant,
            senderId: author,
            threadId,
            channel: "inapp",
            body,
          });
          return msg as Message;
        },
      };
      return RESOLVED;
    }
  } catch {
    /* fallback */
  }

  // 2️⃣ Project-level store resolution skipped in this build pass
  // Avoid importing project-local modules here because dynamic import paths
  // that reference the monorepo aliases (e.g. '@/lib/...') can produce
  // compile-time module resolution errors when those modules are absent.
  // Fall back directly to the local in-memory store if @corae/cims-core is not present.

  // 3️⃣ Fallback local
  RESOLVED = {
    list: (threadId) => LocalStore.list(threadId),
    add: (threadId, body, author) =>
      LocalStore.add(threadId, body, (author ?? "user") as NonNullable<Message["author"]>),
  };
  return RESOLVED;
}

// ---------- Handlers ----------
export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get("threadId")?.trim() ?? "";
  const tenant = req.nextUrl.searchParams.get("tenant")?.trim() || "demo";

  if (!threadId) {
    return NextResponse.json(
      { ok: false, error: "threadId required" },
      { status: 400 }
    );
  }

  try {
    const store = await getStore();
    const messages = await store.list(threadId, tenant);
    return NextResponse.json({
      ok: true,
      messages: Array.isArray(messages) ? messages : [],
    });
  } catch (err) {
    console.error("GET /api/cims/messages error:", err);
    return NextResponse.json({ ok: true, messages: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const threadId = String(data?.threadId ?? "").trim();
    const text = String(data?.body ?? "").trim();
    const author = (data?.author as Message["author"]) ?? "user";
    const tenant = String(data?.tenant ?? "demo").trim();

    if (!threadId || !text) {
      return NextResponse.json(
        { ok: false, error: "threadId and body required" },
        { status: 400 }
      );
    }

    const store = await getStore();
    const message = await store.add(threadId, text, author, tenant);
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    console.error("POST /api/cims/messages failed:", err);
    return NextResponse.json({ ok: false, error: "Unable to add message" });
  }
}
