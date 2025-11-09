import { Domain, HaveYouState, StorageAdapter } from "./types.js";

// Simple in-memory adapter (useful for tests or SSR hydrating to DB)
export class MemoryStorage implements StorageAdapter {
  private store = new Map<string, HaveYouState>();

  async loadStates(): Promise<HaveYouState[]> {
    return [...this.store.values()];
  }
  async saveState(state: HaveYouState): Promise<void> {
    this.store.set(state.itemId, state);
  }
  async removeState(itemId: string): Promise<void> {
    this.store.delete(itemId);
  }
}

// Browser localStorage adapter (client-side)
export class LocalStorageAdapter implements StorageAdapter {
  private key = "corae.haveYou.states.v1";
  async loadStates(): Promise<HaveYouState[]> {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as HaveYouState[]) : [];
  }
  async saveState(state: HaveYouState): Promise<void> {
    if (typeof window === "undefined") return;
    const all = await this.loadStates();
    const idx = all.findIndex((s) => s.itemId === state.itemId);
    if (idx >= 0) all[idx] = state;
    else all.push(state);
    window.localStorage.setItem(this.key, JSON.stringify(all));
  }
  async removeState(itemId: string): Promise<void> {
    if (typeof window === "undefined") return;
    const all = await this.loadStates();
    const next = all.filter((s) => s.itemId !== itemId);
    window.localStorage.setItem(this.key, JSON.stringify(next));
  }
}

// Example server-side adapter placeholder: connect to Prisma later
export class ServerAdapter implements StorageAdapter {
  constructor(private io: {
    load: (domain?: Domain) => Promise<HaveYouState[]>;
    save: (s: HaveYouState) => Promise<void>;
    remove: (id: string) => Promise<void>;
  }) {}
  loadStates(domain?: Domain): Promise<HaveYouState[]> { return this.io.load(domain); }
  saveState(s: HaveYouState): Promise<void> { return this.io.save(s); }
  removeState(id: string): Promise<void> { return this.io.remove(id); }
}