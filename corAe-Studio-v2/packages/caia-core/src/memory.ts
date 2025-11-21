// packages/caia-core/src/memory.ts

// packages/caia-core/src/memory.ts

// In-memory stores
const dockyardMemory = new Map<string, Map<string, string>>();
const shipMemory = new Map<string, Record<string, unknown>>();

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

// Append helper for dockyard
export async function appendDockyardMemory(scope: string, key: string, value: string): Promise<void> {
  const prev = (await readDockyardMemory(scope, key)) ?? "";
  await writeDockyardMemory(scope, key, prev ? `${prev}\n${value}` : value);
}

// ---- SHIP (object per scope) ----
// Overloads to allow call-sites with 1, 2, or 3 args safely.
export async function readShipMemory<T = unknown>(scope: string): Promise<T | Record<string, unknown> | {}>;
export async function readShipMemory<T = unknown>(scope: string, key: string): Promise<T | null>;
export async function readShipMemory<T = unknown>(scope: string, key?: string): Promise<any> {
  const obj = shipMemory.get(scope) ?? {};
  if (typeof key === "string") return (obj as Record<string, unknown>)[key] ?? null;
  return obj;
}

export async function writeShipMemory(scope: string, data: Record<string, unknown>): Promise<void>;
export async function writeShipMemory(scope: string, key: string, value: unknown): Promise<void>;
export async function writeShipMemory(scope: string, a: any, b?: any): Promise<void> {
  if (typeof a === "string" && arguments.length === 3) {
    // writeShipMemory(scope, key, value)
    const key = a as string;
    const value = b;
    const existing = (shipMemory.get(scope) ?? {}) as Record<string, unknown>;
    (existing as Record<string, unknown>)[key] = value;
    shipMemory.set(scope, existing);
  } else {
    // writeShipMemory(scope, data)
    const data = a as Record<string, unknown>;
    const existing = (shipMemory.get(scope) ?? {}) as Record<string, unknown>;
    shipMemory.set(scope, { ...existing, ...data });
  }
}

export async function appendShipMemory(scope: string, data: Record<string, unknown>): Promise<void> {
  const existing = (await readShipMemory<Record<string, unknown>>(scope)) ?? {};
  return writeShipMemory(scope, { ...existing, ...data });

}

// TODO: Replace this with persistent storage (Prisma or Mongo) later.
