declare module "@/src/agent/devagent" {
  export function runDevAgent(taskOrPayload: unknown, payload?: unknown): Promise<unknown>;
}

declare module "@/src/agent/queueStore" {
  export type QueueItem = { id: string; status: string; [k: string]: any };
  export function loadQueue(): Promise<QueueItem[]>;
  export function saveQueue(queue: QueueItem[]): Promise<void>;
}
