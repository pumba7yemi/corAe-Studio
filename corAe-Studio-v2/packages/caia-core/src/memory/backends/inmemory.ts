import type { MemoryBackend, MemoryValue } from "../types.js";

export class InMemoryBackend implements MemoryBackend {
  private store = new Map<string, Map<string, MemoryValue>>();

  async get(scope: string, key: string) {
    return this.store.get(scope)?.get(key);
  }
  async set(scope: string, key: string, value: MemoryValue) {
    if (!this.store.has(scope)) this.store.set(scope, new Map());
    this.store.get(scope)!.set(key, value);
  }
  async list(scope: string) {
    const m = this.store.get(scope);
    const out: Record<string, MemoryValue> = {};
    if (m) for (const [k, v] of m.entries()) out[k] = v;
    return out;
  }
  async del(scope: string, key: string) {
    this.store.get(scope)?.delete(key);
  }
}