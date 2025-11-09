// build/log.ts

export type Level = "INFO" | "WARN" | "ERROR";

export type BuildEvent = {
  id?: string;                  // auto-filled if missing
  type?: string;                // optional when you pass a full object
  level?: Level;                // your routes use this
  scope?: string;
  action?: string;
  file?: unknown;
  notes?: unknown;
  meta?: unknown;
  ts?: string;                  // often provided by callers; auto-filled if missing
};

const _events: BuildEvent[] = [];

function withDefaults(e: BuildEvent): BuildEvent {
  return {
    id: e.id ?? String(Date.now()),
    ts: e.ts ?? new Date().toISOString(),
    ...e
  };
}

/** Append a (possibly partial) event; we fill id/ts defaults. */
export function appendEvent(e: BuildEvent): void {
  _events.push(withDefaults(e));
}

/** Read the last `limit` events (or all if not provided). */
export function readEvents(limit?: number): BuildEvent[] {
  const list = _events.slice();
  return typeof limit === "number" ? list.slice(-limit) : list;
}

/**
 * Log either:
 *  - a string `type` with optional payload (stored in `meta`), or
 *  - a full/partial event object (id/ts auto-filled).
 */
export function logEvent(typeOrEvent: string | BuildEvent, payload?: unknown): void {
  if (typeof typeOrEvent === "string") {
    _events.push(
      withDefaults({
        type: typeOrEvent,
        meta: payload
      })
    );
  } else {
    _events.push(withDefaults(typeOrEvent));
  }
}

// Provide a default export with convenient logging helpers so code which
// expects `appendEvent.info({...})` or `appendEvent.error({...})` works
// without touching many call sites.
const defaultLogger = {
  info: (e: BuildEvent) => appendEvent({ ...e, level: 'INFO' }),
  error: (e: BuildEvent) => appendEvent({ ...e, level: 'ERROR' }),
  read: (limit?: number) => readEvents(limit),
};

export default defaultLogger;