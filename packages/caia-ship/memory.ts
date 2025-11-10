// packages/caia-ship/memory.ts
// Ship-specific memory shim: re-export core build-memory utilities for now.

// Core module not found; provide a minimal local shim to satisfy imports and typings.
export type MemoryStore = {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  delete(key: string): void;
};

export function createMemoryStore(): MemoryStore {
  const map = new Map<string, unknown>();
  return {
	get(key: string) {
	  return map.get(key);
	},
	set(key: string, value: unknown) {
	  map.set(key, value);
	},
	delete(key: string) {
	  map.delete(key);
	},
  };
}