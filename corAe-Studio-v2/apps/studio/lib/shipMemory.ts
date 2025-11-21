// Lightweight ship-memory helper used by demo APIs.
// Tries to use a global Map so state survives module reloads in dev.

type AnyMap = Map<string, any>;

function rootMap(): Map<string, AnyMap> {
  // @ts-ignore
  if (!(globalThis as any).__SHIP_MEMORY__) {
    // @ts-ignore
    (globalThis as any).__SHIP_MEMORY__ = new Map();
  }
  // @ts-ignore
  return (globalThis as any).__SHIP_MEMORY__ as Map<string, AnyMap>;
}

export async function readShipMemory(scope: string, key: string) {
  const root = rootMap();
  const scopeMap = root.get(scope) ?? new Map();
  root.set(scope, scopeMap);
  return scopeMap.get(key);
}

export async function writeShipMemory(scope: string, key: string, value: any) {
  const root = rootMap();
  const scopeMap = root.get(scope) ?? new Map();
  scopeMap.set(key, value);
  root.set(scope, scopeMap);
  return value;
}
