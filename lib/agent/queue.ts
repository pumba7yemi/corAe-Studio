import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export type AgentTask = {
  id: string;
  task: string;
  payload: any;
  status: 'queued' | 'running' | 'done' | 'error';
  createdAt: string;
  updatedAt: string;
  error?: string;
  hash: string;
};

const DATA_DIR = path.join(process.cwd(), '.data');
const QUEUE_FILE = path.join(DATA_DIR, 'agentQueue.json');

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(QUEUE_FILE);
  } catch {
    await fs.writeFile(QUEUE_FILE, JSON.stringify({ queue: [] }, null, 2), 'utf8');
  }
}

async function readQueue(): Promise<AgentTask[]> {
  await ensureFile();
  const raw = await fs.readFile(QUEUE_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.queue) ? parsed.queue : [];
  } catch {
    // self-heal corrupt file
    await fs.writeFile(QUEUE_FILE, JSON.stringify({ queue: [] }, null, 2), 'utf8');
    return [];
  }
}

async function writeQueue(q: AgentTask[]) {
  await ensureFile();
  await fs.writeFile(QUEUE_FILE, JSON.stringify({ queue: q }, null, 2), 'utf8');
}

export async function getQueue() {
  const queue = await readQueue();
  return { queue };
}

export function makeHash(task: string, payload: any) {
  const h = crypto.createHash('sha256');
  h.update(task);
  h.update(JSON.stringify(payload ?? null));
  return h.digest('hex').slice(0, 16);
}

export async function enqueue(task: string, payload: any, allowDuplicate = false) {
  const queue = await readQueue();
  const hash = makeHash(task, payload);

  if (!allowDuplicate) {
    const dup = queue.find(
      (t) => t.hash === hash && (t.status === 'queued' || t.status === 'running')
    );
    if (dup) {
      return { ok: false, duplicate: true, item: dup };
    }
  }

  const now = new Date().toISOString();
  const item: AgentTask = {
    id: crypto.randomUUID(),
    task,
    payload,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    hash,
  };

  queue.unshift(item);
  await writeQueue(queue);
  return { ok: true, item };
}

export async function updateStatus(id: string, status: AgentTask['status'], error?: string) {
  const queue = await readQueue();
  const idx = queue.findIndex((t) => t.id === id);
  if (idx === -1) return { ok: false, error: 'not_found' };

  queue[idx].status = status;
  queue[idx].updatedAt = new Date().toISOString();
  if (error) queue[idx].error = error;
  await writeQueue(queue);
  return { ok: true, item: queue[idx] };
}