/**
 * A1 — Outbox Retry Handler (single-file, drop-in)
 * Purpose: Close the loop CIMS ↔ Automate so "Retry" actually re-invokes the workflow.
 *
 * ✅ Acceptance Tests this file enables:
 * AT-1: Pressing Retry flips status QUEUED → SENT.
 * AT-2: On success, status becomes CONFIRMED and a ✅ signal is emitted.
 * AT-3: If Automate is down, status stays QUEUED, attempt++, nextAttemptAt set (backoff).
 */

export type OutboxStatus = "QUEUED" | "SENT" | "CONFIRMED" | "FAILED";

export interface OutboxMessage {
  id: string;
  workflowRunId: string;
  status: OutboxStatus;
  attempt: number;            // how many attempts have been made already
  nextAttemptAt?: string;     // ISO timestamp
  dedupeKey?: string;         // optional idempotency key
  reason?: string;            // last failure reason (human-readable)
}

export interface AutomateRetryResponse {
  status: "SENT" | "CONFIRMED" | "FAILED";
  reason?: string;
}

export interface RetryAuditEntry {
  messageId: string;
  workflowRunId: string;
  attempt: number;
  at: string;                 // ISO
  outcome: "SENT" | "CONFIRMED" | "FAILED" | "ERROR";
  reason?: string;
  httpStatus?: number;
}

export interface HandleRetryOptions {
  automateBaseUrl: string;                      // e.g. https://api.corae.local/automate
  token?: string | (() => string | Promise<string>);
  fetchImpl?: typeof fetch;                     // for testing / custom runtimes
  maxAttempts?: number;                         // default 6
  backoffSecondsBase?: number;                  // default 15s
  backoffSecondsCap?: number;                   // default 600s (10m)

  // Host app integration points (wire these to your store / bus)
  onStatusChange: (id: string, patch: Partial<OutboxMessage>) => Promise<void> | void;
  onAudit?: (entry: RetryAuditEntry) => Promise<void> | void;
  onSignal?: (signal: { messageId: string; type: "CONFIRMED" | "FAILED" | "SENT"; reason?: string }) => Promise<void> | void;
}

function nowIso() {
  return new Date().toISOString();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeNextAttemptAt(attemptAlreadyMade: number, base: number, cap: number) {
  // attemptAlreadyMade is current attempt count; next delay grows with next attempt
  const nextAttemptIndex = attemptAlreadyMade + 1;
  const delay = clamp(base * Math.pow(2, nextAttemptIndex - 1), base, cap); // 15s, 30s, 60s, 120s, 240s, 480s...
  return new Date(Date.now() + delay * 1000).toISOString();
}

async function getToken(token: HandleRetryOptions["token"]): Promise<string | undefined> {
  if (!token) return undefined;
  if (typeof token === "string") return token;
  const t = token();
  return t instanceof Promise ? await t : t;
}

function mapAutomateToOutboxStatus(resp: AutomateRetryResponse): OutboxStatus {
  switch (resp.status) {
    case "SENT":
      return "SENT";
    case "CONFIRMED":
      return "CONFIRMED";
    case "FAILED":
    default:
      return "FAILED";
  }
}

function safeJson<T>(x: unknown, fallback: T): T {
  try {
    return x as T;
  } catch {
    return fallback;
  }
}

export async function handleRetry(
  msg: OutboxMessage,
  opts: HandleRetryOptions
): Promise<OutboxMessage> {
  const fetcher = opts.fetchImpl ?? fetch;
  const maxAttempts = opts.maxAttempts ?? 6;
  const base = opts.backoffSecondsBase ?? 15;
  const cap = opts.backoffSecondsCap ?? 600;

  // Guard: if we've exhausted attempts, don't hammer Automate
  if (msg.attempt >= maxAttempts && msg.status !== "CONFIRMED") {
    const exhausted: Partial<OutboxMessage> = {
      status: "FAILED",
      reason: `Max attempts (${maxAttempts}) reached`,
      nextAttemptAt: undefined
    };
    await opts.onStatusChange(msg.id, exhausted);
    await opts.onAudit?.({
      messageId: msg.id,
      workflowRunId: msg.workflowRunId,
      attempt: msg.attempt,
      at: nowIso(),
      outcome: "FAILED",
      reason: exhausted.reason
    });
    await opts.onSignal?.({ messageId: msg.id, type: "FAILED", reason: exhausted.reason });
    return { ...msg, ...exhausted } as OutboxMessage;
  }

  // Optimistically mark as SENT while we call Automate
  await opts.onStatusChange(msg.id, { status: "SENT" });

  const dedupeKey = msg.dedupeKey ?? `${msg.workflowRunId}:${msg.attempt + 1}`;
  const token = await getToken(opts.token);

  let httpStatus: number | undefined;
  try {
    const res = await fetcher(`${opts.automateBaseUrl.replace(/\/+$/, "")}/workflows/retry`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        workflowRunId: msg.workflowRunId,
        dedupeKey
      })
    });

    httpStatus = res.status;

    if (!res.ok) {
      // Treat non-2xx as transient failure: back off, keep QUEUED
      const reason = `HTTP ${res.status}`;
      const nextAttemptAt = computeNextAttemptAt(msg.attempt, base, cap);
      const patch: Partial<OutboxMessage> = {
        status: "QUEUED",
        attempt: msg.attempt + 1,
        nextAttemptAt,
        reason
      };
      await opts.onStatusChange(msg.id, patch);
      await opts.onAudit?.({
        messageId: msg.id,
        workflowRunId: msg.workflowRunId,
        attempt: msg.attempt + 1,
        at: nowIso(),
        outcome: "ERROR",
        reason,
        httpStatus
      });
      await opts.onSignal?.({ messageId: msg.id, type: "FAILED", reason });
      return { ...msg, ...patch } as OutboxMessage;
    }

    const data = (await res.json()) as AutomateRetryResponse;
    const mapped = mapAutomateToOutboxStatus(safeJson<AutomateRetryResponse>(data, { status: "FAILED" }));

    if (mapped === "CONFIRMED") {
      const patch: Partial<OutboxMessage> = {
        status: "CONFIRMED",
        attempt: msg.attempt, // no increment on success
        nextAttemptAt: undefined,
        reason: undefined,
        dedupeKey
      };
      await opts.onStatusChange(msg.id, patch);
      await opts.onAudit?.({
        messageId: msg.id,
        workflowRunId: msg.workflowRunId,
        attempt: msg.attempt,
        at: nowIso(),
        outcome: "CONFIRMED"
      });
      await opts.onSignal?.({ messageId: msg.id, type: "CONFIRMED" });
      return { ...msg, ...patch } as OutboxMessage;
    }

    if (mapped === "SENT") {
      // Keep SENT, await external confirmation later
      const patch: Partial<OutboxMessage> = {
        status: "SENT",
        attempt: msg.attempt,
        nextAttemptAt: undefined,
        reason: undefined,
        dedupeKey
      };
      await opts.onStatusChange(msg.id, patch);
      await opts.onAudit?.({
        messageId: msg.id,
        workflowRunId: msg.workflowRunId,
        attempt: msg.attempt,
        at: nowIso(),
        outcome: "SENT"
      });
      await opts.onSignal?.({ messageId: msg.id, type: "SENT" });
      return { ...msg, ...patch } as OutboxMessage;
    }

    // mapped === "FAILED"
    {
      const nextAttemptAt = computeNextAttemptAt(msg.attempt, base, cap);
      const reason = data.reason ?? "Automate returned FAILED";
      const patch: Partial<OutboxMessage> = {
        status: "QUEUED",
        attempt: msg.attempt + 1,
        nextAttemptAt,
        reason,
        dedupeKey
      };
      await opts.onStatusChange(msg.id, patch);
      await opts.onAudit?.({
        messageId: msg.id,
        workflowRunId: msg.workflowRunId,
        attempt: msg.attempt + 1,
        at: nowIso(),
        outcome: "FAILED",
        reason
      });
      await opts.onSignal?.({ messageId: msg.id, type: "FAILED", reason });
      return { ...msg, ...patch } as OutboxMessage;
    }
  } catch (err: any) {
    // Network/exception path → back off and queue
    const reason = err?.message ?? "Network error";
    const nextAttemptAt = computeNextAttemptAt(msg.attempt, base, cap);
    const patch: Partial<OutboxMessage> = {
      status: "QUEUED",
      attempt: msg.attempt + 1,
      nextAttemptAt,
      reason
    };
    await opts.onStatusChange(msg.id, patch);
    await opts.onAudit?.({
      messageId: msg.id,
      workflowRunId: msg.workflowRunId,
      attempt: msg.attempt + 1,
      at: nowIso(),
      outcome: "ERROR",
      reason
    });
    await opts.onSignal?.({ messageId: msg.id, type: "FAILED", reason });
    return { ...msg, ...patch } as OutboxMessage;
  }
}

/**
 * Example usage (in your UI/handler):
 *
 * await handleRetry(outboxMsg, {
 *   automateBaseUrl: process.env.NEXT_PUBLIC_AUTOMATE_URL!,
 *   token: () => authStore.getToken(), // optional
 *   onStatusChange: (id, patch) => outboxStore.update(id, patch),
 *   onAudit: (entry) => auditLog.append(entry),
 *   onSignal: (s) => cimsBus.emit("outbox.signal", s),
 *   maxAttempts: 6,
 *   backoffSecondsBase: 15,
 *   backoffSecondsCap: 600
 * });
 */