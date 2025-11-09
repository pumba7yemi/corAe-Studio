export type AutomationJob = {
  id?: string;
  type: string;
  payload?: any;
  createdAt?: string;
};

/**
 * enqueue: no-op V1
 * - logs the job client-side (safe, no external deps)
 * - echoes back a job with id and createdAt
 */
export async function enqueue(job: AutomationJob): Promise<AutomationJob & { ok: true }> {
  try {
    const j = { ...job, id: job.id || `job_${Date.now()}`, createdAt: new Date().toISOString() };
    // Best-effort local telemetry: try localStorage
    try {
      const key = 'caia:automation:jobs';
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(j);
      if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(arr.slice(-100)));
    } catch (e) {
      // ignore storage errors
    }
    // Console log for server-side visibility during development
    // (CI/build won't execute this at runtime)
    // eslint-disable-next-line no-console
    console.log('[automation.enqueue]', j);
    return { ...j, ok: true };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[automation.enqueue] failed to enqueue', e);
    return { id: job.id, type: job.type, payload: job.payload, createdAt: new Date().toISOString(), ok: true };
  }
}
