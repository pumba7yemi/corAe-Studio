import type { WorkFocusBundle, WorkFocusId, Answer, EngineResult, Action } from "./types";

export class WorkFocusEngine {
  constructor(private bundle: WorkFocusBundle) {}
  private getNode(id: WorkFocusId) {
    const n = this.bundle.nodes.find(n => n.id === id);
    if (!n) throw new Error(`Node not found: ${id}`);
    return n;
  }
  evaluate(id: WorkFocusId, answer: Answer): EngineResult {
    const node = this.getNode(id);
    const path = answer === "yes" ? node.onYes : node.onNo;
    const actions: Action[] = path?.actions ?? [];
    const nextId = path?.goto;
    const log: string[] = [
      `Q: ${node.prompt}`,
      `A: ${answer.toUpperCase()}`,
      nextId ? `Next → ${nextId}` : "End of path",
      actions.length ? `Actions: ${actions.map(a => a.type+":"+a.ref).join(", ")}` : "No actions"
    ];
    return { nextId, actions, log };
  }
}
