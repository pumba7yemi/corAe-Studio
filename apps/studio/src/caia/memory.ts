// Lightweight ship-memory helper for dev: readShipMemory / writeShipMemory
// In production this should delegate to CAIA ship memory APIs.

type ShipScopeKey = { scope: string; key: string };

const STORE = new Map<string, any>();

function mkKey(scope: string, key: string) {
  return `${scope}::${key}`;
}

// Support both forms:
// - readShipMemory(scope) => returns object mapping keys -> values
// - readShipMemory(scope, key) => returns value for that key or null
export async function readShipMemory(scope: string): Promise<Record<string, any>>;
export async function readShipMemory(scope: string, key: string): Promise<any | null>;
export async function readShipMemory(scope: string, key?: string): Promise<any> {
  if (typeof key === "string") {
    const k = mkKey(scope, key);
    if (STORE.has(k)) return JSON.parse(JSON.stringify(STORE.get(k)));
    return null;
  }
  // return whole scope as an object
  const out: Record<string, any> = {};
  for (const [k, v] of STORE.entries()) {
    if (k.startsWith(`${scope}::`)) {
      const sub = k.slice(scope.length + 2);
      out[sub] = JSON.parse(JSON.stringify(v));
    }
  }
  return out;
}

// writeShipMemory can be used two ways:
// - writeShipMemory(scope, key, value)
// - writeShipMemory(scope, dataObject)
export async function writeShipMemory(scope: string, key: string, value: any): Promise<void>;
export async function writeShipMemory(scope: string, data: Record<string, any>): Promise<void>;
export async function writeShipMemory(scope: string, a: any, b?: any): Promise<void> {
  if (typeof a === "string" && arguments.length === 3) {
    const key = a as string;
    const value = b;
    const k = mkKey(scope, key);
    STORE.set(k, JSON.parse(JSON.stringify(value)));
    return;
  }
  const data = a as Record<string, any>;
  for (const key of Object.keys(data || {})) {
    const k = mkKey(scope, key);
    STORE.set(k, JSON.parse(JSON.stringify(data[key])));
  }
}

// For debugging: expose store (dev only)
// @ts-ignore
export const __DEV_SHIP_STORE__ = STORE;

// Additional convenience helper used by CAIA demos: append to a dockyard scope.
export async function appendDockyardMemory(item: any): Promise<void> {
  const scope = "dockyard";
  const key = "items";
  const cur = (await readShipMemory(scope, key)) as any[] | undefined;
  const next = Array.isArray(cur) ? cur.slice() : [];
  next.push(item);
  await writeShipMemory(scope, key, next);
}
