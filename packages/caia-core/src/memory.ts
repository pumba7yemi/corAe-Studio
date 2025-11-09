// packages/caia-core/src/memory.ts

// In-memory stores
const dockyardMemory = new Map<string, Map<string, string>>();
const shipMemory = new Map<string, Record<string, string>>();

// Read a single key from Dockyard memory
export async function readDockyardMemory(scope: string, key: string): Promise<string | null> {
  const scopeMap = dockyardMemory.get(scope);
  return scopeMap?.get(key) ?? null;
}

// Write a single key to Dockyard memory
export async function writeDockyardMemory(scope: string, key: string, value: string): Promise<void> {
  if (!dockyardMemory.has(scope)) dockyardMemory.set(scope, new Map());
  dockyardMemory.get(scope)!.set(key, value);
}

// Read all keys from Ship memory
export async function readShipMemory(scope: string): Promise<Record<string, string>> {
  return shipMemory.get(scope) ?? {};
}

// Write all keys to Ship memory
export async function writeShipMemory(scope: string, data: Record<string, string>): Promise<void> {
  // Merge to preserve existing keys instead of overwriting whole scope
  const existing = shipMemory.get(scope) ?? {};
  shipMemory.set(scope, { ...existing, ...data });
}

// TODO: Replace this with persistent storage (Prisma or Mongo) later.

// --- APPEND HELPERS -------------------------------------------------
// Thin wrappers that express intent more clearly; append = merge/add
export async function appendDockyardMemory(scope: string, key: string, value: string): Promise<void> {
  return writeDockyardMemory(scope, key, value);
}

export async function appendShipMemory(scope: string, data: Record<string, string>): Promise<void> {
  const existing = await readShipMemory(scope);
  return writeShipMemory(scope, { ...existing, ...data });
}
// --------------------------------------------------------------------