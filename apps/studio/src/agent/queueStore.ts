// Minimal queue store shim for build-first runs.
export type QueueItem = { id: string; status: string; [k: string]: any };

export async function loadQueue(): Promise<QueueItem[]> {
  // Return empty queue by default; real implementation persists to storage.
  return [];
}

export async function saveQueue(queue: QueueItem[]): Promise<void> {
  // noop for build-first stub
  return;
}
// Note: this file intentionally provides a minimal stubbed API for build-first
// runs. The full implementations live in the agent lib and can be wired in
// at runtime where appropriate.
