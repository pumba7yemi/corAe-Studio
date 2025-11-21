export type WFNode = { id: string; type: string; meta?: any };
export type WFEdge = { from: string; to: string };
export type WFDef  = { id?: string; nodes: WFNode[]; edges: WFEdge[] };

export async function execute(def: WFDef) {
  // naive execution: just returns node meta; hook adapters here if needed
  const results: Record<string, any> = {};
  for (const n of def.nodes || []) {
    results[n.id] = { ok: true, type: n.type, meta: n.meta ?? null };
  }
  return { ok: true, nodes: def.nodes?.length || 0, edges: def.edges?.length || 0, results };
}
