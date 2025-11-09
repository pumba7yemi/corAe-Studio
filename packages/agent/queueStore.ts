export type QueueItem = {
  id: string;
  status: "queued" | "running" | "done" | "error";
  task?: string;
  payload?: unknown;
  result?: unknown;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
};

let _q: QueueItem[] = [];

export function loadQueue(): QueueItem[] {
  return _q;
}
export function saveQueue(q: QueueItem[]): void {
  _q = q;
}