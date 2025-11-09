"use client";

import React, { useEffect, useState } from "react";
import InboxPanel from "./inbox/InboxPanel";
import OutboxPanel from "./outbox/OutboxPanel";
import SignalsPanel from "./signals/SignalsPanel";

/* ---------- types ---------- */
type InboxItem = {
  id?: string;
  from?: string;
  subject?: string;
  channel?: string;
  time?: string;
  hint?: string;
  type?: "automate" | "vendor" | "customer" | "system";
  status?: "new" | "approved" | "escalated" | "archived";
};
type TabKey = "inbox" | "outbox" | "signals";

/* ---------- CIMS Shell ---------- */
export default function CIMS() {
  const [tab, setTab] = useState<TabKey>("inbox");
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadInbox() {
    setLoading(true);
    try {
      const r = await fetch("/api/caia/inbox");
      const j = await r.json().catch(() => null);
      const items: InboxItem[] =
        j?.ok && Array.isArray(j.items)
          ? j.items.map((m: any, i: number) => ({
              id: m.id ?? `i${i + 1}`,
              from: m.from ?? "Unknown",
              subject: m.subject ?? "—",
              channel: m.channel ?? "Email",
              time: m.time ?? "",
              type: (m.type as InboxItem["type"]) ?? "vendor",
              status: (m.status as InboxItem["status"]) ?? "new",
            }))
          : [];
      setInbox(items);
    } finally {
      setLoading(false);
    }
  }

  async function sendDailyBrief() {
    try {
      const r = await fetch("/api/caia/tick", { method: "POST" });
      const j = await r.json();
      alert(j.ok ? `Daily brief sent (${j.sent})` : j.error || "Failed");
    } catch {
      alert("Failed to send daily brief");
    }
  }

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <div className="min-h-[80vh] px-6 py-8">
      {/* Top bar */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-600 text-white grid place-items-center shadow-sm">
            <span className="text-xs font-semibold tracking-tight">cA</span>
          </div>
          <h1 className="text-[28px] leading-8 font-semibold tracking-tight">CIMS</h1>
          <div className="ml-auto flex gap-2">
            <button
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition"
              onClick={loadInbox}
            >
              🔄 Refresh
            </button>
            <button
              className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition"
              onClick={sendDailyBrief}
            >
              ✉️ Daily Brief
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Communications &amp; Intelligence Management System.
        </p>
        {loading && <div className="text-xs text-slate-500 mt-1">Loading…</div>}
      </header>

      {/* Tabs */}
      <nav
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 p-1 bg-white shadow-sm"
        role="tablist"
        aria-label="CIMS sections"
      >
        <TabButton label="Inbox" isActive={tab === "inbox"} onClick={() => setTab("inbox")} />
        <TabButton label="Outbox" isActive={tab === "outbox"} onClick={() => setTab("outbox")} />
        <TabButton label="Signals" isActive={tab === "signals"} onClick={() => setTab("signals")} />
      </nav>

      {/* Panels */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="p-5">
          {tab === "inbox" && <InboxPanel items={inbox} />}
          {tab === "outbox" && <OutboxPanel />}
          {tab === "signals" && <SignalsPanel />}
        </div>
      </section>

      {/* Providers */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="p-5">
          <h3 className="text-base font-medium tracking-tight">Comms Console</h3>
          <div className="text-sm text-slate-500 mb-1 mt-1">Providers</div>
          <p className="text-sm text-slate-500">
            (Wire providers later: email, WhatsApp, social, internal.)
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---------- small UI primitive ---------- */
function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={[
        "px-4 py-1.5 rounded-full text-sm transition",
        isActive
          ? "bg-slate-900 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]"
          : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
