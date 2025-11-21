// apps/studio/lib/agent/queueStore.ts
import fs from 'node:fs/promises';
import path from 'node:path';

export type QueueStatus = 'queued' | 'running' | 'done' | 'error';

export type QueueItem = {
  id: string;
  task: string;
  payload: any;
  status: QueueStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  result?: any;
  error?: string;
};

type QueueFile = { queue: QueueItem[] };

// Save queue data inside `.data/agentQueue.json`
const DATA_DIR = path.join(process.cwd(), 'apps', 'studio', '.data');
const QUEUE_FILE = path.join(DATA_DIR, 'agentQueue.json');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readFileSafe(): Promise<QueueFile> {
  try {
    const raw = await fs.readFile(QUEUE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.queue)) return { queue: [] };
    return parsed as QueueFile;
  } catch {
    return { queue: [] };
  }
}

async function writeFileSafe(data: QueueFile) {
  await ensureDir();
  const tmp = QUEUE_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, QUEUE_FILE);
}

// Load full queue
export async function loadQueue(): Promise<QueueItem[]> {
  const { queue } = await readFileSafe();
  return queue;
}

// Save full queue
export async function saveQueue(queue: QueueItem[]): Promise<void> {
  await writeFileSafe({ queue });
}

// Clear queue
export async function clearQueue(): Promise<void> {
  await writeFileSafe({ queue: [] });
}

// Take the next queued item
export function shiftNext(queue: QueueItem[]): QueueItem | null {
  const idx = queue.findIndex((q) => q.status === 'queued');
  if (idx === -1) return null;
  const item = queue[idx];
  item.startedAt = new Date().toISOString();
  return item;
}