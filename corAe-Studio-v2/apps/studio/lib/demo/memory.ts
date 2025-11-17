type KV = Record<string, unknown>;
const store: Record<string, KV> = {};
export async function read(scope: string, key?: string) {
  const b = store[scope] || {};
  return key ? (b as any)[key] : b;
}
export async function write(scope: string, key: string, value: unknown) {
  if (!store[scope]) store[scope] = {};
  store[scope][key] = value;
  return { ok: true };
}
export function reset() { for (const k of Object.keys(store)) delete store[k]; }
