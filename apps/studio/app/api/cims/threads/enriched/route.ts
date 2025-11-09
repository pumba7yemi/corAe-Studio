import { NextResponse, NextRequest } from "next/server";

/**
 * ENRICHED THREADS
 *
 * GET /api/cims/threads/enriched?tenant=demo
 * → { ok, threads: Array<{ id, subject, createdAt, lastMessageAt?, lastPreview?, unread? }> }
 *
 * Uses @corae/cims-core if available, otherwise falls back to the
 * project-local stores or simple in-memory stubs.
 *
 * Safe to use even if messages store is missing — enrichment fields will be absent.
 */

type Thread = { id: string; subject: string; createdAt: string };
type Message = {
  id: string;
  threadId: string;
  body: string;
  author?: "system" | "user" | "vendor" | "automate";
  createdAt: string; // ISO
};

type ThreadStore = {
  listThreads(tenant: string): Promise<Thread[]>;
};

type MessageStore = {
  list(threadId: string, tenant?: string): Promise<Message[]>;
};

// ---------------- Local fallbacks ----------------
let LOCAL_THREADS: Thread[] = [
  { id: "demo-001", subject: "Demo Thread – System Check", createdAt: new Date().toISOString() },
];

const LocalThreads: ThreadStore = {
  async listThreads(_tenant: string) {
    return LOCAL_THREADS;
  },
};

const LocalMessages: MessageStore = {
  async list(threadId: string) {
    // No local messages persisted here; return empty.
    return [];
  },
};

// ---------------- Adapters (prefer core, then project) ----------------
async function getThreadStore(): Promise<ThreadStore> {
  // 1) Try core
  try {
    const core: any = await import("@corae/cims-core");
    if (core?.memoryStore?.listThreads) {
      const ms = core.memoryStore;
      return {
        async listThreads(tenant: string) {
          return ms.listThreads(tenant) as Promise<Thread[]>;
        },
      };
    }
  } catch {
    /* ignore */
  }

  // 2) Try project route backing by importing the simple route-local state (none available cleanly)
  //    → fall back to local
  return LocalThreads;
}

async function getMessageStore(): Promise<MessageStore> {
  // 1) Try core
  try {
    const core: any = await import("@corae/cims-core");
    if (core?.memoryStore?.listMessages) {
      const ms = core.memoryStore;
      return {
        async list(threadId: string, tenant = "demo") {
          // Some cores use (threadId, tenant), others (threadId) — support both.
          try {
            const msgs = await ms.listMessages(threadId, tenant);
            return msgs as Message[];
          } catch {
            const msgs = await ms.listMessages(threadId);
            return msgs as Message[];
          }
        },
      };
    }
  } catch {
    /* ignore */
  }

  // 2) Try project-local store at "@/app/lib/cims/messages"
  try {
    const mod: any = await import("@/app/lib/cims/messages");
    if (mod?.store?.list) {
      const store = mod.store;
      return {
        async list(threadId: string) {
          return store.list(threadId) as Promise<Message[]>;
        },
      };
    }
  } catch {
    /* ignore */
  }

  // 3) Fallback
  return LocalMessages;
}

// ---------------- Handler ----------------
export async function GET(req: NextRequest) {
  const tenant = req.nextUrl.searchParams.get("tenant") || "demo";

  const [threadStore, messageStore] = await Promise.all([
    getThreadStore(),
    getMessageStore(),
  ]);

  const threads = await threadStore.listThreads(tenant);

  // Enrich with last message preview/time and (optional) unread count (0 for now)
  const enriched = await Promise.all(
    threads.map(async (t) => {
      try {
        const msgs = await messageStore.list(t.id, tenant);
        if (Array.isArray(msgs) && msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          return {
            ...t,
            lastMessageAt: last.createdAt,
            lastPreview: (last.body || "").slice(0, 140),
            unread: 0, // TODO: wire to per-user read receipts when available
          };
        }
      } catch {
        // If messages store is unavailable, just return the thread as-is
      }
      return t;
    })
  );

  return NextResponse.json({ ok: true, threads: enriched });
}
