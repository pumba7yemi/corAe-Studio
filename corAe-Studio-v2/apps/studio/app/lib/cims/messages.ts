// app/lib/cims/messages.ts

/**
 * Project-level message store used by:
 *   - app/api/cims/messages/route.ts  (auto-detected)
 * Provides a simple in-memory map keyed by threadId.
 * Replace with a DB adapter later (same interface).
 */

export type Message = {
  id: string;
  threadId: string;
  body: string;
  author: "system" | "user" | "vendor" | "automate";
  createdAt: string; // ISO
};

// ---------------- In-memory backing ----------------
const MESSAGES: Map<string, Message[]> = new Map();

// Optional seed for quick sanity check (remove in prod)
function seedOnce() {
  if (MESSAGES.size > 0) return;
  const demoThread = "demo-001";
  const m: Message = {
    id: safeUuid("seed"),
    threadId: demoThread,
    body: "Welcome to CIMS threads/messages 👋",
    author: "system",
    createdAt: new Date().toISOString(),
  };
  MESSAGES.set(demoThread, [m]);
}
seedOnce();

// ---------------- Helpers ----------------
function safeUuid(prefix = "m") {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      // @ts-ignore - TS doesn't narrow "in" to type guard here
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `${prefix}_${Date.now().toString(36)}`;
}

// ---------------- Store API ----------------
async function list(threadId: string): Promise<Message[]> {
  return MESSAGES.get(threadId) ?? [];
}

async function add(
  threadId: string,
  body: string,
  author: Message["author"] = "user",
): Promise<Message> {
  const msg: Message = {
    id: safeUuid(),
    threadId,
    body,
    author,
    createdAt: new Date().toISOString(),
  };
  const arr = MESSAGES.get(threadId) ?? [];
  arr.push(msg);
  MESSAGES.set(threadId, arr);
  return msg;
}

/**
 * Exported handle used by the API route.
 * Keep the shape stable even if the backing store changes.
 */
export const store = { list, add };
