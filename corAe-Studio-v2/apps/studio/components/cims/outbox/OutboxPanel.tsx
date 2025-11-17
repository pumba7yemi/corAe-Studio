import React, { useState } from "react";
import { handleRetry, HandleRetryOptions } from "./handleRetry";

type OutboxStatus = "QUEUED" | "SENT" | "CONFIRMED" | "FAILED";

type OutboxMessage = {
  id: string;
  workflowRunId: string;
  title: string;
  status: OutboxStatus;
  attempt: number;
  nextAttemptAt?: string;
  reason?: string;
};

export default function OutboxPanel() {
  // Demo seed — swap to your store later
  const [messages, setMessages] = useState<OutboxMessage[]>([
    {
      id: "out-1",
      workflowRunId: "wf-1001",
      title: "PO #1001 → Vendor A",
      status: "FAILED",
      attempt: 2,
      reason: "Network timeout",
    },
    {
      id: "out-2",
      workflowRunId: "wf-1002",
      title: "Shelf price update → Ops",
      status: "QUEUED",
      attempt: 0,
    },
    {
      id: "out-3",
      workflowRunId: "wf-1003",
      title: "Order confirmation → Customer",
      status: "SENT",
      attempt: 1,
    },
  ]);

  const [busyId, setBusyId] = useState<string | null>(null);

  const opts: HandleRetryOptions = {
    automateBaseUrl:
      process.env.NEXT_PUBLIC_AUTOMATE_URL || "http://localhost:4000/automate",
    // token: "<optional bearer>",
    // fetchImpl: customFetch, // optional for testing
    maxAttempts: 6,
    backoffSecondsBase: 15,
    backoffSecondsCap: 600,
  };

  function priorityOf(s: OutboxStatus) {
    // failed > queued > sent > confirmed (confirmed sinks to bottom)
    return s === "FAILED" ? 3 : s === "QUEUED" ? 2 : s === "SENT" ? 1 : 0;
  }

  const sorted = [...messages].sort(
    (a, b) => priorityOf(b.status) - priorityOf(a.status)
  );

  async function onRetry(m: OutboxMessage) {
    setBusyId(m.id);
    try {
      const updated = await handleRetry(m, opts);
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, ...updated } : x))
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Outbox</h2>
        <div className="hidden sm:flex gap-2 items-center text-xs text-slate-500">
          <Chip className="bg-rose-100 text-rose-800 border-rose-200">Critical (Failed)</Chip>
          <Chip className="bg-amber-100 text-amber-900 border-amber-200">Action (Queued)</Chip>
          <Chip className="bg-slate-100 text-slate-700 border-slate-200">FYI (Sent/Confirmed)</Chip>
        </div>
      </div>

      <ul className="grid gap-4">
        {sorted.map((m) => {
          const prio =
            m.status === "FAILED"
              ? ("critical" as const)
              : m.status === "QUEUED"
              ? ("action" as const)
              : ("fyi" as const);

          const tone =
            prio === "critical"
              ? "border-rose-300/70 bg-rose-50/70 [&_.subject]:text-rose-900"
              : prio === "action"
              ? "border-amber-300/70 bg-amber-50/70 [&_.subject]:text-amber-900"
              : "border-slate-200 bg-white hover:bg-slate-50";

          const chipTone =
            prio === "critical"
              ? "bg-rose-100 text-rose-800 border-rose-200"
              : prio === "action"
              ? "bg-amber-100 text-amber-900 border-amber-200"
              : "bg-slate-100 text-slate-700 border-slate-200";

          const disabled = busyId === m.id || m.status === "CONFIRMED";

          return (
            <li
              key={m.id}
              className={`rounded-2xl border shadow-sm backdrop-blur-sm p-4 transition ${tone}`}
            >
              {/* header */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-medium rounded-full px-2 py-0.5 border ${chipTone}`}
                >
                  {prio === "critical" ? "Critical" : prio === "action" ? "Action" : "FYI"}
                </span>
                <span className="text-sm font-medium text-slate-900">{m.title}</span>
                <StatusBadge status={m.status} />
                <span className="text-xs text-slate-500 ml-auto">
                  {m.nextAttemptAt
                    ? `Next try: ${new Date(m.nextAttemptAt).toLocaleString()}`
                    : ""}
                </span>
              </div>

              {/* reason */}
              {m.reason && (
                <div className="mt-1 text-xs text-slate-500">Note: {m.reason}</div>
              )}

              {/* actions */}
              <div className="mt-3 flex gap-2">
                {m.status === "FAILED" ? (
                  <>
                    <PrimaryButton
                      disabled={disabled}
                      onClick={() => onRetry(m)}
                      aria-busy={busyId === m.id}
                    >
                      {busyId === m.id ? "Retrying…" : "Retry"}
                    </PrimaryButton>
                    <GhostButton>View</GhostButton>
                  </>
                ) : m.status === "QUEUED" ? (
                  <>
                    <PrimaryButton
                      disabled={disabled}
                      onClick={() => onRetry(m)}
                      aria-busy={busyId === m.id}
                    >
                      {busyId === m.id ? "Sending…" : "Send Now"}
                    </PrimaryButton>
                    <GhostButton>View</GhostButton>
                  </>
                ) : (
                  <>
                    <GhostButton disabled={disabled}>View</GhostButton>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ——— tiny UI primitives ——— */
function Chip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[11px] font-medium rounded-full px-2 py-0.5 border ${className}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: OutboxStatus }) {
  const label =
    status === "SENT" ? "Sent" : status === "QUEUED" ? "Queued" : status === "FAILED" ? "Failed" : "Confirmed";
  const tone =
    status === "SENT"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "QUEUED"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : status === "FAILED"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`text-xs font-medium rounded-full px-2 py-0.5 border ${tone}`}>
      {label}
    </span>
  );
}

function GhostButton({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-xl border border-slate-200 text-sm transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-xl text-sm text-white bg-slate-900 transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}
