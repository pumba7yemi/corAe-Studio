import { memoryStore } from "./adapters/store.memory";
export * from "./schema/types";
export { memoryStore, MemoryCIMSStore } from "./adapters/store.memory";

export type SendParams = {
  tenantId: string;
  senderId: string;
  threadId?: string;
  subject?: string;
  channel?: "inapp" | "email" | "whatsapp";
  body: string;
  meta?: Record<string, any>;
};

/**
 * Send a message to the CIMS Core store.
 * Creates a thread if none exists.
 */
export async function send(params: SendParams) {
  const { tenantId, senderId, body } = params;
  if (!tenantId || !senderId || !body) {
    throw new Error("Missing required send() params");
  }

  let threadId = params.threadId;
  if (!threadId) {
    const t = memoryStore.createThread(tenantId, params.subject ?? "");
    threadId = t.id;
  }

  return memoryStore.postMessage({
    tenantId,
    senderId,
    threadId: threadId!,
    channel: params.channel ?? "inapp",
    body: params.body,
    meta: params.meta ?? {},
    readAt: null
  } as any);
}
