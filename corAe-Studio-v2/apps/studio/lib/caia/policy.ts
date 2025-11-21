export type RunContext = { userId: string; roles: string[] };

export function canRun(workflow: any, ctx: RunContext): boolean {
  const dna = new Set(["work_focus", "pricelock", "confirmed", "grv", "compliance"]);
  const usesDNA = Array.isArray(workflow?.nodes) && workflow.nodes.some((n: any) => dna.has(n.type));
  if (usesDNA && !ctx.roles.some(r => r === "Owner" || r === "Finance")) return false;
  return true;
}

export function requiredApprovals(workflow: any): string[] {
  return Array.isArray(workflow?.nodes) && workflow.nodes.some((n: any) => n.type === "pricelock")
    ? ["Finance"]
    : [];
}
