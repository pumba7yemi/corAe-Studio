// Logic for retrying an Outbox message by calling Automate.
// This is the robust version with backoff + maxAttempts.
// Import this in OutboxPanel.

export type OutboxStatus = "QUEUED" | "SENT" | "CONFIRMED" | "FAILED";

export interface OutboxMessage {
  id: string;
  workflowRunId: string;
  title: string;
  status: OutboxStatus;
  attempt: number;
  nextAttemptAt?: string;
  reason?: string;
}

export interface HandleRetryOptions {
  automateBaseUrl: string;     // e.g. "http://localhost:4000/automate"
  token?: string;              // bearer token if needed
  fetchImpl?: typeof fetch;    // for testing or custom runtimes
  maxAttempts?: number;        // default: 6
  backoffSecondsBase?: number; // default: 15
  backoffSecondsCap?: number;  // default: 600
}

export async function handleRetry(
  msg: OutboxMessage,
  opts: HandleRetryOptions
): Promise<OutboxMessage> {
  const fetcher = opts.fetchImpl ?? fetch;
  const maxAttempts = opts.maxAttempts ?? 6;
  const base = opts.backoffSecondsBase ?? 15;
  const cap = opts.backoffSecondsCap ?? 600;

  // If we've exhausted retries
  if (msg.attempt >= maxAttempts && msg.status !== "CONFIRMED") {
    return {
      ...msg,
      status: "FAILED",
      reason: `Max attempts (${maxAttempts}) reached`,
      nextAttemptAt: undefined,
    };
  }

  // Optimistically mark SENT while retrying
  let updated: OutboxMessage = { ...msg, status: "SENT" };

  try {
    const res = await fetcher(
      `${opts.automateBaseUrl.replace(/\/+$/, "")}/workflows/retry`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
        },
        body: JSON.stringify({ workflowRunId: msg.workflowRunId }),
      }
    );

    if (!res.ok) {
      const delay = computeBackoff(msg.attempt, base, cap);
      updated = {
        ...msg,
        status: "QUEUED",
        attempt: msg.attempt + 1,
        nextAttemptAt: delay,
        reason: `HTTP ${res.status}`,
      };
      return updated;
    }

    const data = (await res.json()) as { status: string; reason?: string };

    if (data.status === "CONFIRMED") {
      updated = { ...msg, status: "CONFIRMED", reason: undefined };
    } else if (data.status === "FAILED") {
      const delay = computeBackoff(msg.attempt, base, cap);
      updated = {
        ...msg,
        status: "QUEUED",
        attempt: msg.attempt + 1,
        nextAttemptAt: delay,
        reason: data.reason ?? "Automate failed",
      };
    } else {
      updated = { ...msg, status: "SENT" };
    }

    return updated;
  } catch (err: any) {
    const delay = computeBackoff(msg.attempt, base, cap);
    updated = {
      ...msg,
      status: "QUEUED",
      attempt: msg.attempt + 1,
      nextAttemptAt: delay,
      reason: err?.message ?? "Network error",
    };
    return updated;
  }
}

function computeBackoff(attempt: number, base: number, cap: number): string {
  const delay = Math.min(base * Math.pow(2, attempt), cap); // exponential backoff
  return new Date(Date.now() + delay * 1000).toISOString();
}
