// apps/studio/lib/cims/messages.ts
// corAe Internal Messaging System – Local Store Adapter (150%-logic)
// Used when @corae/cims-core is unavailable.

export type MessageAuthor = "system" | "user" | "vendor" | "automate";

export interface Message {
  id: string;
  threadId: string;
  body: string;
  author: MessageAuthor;
  createdAt: string;
}

// ─────────────────────────────────────────
// Local in-memory store
// ─────────────────────────────────────────
const LOCAL: Map<string, Message[]> = new Map();

function makeMessage(threadId: string, body: string, author: MessageAuthor = "user"): Message {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `m_${Date.now().toString(36)}`,
    threadId,
    body,
    author,
    createdAt: new Date().toISOString(),
  };
}

export const store = {
  /**
   * List messages for a given thread.
   */
  async list(threadId: string): Promise<Message[]> {
    return LOCAL.get(threadId) ?? [];
  },

  /**
   * Add a new message to a thread.
   */
  async add(threadId: string, body: string, author: MessageAuthor = "user"): Promise<Message> {
    const msg = makeMessage(threadId, body, author);
    const arr = LOCAL.get(threadId) ?? [];
    arr.push(msg);
    LOCAL.set(threadId, arr);
    return msg;
  },

  /**
   * Clear all messages (useful for testing).
   */
  async clear(threadId?: string) {
    if (threadId) LOCAL.delete(threadId);
    else LOCAL.clear();
  },
};
