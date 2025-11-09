// Minimal memory-core store shim used by Studio during build/dev.
export type MemoryKind = "note" | "message" | "task" | "fact";
export type MemoryItem = {
  id: string;
  tenantId: string;
  text: string;
  kind: MemoryKind;
  threadId?: string;
  tags?: string[];
  createdAt: string;
};

const STORE = new Map<string, MemoryItem[]>();

function uid(prefix = "mem") {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const store = {
  async list({ tenantId, threadId, q, limit = 50 }: any) {
    let items = STORE.get(tenantId) ?? [];
    if (threadId) items = items.filter((i) => i.threadId === threadId);
    if (q?.trim()) {
      const s = q.toLowerCase();
      items = items.filter((i) => i.text.toLowerCase().includes(s));
    }
    return items.slice(-limit);
  },
  async add({ tenantId, text, kind = "note", threadId, tags }: any) {
    const item: MemoryItem = { id: uid(), tenantId, text, kind, threadId, tags, createdAt: new Date().toISOString() };
    const arr = STORE.get(tenantId) ?? [];
    arr.push(item);
    STORE.set(tenantId, arr);
    return item;
  },
  async search(tenantId: string, q: string, limit = 50, threadId?: string) {
    return (await store.list({ tenantId, threadId, q, limit })) as MemoryItem[];
  },
};

export default store;

export { prisma } from './prisma';
