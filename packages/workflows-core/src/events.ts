type Handler = (inst: any, payload?: any) => Promise<void>;
const bus: Record<string, Handler[]> = {};

export function on(topic: string, h: Handler) {
  (bus[topic] ??= []).push(h);
}

export async function emit(topics: string[], inst: any, payload?: any) {
  for (const t of topics) {
    for (const h of (bus[t] ?? [])) await h(inst, payload);
  }
}

export async function queue(specId: string, ctx: any) {
  // enqueue start of another workflow; integrate with your runner/queue
}
