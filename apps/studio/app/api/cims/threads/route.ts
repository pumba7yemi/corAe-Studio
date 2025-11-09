import { NextResponse, NextRequest } from "next/server";

/**
 * Threads API (reconciled)
 *
 * - Uses @corae/cims-core.memoryStore when available (multi-tenant).
 * - Falls back to local in-memory store keyed by tenant.
 * - On GET, if the tenant has no threads, auto-seed a demo thread and
 *   best-effort drop a welcome message via "@/app/lib/cims/messages".
 *
 * Endpoints:
 *   GET  /api/cims/threads?tenant=demo         -> { ok, threads }
 *   POST /api/cims/threads?tenant=demo {subject} -> { ok, thread }
 */

export type Thread = { id: string; subject: string; createdAt: string };

// ---------- utils ----------
function safeUuid(prefix = "t") {
  try {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  } catch {}
  return `${prefix}_${Date.now().toString(36)}`;
}

// ---------- Local fallback (per-tenant) ----------
type TenantThreads = Record<string, Thread[]>;
const LOCAL_BY_TENANT: TenantThreads = Object.create(null);

type ThreadStore = {
  listThreads(tenant: string): Promise<Thread[]>;
  createThread(tenant: string, subject: string): Promise<Thread>;
};

const LocalStore: ThreadStore = {
  async listThreads(tenant) {
    return LOCAL_BY_TENANT[tenant] ?? [];
  },
  async createThread(tenant, subject) {
    const t: Thread = {
      id: safeUuid(),
      subject: subject || "Untitled Thread",
      createdAt: new Date().toISOString(),
    };
    const arr = LOCAL_BY_TENANT[tenant] ?? [];
    LOCAL_BY_TENANT[tenant] = [t, ...arr];
    return t;
  },
};

// ---------- Dynamic adapter for @corae/cims-core (if installed) ----------
let storePromise: Promise<ThreadStore> | null = null;

async function getStore(): Promise<ThreadStore> {
  if (storePromise) return storePromise;
  storePromise = (async () => {
    try {
      const mod: any = await import("@corae/cims-core");
      if (mod?.memoryStore) {
        const ms = mod.memoryStore;
        const CoreStore: ThreadStore = {
          async listThreads(tenant: string) {
            return ms.listThreads(tenant || "demo");
          },
          async createThread(tenant: string, subject: string) {
            return ms.createThread(tenant || "demo", subject || "");
          },
        };
        return CoreStore;
      }
      return LocalStore;
    } catch {
      return LocalStore;
    }
  })();
  return storePromise;
}

// ---------- One-time seeding per tenant (works for both stores) ----------
async function ensureSeed(tenant: string, store: ThreadStore): Promise<void> {
  const threads = await store.listThreads(tenant);
  if (threads.length > 0) return;

  // Create demo thread
  const demo = await store.createThread(tenant, "Demo Thread – System Check");

  // Best-effort: drop a friendly first message via project messages store
  try {
    const mod: any = await import("@/app/lib/cims/messages");
    if (mod?.store?.add) {
      await mod.store.add(
        demo.id,
        "Welcome to CIMS threads/messages 👋\nThis message was auto-seeded.",
        "system"
      );
    }
  } catch {
    // ignore if project messages store not present
  }
}

// ---------- Handlers ----------
export async function GET(req: NextRequest) {
  const tenant = req.nextUrl.searchParams.get("tenant") || "demo";
  const store = await getStore();
  await ensureSeed(tenant, store);
  const threads = await store.listThreads(tenant);
  return NextResponse.json({ ok: true, threads });
}

export async function POST(req: NextRequest) {
  try {
    const tenant = req.nextUrl.searchParams.get("tenant") || "demo";
    const body = await req.json().catch(() => ({}));
    const subject: string = body?.subject ?? "";

    const store = await getStore();
    const thread = await store.createThread(tenant, subject);
    return NextResponse.json({ ok: true, thread });
  } catch (err) {
    console.error("POST /api/cims/threads failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create thread" },
      { status: 400 }
    );
  }
}
