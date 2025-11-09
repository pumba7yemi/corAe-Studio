// Minimal workflows runtime shim for build-time.
// Keep this module tiny and dependency-free so Next's bundler/typegen is happy.

export async function runWorkflow(name: string, payload?: any) {
  // Lightweight noop fallback used during builds when the real workflows package
  // isn't available. Callers expect a promise-like result.
  return { ok: true, name, payload } as const;
}

export async function execute(flowName: string, input?: unknown) {
  // Proxy to runWorkflow in this minimal shim. Replace with a real proxy
  // to @corae/workflows-core/server when available.
  return runWorkflow(flowName, input ?? {});
}

export default { runWorkflow, execute };
