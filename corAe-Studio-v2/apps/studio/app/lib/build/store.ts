// app/lib/build/store.ts
export type BuildStatus = "queued" | "running" | "success" | "failed";
export type BuildItem = {
  id: string;
  title: string;
  by: string;            // user or system
  createdAt: string;     // ISO
  finishedAt?: string;   // ISO
  status: BuildStatus;
  meta?: Record<string, any>;
};

let HISTORY: BuildItem[] = [
  { id: "bld-1207", title: "Automate: Morning Price Check", by: "system", createdAt: new Date().toISOString(), status: "success", finishedAt: new Date().toISOString() },
  { id: "bld-1206", title: "Theme: Choice Plus preset",     by: "owner",  createdAt: new Date().toISOString(), status: "success", finishedAt: new Date().toISOString() },
];

let QUEUE: BuildItem[] = [];

const makeId = () => `bld-${Math.random().toString(36).slice(2, 6)}`;

export function enqueue(title: string, by = "system", meta?: Record<string, any>) {
  const item: BuildItem = { id: makeId(), title, by, createdAt: new Date().toISOString(), status: "queued", meta };
  QUEUE.push(item);
  return item;
}

export function startNext() {
  const next = QUEUE.shift();
  if (!next) return null;
  next.status = "running";
  return next;
}

export function complete(id: string, ok = true) {
  const all = [...QUEUE, ...HISTORY];
  const found = all.find((b) => b.id === id);
  if (!found) return null;
  found.status = ok ? "success" : "failed";
  found.finishedAt = new Date().toISOString();
  // keep history list newest-first
  HISTORY = [found, ...HISTORY.filter((b) => b.id !== id)];
  return found;
}

export function getQueue() { return [...QUEUE]; }
export function getHistory(limit = 10) { return HISTORY.slice(0, limit); }
