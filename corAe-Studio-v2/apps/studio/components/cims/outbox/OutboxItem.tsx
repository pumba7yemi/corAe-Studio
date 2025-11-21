// Minimal Outbox message card with a Retry button.
// Assumes you will also add handleRetry.ts in the same folder (next step).
// UI-only + single responsibility; no tangents.

import React, { useState } from "react";

export type OutboxStatus = "QUEUED" | "SENT" | "CONFIRMED" | "FAILED";

export interface OutboxMessage {
  id: string;
  workflowRunId: string;
  title: string;              // e.g., "PO #123 → Vendor X"
  status: OutboxStatus;
  attempt: number;
  nextAttemptAt?: string;
  reason?: string;
}

type Props = {
  msg: OutboxMessage;
  onRetry: (msg: OutboxMessage) => Promise<OutboxMessage>; // injected action
};

export default function OutboxItem({ msg, onRetry }: Props) {
  const [local, setLocal] = useState<OutboxMessage>(msg);
  const [busy, setBusy] = useState(false);
  const disabled = busy || local.status === "CONFIRMED";

  async function handleRetryClick() {
    setBusy(true);
    try {
      const updated = await onRetry(local);
      setLocal(updated);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="font-medium">{local.title}</div>
        <div className="text-sm opacity-80">
          Status: <b>{local.status}</b>
          {" · "}Attempt: {local.attempt}
          {local.nextAttemptAt ? (
            <>
              {" · "}Next try: {new Date(local.nextAttemptAt).toLocaleString()}
            </>
          ) : null}
          {local.reason ? (
            <>
              {" · "}Note: <span className="text-red-600">{local.reason}</span>
            </>
          ) : null}
        </div>
      </div>

      <button
        onClick={handleRetryClick}
        disabled={disabled}
        className={`px-3 py-2 rounded-xl text-sm border ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow"
        }`}
        aria-busy={busy}
      >
        {local.status === "CONFIRMED" ? "Confirmed ✅" : busy ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}
