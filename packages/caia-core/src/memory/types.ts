export type Scope = string;
export type Key = string;

export type MemoryValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | Array<unknown>;

export interface MemoryBackend {
  get(scope: Scope, key: Key): Promise<MemoryValue | undefined>;
  set(scope: Scope, key: Key, value: MemoryValue): Promise<void>;
  list(scope: Scope): Promise<Record<Key, MemoryValue>>;
  del(scope: Scope, key: Key): Promise<void>;
}