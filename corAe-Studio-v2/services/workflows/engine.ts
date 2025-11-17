// services/workflows/engine.ts
import { v4 as uuid } from "uuid";

type WorkflowSpec = Record<string, any>;

interface RunContext {
  id: string;
  workflow: WorkflowSpec;
  data: Record<string, any>;
  startedAt: Date;
}

class WorkflowEngine {
  private registry: Map<string, WorkflowSpec> = new Map();
  private runs: Map<string, RunContext> = new Map();

  register(spec: WorkflowSpec) {
    if (!spec.workflow_id) throw new Error("Spec missing workflow_id");
    this.registry.set(spec.workflow_id, spec);
    console.log(`⚙️ Registered workflow: ${spec.workflow_id}`);
  }

  async start(workflowId: string, data: any) {
    const spec = this.registry.get(workflowId);
    if (!spec) throw new Error(`Workflow ${workflowId} not found`);
    const id = uuid();
    const ctx: RunContext = { id, workflow: spec, data, startedAt: new Date() };
    this.runs.set(id, ctx);
    console.log(`🚀 Started ${workflowId} (run ${id})`);
    // In real use: dispatch first node here.
    return id;
  }

  getRun(id: string) {
    return this.runs.get(id);
  }

  listWorkflows() {
    return Array.from(this.registry.keys());
  }
}

export const engine = new WorkflowEngine();