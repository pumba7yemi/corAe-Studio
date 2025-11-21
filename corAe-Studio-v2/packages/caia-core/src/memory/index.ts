import { InMemoryBackend } from "./backends/inmemory.js";
import { FSJsonBackend } from "./backends/fsjson.js";
import type { MemoryBackend, MemoryValue } from "./types.js";

/** Choose backend via env:
 *  - CORAE_MEMORY_BACKEND=inmemory|fs
 *  - CORAE_MEMORY_DIR=./build/memory (for fs)
 */
function resolveBackend(): MemoryBackend {
  const mode = (process.env.CORAE_MEMORY_BACKEND || "fs").toLowerCase();
  if (mode === "inmemory") return new InMemoryBackend();
  const dir = process.env.CORAE_MEMORY_DIR || "./build/memory";
  return new FSJsonBackend(dir);
}

const backend = resolveBackend();

// High-level CAIA helpers (keep names you’ve referenced):
export async function readDockyardMemory(scope: string, key: string) {
  return backend.get(scope, key);
}
export async function readShipMemory(scope: string) {
  return backend.list(scope);
}
export async function readShipSeed(scope: string) {
  return backend.get(scope, "_seed");
}
export async function writeDockyardMemory(scope: string, key: string, value: MemoryValue) {
  await backend.set(scope, key, value);
}
export async function writeShipSeed(scope: string, value: MemoryValue) {
  await backend.set(scope, "_seed", value);
}
export async function deleteDockyardKey(scope: string, key: string) {
  await backend.del(scope, key);
}

export type { MemoryBackend, MemoryValue };