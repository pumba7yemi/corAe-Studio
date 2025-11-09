/**
 * corAe Memory Layer — RAM microstore
 * -----------------------------------
 * Used by CAIA, Workflows, Pulse, and other APIs as temporary
 * in-memory persistence (non-database) for local dev / simulation.
 */

type MemoryValue = unknown;
type MemoryStore = Record<string, MemoryValue>;

// single runtime store (per process)
const _mem: MemoryStore = {};

// ----- Basic API -----
export const RAM = {
  /** Get a value by key.
   * Supports both `get(key)` and `get(id, key)` shapes for compatibility.
   */
  get<T = MemoryValue>(...args: [string] | [string, string]): T | undefined {
    if (args.length === 1) return _mem[args[0]] as T | undefined;
    const [id, key] = args as [string, string];
    return _mem[`${id}:${key}`] as T | undefined;
  },

  /** Set or overwrite a value.
   * Supports both `set(key, value)` and `set(id, key, value)` shapes.
   */
  set<T = MemoryValue>(...args: [string, T] | [string, string, T]): void {
    if (args.length === 2) {
      const [key, value] = args as [string, T];
      _mem[key] = value;
      return;
    }
    const [id, key, value] = args as [string, string, T];
    _mem[`${id}:${key}`] = value;
  },

  /** Delete a key. Supports `del(key)` and `del(id, key)`. */
  del(...args: [string] | [string, string]): void {
    if (args.length === 1) {
      delete _mem[args[0]];
      return;
    }
    const [id, key] = args as [string, string];
    delete _mem[`${id}:${key}`];
  },

  /** Return a shallow copy of all memory. */
  all(): MemoryStore {
    return { ..._mem };
  },

  /** Reset the memory completely. */
  clear(): void {
    Object.keys(_mem).forEach((k) => delete _mem[k]);
  },
};

// ----- Helpers for typical workflows -----

/** Append to an array value (creates array if missing). */
export function pushToMemory<T = unknown>(key: string, item: T): T[] {
  const arr = (RAM.get<T[]>(key) ?? []) as T[];
  arr.push(item);
  RAM.set(key, arr);
  return arr;
}

/** Increment a numeric counter by step (default +1). */
export function bump(key: string, step = 1): number {
  const current = Number(RAM.get<number>(key) ?? 0);
  const next = current + step;
  RAM.set(key, next);
  return next;
}

/** Generate a pseudo ID and store an entry (handy for stubbing). */
export function addEntry<T extends object>(namespace: string, entry: T): string {
  const id = `${namespace}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  pushToMemory(namespace, { id, ...entry });
  return id;
}

export default RAM;
