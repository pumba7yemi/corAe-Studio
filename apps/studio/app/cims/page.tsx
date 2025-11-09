// apps/ship/app/cims/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// If your components are at repo /components (root), prefer a relative import
// to avoid alias drift. Adjust if yours differs.
import { SessionUserSwitcher } from "../../../../src/components/cims/SessionUserSwitcher";

/* -------------------- Types -------------------- */
type CIMSDomain = "management" | "hr" | "finance" | "operations" | "marketing";
type OutboxItem = {
  id: string; to: string; subject: string; status: "sent"|"queued"|"failed"; time?: string; domain?: CIMSDomain;
};
type SignalItem = {
  id: string; level: "info"|"warn"|"critical"; source: string; text: string; time?: string; acknowledged?: boolean; domain?: CIMSDomain;
};

type Thread = { id: string; subject: string; unread?: number; lastMessageAt?: string; lastPreview?: string; };
type Message = { id: string; body: string; createdAt: string; author?: "system"|"user"|"vendor"|"automate"; };

/* -------------------- Tabs & Domains -------------------- */
const DOMAINS: (CIMSDomain | "all")[] = ["all","management","hr","finance","operations","marketing"];
type TabKey = "inbox" | "outbox" | "signals";

/* -------------------- tiny fetch helper -------------------- */
async function api<T>(p: string, init?: RequestInit): Promise<T> {
  const r = await fetch(p, init);
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return (await r.json()) as T;
}

/* ============================================================
   PAGE — Ship skin (same vibe as DTD/Pulse)
============================================================ */
export default function CIMS() {
  const router = useRouter();

  // safe client-only param getter to avoid SSR/Prerender useSearchParams issues
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }

  const initialDomain = (getParam("domain") as CIMSDomain | "all") || "all";
  const initialTab = (getParam("tab") as TabKey) || "inbox";
  const initialThreadId = getParam("threadId") || "";

  const [tab, setTab] = useState<TabKey>(initialTab);
  const [domain, setDomain] = useState(initialDomain as CIMSDomain | "all");

  // keep URL in sync (stable markup → no hydration flaps)
  useEffect(() => {
    const params = new URLSearchParams();
    if (domain !== "all") params.set("domain", domain);
    if (tab !== "inbox") params.set("tab", tab);
  const tid = new URLSearchParams(window.location.search).get("threadId");
    if (tab === "inbox" && tid) params.set("threadId", tid);
  (router as any).replace(`/cims${params.toString() ? `?${params.toString()}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, tab]);

  const prettyDomain = useMemo(
    () => (d: CIMSDomain | "all") => (d === "all" ? "All" : d[0].toUpperCase() + d.slice(1)),
    []
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="kicker">CAIA / CIMS</div>
          <h1 className="h1">Communications &amp; Intelligence</h1>
          <p className="muted">WhatsApp-like inbox, outbox and signals — Ship styled.</p>
        </div>
        <SessionUserSwitcher />
      </header>

      {/* Domain Filter */}
      <div className="flex gap-2 flex-wrap">
        {DOMAINS.map((d) => (
          <button
            key={d}
            className={`px-3 py-1 rounded-full border text-sm ${
              domain === d
                ? "bg-sky-500/10 text-sky-200 border-sky-500"
                : "bg-slate-900/40 border-slate-700 text-slate-200 hover:bg-slate-800/60"
            }`}
            onClick={() => setDomain(d)}
          >
            {prettyDomain(d)}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <nav className="flex gap-2" role="tablist" aria-label="CIMS sections">
        <TabButton label="Inbox" isActive={tab === "inbox"} onClick={() => setTab("inbox")} />
        <TabButton label="Outbox" isActive={tab === "outbox"} onClick={() => setTab("outbox")} />
        <TabButton label="Signals" isActive={tab === "signals"} onClick={() => setTab("signals")} />
      </nav>

      {/* Panels */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
        {tab === "inbox" && <InboxWhatsAppPanel initialThreadId={initialThreadId} />}
        {tab === "outbox" && <OutboxPanel domain={domain} />}
        {tab === "signals" && <SignalsPanel domain={domain} />}
      </section>
    </div>
  );
}

/* ============================================================
   COMMON UI
============================================================ */
function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-sm ${
        isActive
          ? "bg-emerald-600 text-white border-emerald-500"
          : "bg-slate-900/40 text-slate-200 border-slate-700 hover:bg-slate-800/60"
      }`}
    >
      {label}
    </button>
  );
}

/* ============================================================
   INBOX — WhatsApp-like Threads + Chat (auto-refresh + auto-scroll)
============================================================ */
function InboxWhatsAppPanel({ initialThreadId }: { initialThreadId: string }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const setThreadParam = useCallback(
    (tid?: string) => {
      const params = new URLSearchParams(window.location.search);
      if (tid) params.set("threadId", tid);
      else params.delete("threadId");
      const s = params.toString();
  (router as any).replace(`/cims${s ? `?${s}` : ""}`);
    },
    [router]
  );

  async function loadThreads() {
    setLoading(true);
    try {
      const d = await api<{ ok: boolean; threads: Thread[] }>("/api/cims/threads");
      if (d?.ok) setThreads(d.threads);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(tid: string) {
    const d = await api<{ ok: boolean; messages: Message[] }>(`/api/cims/messages?threadId=${encodeURIComponent(tid)}`);
    if (d.ok) setMessages(d.messages);
  }

  async function newThread() {
    const d = await api<{ ok: boolean; thread: Thread }>("/api/cims/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "New Thread" }),
    });
    if (d.ok) {
      await loadThreads();
      setActive(d.thread);
      setThreadParam(d.thread.id);
      await loadMessages(d.thread.id);
    }
  }

  async function sendMessage() {
    if (!active || !text.trim()) return;
    await api("/api/cims/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: active.id, body: text, author: "user" }),
    });
    setText("");
    await loadMessages(active.id);
  }

  // bootstrap
  useEffect(() => { loadThreads(); }, []);
  useEffect(() => { if (active?.id) loadMessages(active.id); }, [active?.id]);
  useEffect(() => {
    const tid = initialThreadId;
    if (!tid || !threads.length) return;
    const t = threads.find((x) => x.id === tid);
    if (t) setActive(t);
  }, [initialThreadId, threads]);
  useEffect(() => {
    if (!active?.id) return;
    const t = setInterval(() => loadMessages(active.id), 3000);
    return () => clearInterval(t);
  }, [active?.id]);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const shownThreads = threads.filter((t) => (t.subject || "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="grid grid-cols-12 min-h-[70vh] rounded-xl overflow-hidden border border-slate-700">
      {/* LEFT: thread list */}
      <aside className="col-span-12 md:col-span-4 border-r border-slate-700 bg-slate-900/60">
        <div className="p-3 border-b border-slate-700 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search or start a new thread"
              className="flex-1 border border-slate-600 rounded-full px-3 py-1.5 text-sm bg-slate-800 text-slate-100"
            />
            <button
              className="px-3 py-1.5 rounded-full border border-slate-600 text-sm hover:bg-slate-800"
              title="Refresh"
              onClick={loadThreads}
            >
              🔄
            </button>
            <button
              className="px-3 py-1.5 rounded-full border border-slate-600 text-sm hover:bg-slate-800"
              title="New thread"
              onClick={newThread}
            >
              ➕
            </button>
          </div>
          {loading && <div className="text-xs text-slate-400 mt-1">Loading…</div>}
        </div>

        <ul className="divide-y divide-slate-700">
          {shownThreads.map((t) => (
            <li
              key={t.id}
              onClick={() => { setActive(t); setThreadParam(t.id); }}
              className={`cursor-pointer px-3 py-2 hover:bg-slate-800 transition ${
                active?.id === t.id ? "bg-slate-800/80" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-slate-700 grid place-items-center text-[11px] font-semibold text-slate-200">
                  {t.subject?.slice(0, 2).toUpperCase() || "TH"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate text-slate-100">{t.subject || "Untitled Thread"}</div>
                    {t.unread ? (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                        {t.unread}
                      </span>
                    ) : (
                      <span className="ml-auto text-[10px] text-slate-400">
                        {t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleTimeString() : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{t.lastPreview ?? t.id}</div>
                </div>
              </div>
            </li>
          ))}
          {!shownThreads.length && <li className="px-3 py-3 text-xs text-slate-400">No threads.</li>}
        </ul>
      </aside>

      {/* RIGHT: chat area */}
      <main className="col-span-12 md:col-span-8 bg-slate-900/40">
        <div className="border-b border-slate-700 p-3 bg-slate-900/60">
          <h2 className="font-semibold text-slate-100">{active?.subject || "Select a thread"}</h2>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-2">
          {!active && <div className="text-sm text-slate-400">No thread selected.</div>}

          {messages.map((m) => {
            const mine = m.author === "user";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                <div
                  className={[
                    "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm",
                    mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-sm",
                  ].join(" ")}
                >
                  <div className="text-[13px] leading-5 whitespace-pre-wrap">{m.body}</div>
                  <div className={`mt-1 text-[10px] ${mine ? "text-emerald-50/90" : "text-slate-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}

          {active && messages.length === 0 && (
            <div className="text-xs text-slate-400">No messages yet in this thread.</div>
          )}
        </div>

        <div className="p-3 border-t border-slate-700 bg-slate-900/60">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message"
              className="flex-1 border border-slate-600 rounded-full px-4 py-2 bg-slate-800 text-slate-100"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
              }}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full"
              disabled={!active || !text.trim()}
              title={!active ? "Select a thread first" : "Send"}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   OUTBOX (domain-filtered, retry)
============================================================ */
function OutboxPanel({ domain }: { domain: CIMSDomain | "all" }) {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const reload = () =>
    fetch(`/api/cims/outbox${domain === "all" ? "" : `?domain=${domain}`}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  useEffect(() => { reload(); const t = setInterval(reload, 3000); return () => clearInterval(t); }, [domain]);

  const retry = async (id: string) => {
    await fetch("/api/cims/outbox/retry", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    setTimeout(reload, 900);
  };

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Outbox</h2>
      {items.length === 0 ? (
        <p className="muted">Outbox is empty.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={m.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-100">{m.to}</span>
                <StatusBadge status={m.status} />
                {m.domain && <span className="text-xs px-2 py-0.5 rounded-full border border-slate-600 text-slate-300">{m.domain}</span>}
                <span className="text-xs text-slate-400 ml-auto">{m.time}</span>
              </div>
              <div className="mt-1 text-slate-200">{m.subject}</div>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 rounded-lg border border-slate-600 hover:bg-slate-800/60">View</button>
                {m.status === "failed" && (
                  <button className="px-3 py-1 rounded-lg border border-slate-600 hover:bg-slate-800/60" onClick={() => retry(m.id)}>
                    Retry
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
   SIGNALS (domain-filtered, acknowledge)
============================================================ */
function SignalsPanel({ domain }: { domain: CIMSDomain | "all" }) {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const reload = () =>
    fetch(`/api/cims/signals${domain === "all" ? "" : `?domain=${domain}`}`)
      .then((r) => r.json())
      .then((d) => setSignals(d.items ?? []));
  useEffect(() => { reload(); const t = setInterval(reload, 3000); return () => clearInterval(t); }, [domain]);

  const ack = async (id: string) => {
    await fetch("/api/cims/signals/ack", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    reload();
  };

  return (
    <div>
      <h2 className="text-base font-semibold mb-3">Signals</h2>
      {signals.length === 0 ? (
        <p className="muted">No signals yet.</p>
      ) : (
        <ul className="space-y-2">
          {signals.map((s) => (
            <li
              key={s.id}
              className={`rounded-xl p-3 border ${
                s.level === "critical" ? "border-rose-300" : s.level === "warn" ? "border-amber-300" : "border-slate-700"
              } bg-slate-900/60`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-100">{s.source}</span>
                <LevelBadge level={s.level} />
                {s.domain && <span className="text-xs px-2 py-0.5 rounded-full border border-slate-600 text-slate-300">{s.domain}</span>}
                <span className="text-xs text-slate-400 ml-auto">{s.time}</span>
              </div>
              <div className="mt-1 text-slate-200">{s.text}</div>
              <div className="mt-2">
                <button
                  className="px-3 py-1 rounded-lg border border-slate-600 hover:bg-slate-800/60 disabled:opacity-60"
                  onClick={() => ack(s.id)}
                  disabled={s.acknowledged}
                >
                  {s.acknowledged ? "Acknowledged" : "Acknowledge"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
   SHARED BADGES
============================================================ */
function StatusBadge({ status }: { status: "sent" | "queued" | "failed" }) {
  const label = status === "sent" ? "Sent" : status === "queued" ? "Queued" : "Failed";
  const tone =
    status === "sent" ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" :
    status === "queued" ? "bg-amber-500/20 text-amber-200 border-amber-500/40" :
    "bg-rose-500/20 text-rose-200 border-rose-500/40";
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${tone}`}>{label}</span>;
}

function LevelBadge({ level }: { level: "info" | "warn" | "critical" }) {
  const label = level === "info" ? "Info" : level === "warn" ? "Warning" : "Critical";
  const tone =
    level === "info" ? "bg-sky-500/20 text-sky-200 border-sky-500/40" :
    level === "warn" ? "bg-amber-500/20 text-amber-200 border-amber-500/40" :
    "bg-rose-500/20 text-rose-200 border-rose-500/40";
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${tone}`}>{label}</span>;
}