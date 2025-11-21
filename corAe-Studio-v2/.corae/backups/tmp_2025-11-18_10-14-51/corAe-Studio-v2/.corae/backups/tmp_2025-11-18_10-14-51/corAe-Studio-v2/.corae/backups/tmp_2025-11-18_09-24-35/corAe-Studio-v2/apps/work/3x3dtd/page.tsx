"use client";

import React, { useEffect, useMemo, useState } from "react";

type Trio = { id: string; title: string; note?: string };
type ThreeByThree = {
  dateISO: string;
  priority: Trio[];
  ongoing: Trio[];
  inbox: Trio[];
};

type ApiPreview = {
  ok: boolean;
  subject: string;
  text: string;
  html: string;
  data: ThreeByThree;
};

function newTrio(): Trio {
  // crypto is available in modern browsers; fallback to Date.now for older envs
  const id =
    (typeof crypto !== "undefined" && "randomUUID" in crypto && (crypto as any).randomUUID()) ||
    `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { id, title: "" };
}

function clamp3(list: Trio[]) {
  return (list || []).slice(0, 3);
}

export default function Page3x3DTD() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateISO, setDateISO] = useState<string>(new Date().toISOString());
  const [priority, setPriority] = useState<Trio[]>([newTrio(), newTrio(), newTrio()]);
  const [ongoing, setOngoing] = useState<Trio[]>([newTrio(), newTrio(), newTrio()]);
  const [inbox, setInbox] = useState<Trio[]>([newTrio(), newTrio(), newTrio()]);

  const [toEmail, setToEmail] = useState<string>("");
  const [preview, setPreview] = useState<ApiPreview | null>(null);

  // load initial from API
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/email/3x3dtd", { cache: "no-store" });
        const json = (await res.json()) as ApiPreview;
        if (json?.data) {
          const d = json.data;
          setDateISO(d.dateISO ?? new Date().toISOString());
          setPriority(fillTo3(d.priority));
          setOngoing(fillTo3(d.ongoing));
          setInbox(fillTo3(d.inbox));
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load 3×3×3.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const payload: ThreeByThree = useMemo(
    () => ({
      dateISO,
      priority: clamp3(priority).map(sanitize),
      ongoing: clamp3(ongoing).map(sanitize),
      inbox: clamp3(inbox).map(sanitize),
    }),
    [dateISO, priority, ongoing, inbox]
  );

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/email/3x3dtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", data: payload }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Save failed");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onPreview() {
    setPreviewing(true);
    setError(null);
    try {
      // ensure latest state saved before preview (idempotent)
      await fetch("/api/email/3x3dtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", data: payload }),
      });
      const res = await fetch("/api/email/3x3dtd", { cache: "no-store" });
      const json = (await res.json()) as ApiPreview;
      setPreview(json);
    } catch (e: any) {
      setError(e?.message || "Preview failed");
    } finally {
      setPreviewing(false);
    }
  }

  async function onSend() {
    setSending(true);
    setError(null);
    try {
      // ensure latest state saved before send (idempotent)
      await fetch("/api/email/3x3dtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", data: payload }),
      });
      const res = await fetch("/api/email/3x3dtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", to: toEmail || undefined }),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Send failed");
      // surface DRY-RUN vs SENT in preview box if present
      setPreview((p) => (p ? { ...p, subject: json.subject ?? p.subject } : p));
      alert(json?.dryRun ? "Email DRY-RUN (no SMTP configured)." : `Email sent to ${json?.to || toEmail}.`);
    } catch (e: any) {
      setError(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  function upList(kind: "priority" | "ongoing" | "inbox", updater: (rows: Trio[]) => Trio[]) {
    const set = kind === "priority" ? setPriority : kind === "ongoing" ? setOngoing : setInbox;
    const cur = kind === "priority" ? priority : kind === "ongoing" ? ongoing : inbox;
    set(clamp3(updater(cur)));
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">3×3×3 Daily — Work</h1>
        <p className="text-sm opacity-75">
          Edit today’s three lists, save, preview the email, and send. This feeds the OBARI daily loop.
        </p>
      </header>

      {/* Date */}
      <div className="flex items-center gap-3">
        <label className="text-sm w-24">Date</label>
        <input
          type="date"
          className="border rounded px-3 py-2 text-sm w-52"
          value={dateISO.slice(0, 10)}
          onChange={(e) => setDateISO(new Date(e.target.value).toISOString())}
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ListEditor
          title="Top 3 Priority"
          rows={priority}
          onChange={(rows) => setPriority(fillTo3(rows))}
          up={(fn) => upList("priority", fn)}
        />
        <ListEditor
          title="3 Ongoing"
          rows={ongoing}
          onChange={(rows) => setOngoing(fillTo3(rows))}
          up={(fn) => upList("ongoing", fn)}
        />
        <ListEditor
          title="3 Inbox"
          rows={inbox}
          onChange={(rows) => setInbox(fillTo3(rows))}
          up={(fn) => upList("inbox", fn)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving || loading}
          className="px-4 py-2 rounded-xl border text-sm hover:bg-black/5 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          onClick={onPreview}
          disabled={previewing || loading}
          className="px-4 py-2 rounded-xl border text-sm hover:bg-black/5 disabled:opacity-50"
        >
          {previewing ? "Previewing…" : "Preview Email"}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="email"
            placeholder="to@example.com (optional)"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-64"
          />
          <button
            onClick={onSend}
            disabled={sending || loading}
            className="px-4 py-2 rounded-xl border text-sm hover:bg-black/5 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>

      {/* Preview pane */}
      {preview && (
        <section className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm opacity-75">Subject</div>
          <div className="text-base">{preview.subject}</div>
          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm">Text version</summary>
            <pre className="whitespace-pre-wrap text-sm mt-2">{preview.text}</pre>
          </details>
          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm">HTML preview (raw)</summary>
            <div className="text-xs mt-2 opacity-70">Open the email client for full rendering. Raw HTML shown below:</div>
            <pre className="whitespace-pre-wrap text-xs mt-2">{preview.html}</pre>
          </details>
        </section>
      )}

      {error && (
        <div className="text-sm text-red-600 border border-red-200 rounded-lg p-3 bg-red-50">
          {error}
        </div>
      )}

      {/* Tiny footer note */}
      <p className="text-xs opacity-60">
        3³DTD is stored in CAIA ship memory (or safe in-memory fallback). SMTP env makes “Send” live; otherwise it’s a DRY-RUN.
      </p>
    </main>
  );
}

function ListEditor({
  title,
  rows,
  onChange,
  up,
}: {
  title: string;
  rows: Trio[];
  onChange: (rows: Trio[]) => void;
  up: (fn: (rows: Trio[]) => Trio[]) => void;
}) {
  return (
    <section className="rounded-2xl border p-4 space-y-3">
      <h3 className="font-medium">{title}</h3>
      <div className="space-y-2">
        {rows.slice(0, 3).map((row, idx) => (
          <div className="space-y-1" key={row.id}>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-60 w-4">{idx + 1}.</span>
              <input
                className="border rounded px-2 py-1 text-sm w-full"
                placeholder="Title"
                value={row.title}
                onChange={(e) => {
                  const next = rows.slice();
                  next[idx] = { ...next[idx], title: e.target.value };
                  onChange(next);
                }}
              />
            </div>
            <input
              className="border rounded px-2 py-1 text-xs w-full"
              placeholder="Note (optional)"
              value={row.note ?? ""}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], note: e.target.value || undefined };
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => up((r) => clamp3([...r, newTrio()]))}
          disabled={rows.length >= 3}
          className="px-3 py-1.5 rounded-lg border text-xs hover:bg-black/5 disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => up((r) => clamp3(r.slice(0, Math.max(0, r.length - 1))))}
          disabled={rows.length <= 1}
          className="px-3 py-1.5 rounded-lg border text-xs hover:bg-black/5 disabled:opacity-50"
        >
          Remove
        </button>
        <div className="ml-auto text-xs opacity-60">{rows.length}/3</div>
      </div>
    </section>
  );
}

function fillTo3(list?: Trio[]) {
  const out = clamp3(list || []);
  while (out.length < 3) out.push(newTrio());
  return out;
}
function sanitize(t: Trio): Trio {
  return { id: String(t.id || ""), title: String(t.title || ""), note: t.note ? String(t.note) : undefined };
}
