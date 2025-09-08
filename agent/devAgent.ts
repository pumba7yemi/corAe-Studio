export async function runDevAgent(task: string, payload?: unknown): Promise<unknown> {
  // TODO: implement your real agent
  return { ok: true, task, payload: payload ?? null };
}