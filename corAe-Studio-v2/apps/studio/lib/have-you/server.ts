"use server";

// types for @corae/have-you-core are declared in a separate ambient file.
// @ts-ignore: module has no type declarations in this workspace
import { HaveYouEngine, ServerAdapter } from "@corae/have-you-core";
import { getAllPresets } from "./presets";

// TODO: replace with Prisma wiring
const adapter = new ServerAdapter({
  load: async () => {
    // Read from DB; for now, transient memory via globalThis
    const g = globalThis as any;
    return (g.__HY_STATES ||= []);
  },
  save: async (s: { itemId: any; }) => {
    const g = globalThis as any;
    const arr = (g.__HY_STATES ||= []);
    const i = arr.findIndex((x: any) => x.itemId === s.itemId);
    if (i >= 0) arr[i] = s; else arr.push(s);
  },
  remove: async (id: any) => {
    const g = globalThis as any;
    const arr = (g.__HY_STATES ||= []);
    const next = arr.filter((x: any) => x.itemId !== id);
    g.__HY_STATES = next;
  },
});

export async function getEngine() {
  const items = await getAllPresets();
  // Temporary cast to any to bridge shape differences between app presets
  // and the core HaveYouItem type. Replace with a mapper when ready.
  return new HaveYouEngine({ storage: adapter, items: items as any });
}

export async function checkAll(facts: Record<string, unknown> = {}) {
  const engine = await getEngine();
  return engine.checkAll(facts);
}

export async function done(itemId: string) {
  const engine = await getEngine();
  return engine.markDone(itemId);
}

export async function snooze(itemId: string, untilISO: string) {
  const engine = await getEngine();
  return engine.snooze(itemId, new Date(untilISO));
}