"use client";

// Local minimal declarations to satisfy the compiler when the external package isn't available.
export class LocalStorageAdapter {
  constructor() {}
}

export type HaveYouItem = any;

export class HaveYouEngine {
  constructor(options: { storage: LocalStorageAdapter; items: HaveYouItem[] }) {}
}

let engine: HaveYouEngine | null = null;

export async function initClientEngine(items: HaveYouItem[]) {
  if (!engine) {
    engine = new HaveYouEngine({ storage: new LocalStorageAdapter(), items });
  }
  return engine;
}