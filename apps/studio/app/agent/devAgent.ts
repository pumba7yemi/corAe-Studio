// Local build-time shim to avoid importing src module and triggering
// filename-casing issues during the Next build on case-insensitive
// filesystems. This mirrors the lightweight stub in src/agent/devagent.
export async function runDevAgent(task: string, payload?: unknown): Promise<unknown> {
  return Promise.resolve({ ok: true, task, payload });
}