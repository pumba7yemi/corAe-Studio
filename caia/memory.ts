// caia/memory.ts

export type Scope = "dockyard" | "ship";

export type MemoryItem = {
  id?: string;
  text: string;
  role?: "user" | "assistant";
  user?: string;
  scope?: Scope;
  ts?: string;
};

const memDockyard: MemoryItem[] = [];
const memShip: MemoryItem[] = [];

/** Normalize & stamp defaults (id/ts/scope if not present) */
function withDefaults(item: MemoryItem, scope?: Scope): MemoryItem {
  return {
    id: item.id ?? String(Date.now()),
    ts: item.ts ?? new Date().toISOString(),
    scope: item.scope ?? scope,
    ...item
  };
}

/** Append to dockyard memory (private growth log) */
export function appendDockyardMemory(m: MemoryItem): void {
  memDockyard.push(withDefaults(m, "dockyard"));
}

/** Append to ship memory (per-ship context) */
export function appendShipMemory(m: MemoryItem): void {
  memShip.push(withDefaults(m, "ship"));
}

/** Generic append by scope */
export function appendMemory(scope: Scope, m: MemoryItem): void {
  if (scope === "dockyard") appendDockyardMemory(m);
  else appendShipMemory(m);
}

/** Read recent ship memory */
export function readShipMemory(limit?: number): MemoryItem[] {
  const list = memShip.slice();
  return typeof limit === "number" ? list.slice(-limit) : list;
}

/** Read recent dockyard memory */
export function readDockyardMemory(limit?: number): MemoryItem[] {
  const list = memDockyard.slice();
  return typeof limit === "number" ? list.slice(-limit) : list;
}

/** Generic read by scope */
export function readMemory(scope: Scope, limit?: number): MemoryItem[] {
  return scope === "dockyard" ? readDockyardMemory(limit) : readShipMemory(limit);
}

/** Utility: clear one or both scopes (for tests/dev) */
export function clearMemory(scope?: Scope): void {
  if (!scope || scope === "dockyard") memDockyard.length = 0;
  if (!scope || scope === "ship") memShip.length = 0;
}

/** Seed helper if anything expects a seed list */
export function readShipSeed(): string[] {
  return [];
}