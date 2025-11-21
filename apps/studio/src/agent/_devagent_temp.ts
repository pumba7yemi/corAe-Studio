// temporary staging file for safe case-normalization
export async function runDevAgent(task: string, payload?: unknown): Promise<unknown> {
  return Promise.resolve({ ok: true, task, payload });
}
