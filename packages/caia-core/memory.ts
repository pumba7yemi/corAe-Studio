// packages/caia-core/memory.ts
// Core memory exports. For now, forward to the build-memory module which is expected
// to live in this package and be implemented separately.
export async function loadRom(path: string): Promise<Uint8Array> {
  // stub implementation — replace with real build-memory implementation
  throw new Error('build-memory not implemented: loadRom');
}

export function loadRam(): Uint8Array {
  // stub implementation — replace with real build-memory implementation
  throw new Error('build-memory not implemented: loadRam');
}

export function loadRules(): Record<string, unknown> {
  // stub implementation — replace with real build-memory implementation
  throw new Error('build-memory not implemented: loadRules');
}
