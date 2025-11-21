// Minimal runtime so dispatcher can call execute()
export type WFNode = { id: string; type: string; meta?: any };
export type WFEdge = { from: string; to: string };
export type WFDef = { id?: string; nodes: WFNode[]; edges: WFEdge[] };

export async function execute(def: WFDef) {
  // naive topological-ish walk (no branching), just returns metadata
  const results: Record<string, any> = {};
  for (const n of def.nodes) {
    results[n.id] = { type: n.type, ok: true, meta: n.meta ?? null };
    // simulate async
    // await new Promise(r => setTimeout(r, 1));
  }
  return { ok: true, nodes: def.nodes.length, edges: def.edges.length, results };
}