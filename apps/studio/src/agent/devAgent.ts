/**
 * Minimal devAgent shim for Studio build-time imports.
 * This avoids resolving packages/agent during the Next build.
 */
export async function runDevAgent(task: string, payload?: unknown): Promise<unknown> {
  // Lightweight stub used at build-time; runtime routes may call real agent code.
  return Promise.resolve({ ok: true, task, payload });
}
