// Minimal devagent shim for Studio build-time imports (lowercase canonical file).
// Provides a single exported runDevAgent to satisfy route imports during redline runs.
export async function runDevAgent(taskOrPayload: unknown, payload?: unknown): Promise<unknown> {
  // Lightweight stub used at build-time; runtime routes may call real agent code.
  return Promise.resolve({ ok: true, taskOrPayload, payload });
}
