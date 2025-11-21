import React from "react";

export type InboxItem = {
  id?: string;
  from?: string;
  subject?: string;
  channel?: string;
  time?: string;
  hint?: string;
  type?: "automate" | "vendor" | "customer" | "system";
  status?: "new" | "approved" | "escalated" | "archived";
};

export default function InboxPanel({ items }: { items: InboxItem[] }) {
  const fallback: InboxItem[] = [
    {
      id: "in-1",
      from: "System • Automate",
      subject: "Approval requested: PO #A102 (Vendor: Demo Partner)",
      time: "09:12",
      hint: "Requires Owner or Admin",
      type: "automate",
      status: "new",
    },
    {
      id: "in-2",
      from: "Customer",
      subject: "Inquiry: Product availability for weekend",
      time: "08:41",
      type: "customer",
    },
    {
      id: "in-3",
      from: "CAIA",
      subject: "Daily check: +1% market beat maintained",
      time: "07:00",
      type: "system",
    },
  ];
  const feed = items.length ? items : fallback;

  type Priority = "critical" | "action" | "fyi";
  function score(item: InboxItem): { level: Priority; score: number; reason: string } {
    const text = `${item.subject ?? ""} ${item.hint ?? ""}`.toLowerCase();
    let s = 0;
    let reason = "General";

    if (item.type === "automate") s += 2;
    if (item.type === "vendor") s += 1;
    if (item.type === "customer") s += 1;

    if (/\bapprove|approval|confirm|deadline|overdue|block(ed|er)?\b/.test(text)) {
      s += 2;
      reason = "Approval/Deadline";
    }
    if (/\bescalate|issue|failed|error\b/.test(text)) {
      s += 3;
      reason = "Failure/Escalation";
    }
    if (/\bdaily|summary|update|check\b/.test(text)) {
      reason = "FYI";
    }
    if (item.status === "new") s += 1;

    const level: Priority = s >= 4 ? "critical" : s >= 2 ? "action" : "fyi";
    return { level, score: s, reason };
  }

  const enriched = feed
    .map((m) => ({ ...m, _prio: score(m) }))
    .sort((a, b) => b._prio.score - a._prio.score);

  const toneFor: Record<Priority, string> = {
    critical: "border-rose-300/70 bg-rose-50/70 [&_.subject]:text-rose-900",
    action: "border-amber-300/70 bg-amber-50/70 [&_.subject]:text-amber-900",
    fyi: "border-slate-200 bg-white hover:bg-slate-50",
  };
  const badgeFor: Record<Priority, string> = {
    critical: "bg-rose-100 text-rose-800 border-rose-200",
    action: "bg-amber-100 text-amber-900 border-amber-200",
    fyi: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const labelFor: Record<Priority, string> = {
    critical: "Critical",
    action: "Action",
    fyi: "FYI",
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Inbox</h2>
        <div className="hidden sm:flex gap-2 items-center text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded-full border bg-rose-100 border-rose-200 text-rose-800">Critical</span>
          <span className="px-2 py-0.5 rounded-full border bg-amber-100 border-amber-200 text-amber-900">Action</span>
          <span className="px-2 py-0.5 rounded-full border bg-slate-100 border-slate-200 text-slate-700">FYI</span>
        </div>
      </div>

      <ul className="grid gap-4">
        {enriched.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border shadow-sm backdrop-blur-sm p-4 transition ${toneFor[m._prio.level]}`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 border ${badgeFor[m._prio.level]}`}>
                {labelFor[m._prio.level]}
              </span>
              <span className="text-sm font-medium text-slate-900">{m.from}</span>
              {m.type && <Pill tone={m.type} />}
              <div className="ml-auto flex items-center gap-2">
                {m.status === "new" && (
                  <span className="h-2 w-2 rounded-full bg-slate-900 inline-block" aria-label="unread" />
                )}
                <span className="text-xs text-slate-500">{m.time}</span>
              </div>
            </div>

            <div className="mt-2 subject text-[15px] leading-6 font-semibold">{m.subject}</div>
            <div className="mt-1 text-xs text-slate-500">
              {m.hint ? m.hint : `Priority: ${labelFor[m._prio.level]} • ${m._prio.reason}`}
            </div>

            <div className="mt-3 flex gap-2">
              {m._prio.level !== "fyi" ? (
                <>
                  <PrimaryButton>Open</PrimaryButton>
                  <PrimaryButton>Approve</PrimaryButton>
                  <GhostButton>Escalate</GhostButton>
                </>
              ) : (
                <>
                  <GhostButton>Open</GhostButton>
                  <GhostButton>Acknowledge</GhostButton>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- primitives ---------- */
function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm hover:bg-slate-100 transition">
      {children}
    </button>
  );
}
function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-3 py-1.5 rounded-xl text-sm text-white bg-slate-900 hover:bg-slate-800 transition">
      {children}
    </button>
  );
}
function Pill({ tone }: { tone: "automate" | "vendor" | "customer" | "system" }) {
  const map: Record<string, string> = {
    automate: "bg-sky-50 text-sky-700 border-sky-200",
    vendor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    customer: "bg-amber-50 text-amber-800 border-amber-200",
    system: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const label =
    tone === "automate" ? "Automate" : tone === "vendor" ? "Vendor" : tone === "customer" ? "Customer" : "System";
  return (
    <span className={`text-xs font-medium rounded-full px-2 py-0.5 border ${map[tone] ?? ""}`}>
      {label}
    </span>
  );
}
