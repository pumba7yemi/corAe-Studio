import { nanoid } from "nanoid";
import type { Message, Thread } from "../schema/types";

/**
 * In-memory message and thread store for CIMS Core.
 * Replace later with Prisma/SQLite adapter.
 */
export class MemoryCIMSStore {
  private threads = new Map<string, Thread>();
  private messages = new Map<string, Message[]>();

  // List all threads for a tenant
  listThreads(tenantId: string): Thread[] {
    return Array.from(this.threads.values()).filter(t => t.tenantId === tenantId);
  }

  // Create a new thread
  createThread(tenantId: string, subject = ""): Thread {
    const t: Thread = { id: nanoid(), tenantId, subject };
    this.threads.set(t.id, t);
    this.messages.set(t.id, []);
    return t;
  }

  // Get a thread by ID
  getThread(id: string): Thread | undefined {
    return this.threads.get(id);
  }

  // Post a message to a thread
  postMessage(input: Omit<Message, "id" | "createdAt">): Message {
    const msg: Message = {
      ...input,
      id: nanoid(),
      createdAt: new Date().toISOString()
    } as Message;

    const arr = this.messages.get(msg.threadId) ?? [];
    arr.push(msg);
    this.messages.set(msg.threadId, arr);
    return msg;
  }

  // List all messages in a thread
  listMessages(threadId: string): Message[] {
    return this.messages.get(threadId) ?? [];
  }
}

// Export single instance
export const memoryStore = new MemoryCIMSStore();
