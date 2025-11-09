"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SLAForm = {
  acceptanceWindowHours: number;
  escalateTo: string; // comma-separated roles
};

export default function SLAEscalationPage() {
  const router = useRouter();
  // safe client-only param getter
  function getParam(key: string): string | null {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get(key);
  }
  const dealId = getParam("dealId") || "";
  const [form, setForm] = useState<SLAForm>({ acceptanceWindowHours: 24, escalateTo: "Manager" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!dealId) setMsg("Missing dealId");
  }, [dealId]);

  async function saveAndBind() {
    if (!dealId) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/oms/obari/thedeal/sla/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          sla: {
            acceptanceWindowHours: Math.max(1, Number(form.acceptanceWindowHours) || 24),
            escalateTo: form.escalateTo.split(",").map(x => x.trim()).filter(Boolean),
          },
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Bind failed");
  (router as any).replace(j.next || `/ship/business/oms/obari/active?dealId=${dealId}`);
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 text-zinc-100">
      <h1 className="mb-2 text-2xl font-semibold">SLA & Escalation</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Define how quickly partners must accept and who gets notified if they don’t.
      </p>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm">Acceptance window (hours)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              value={form.acceptanceWindowHours}
              onChange={(e) => setForm({ ...form, acceptanceWindowHours: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm">Escalate to (comma roles)</label>
            <input
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              value={form.escalateTo}
              onChange={(e) => setForm({ ...form, escalateTo: e.target.value })}
              placeholder="Manager, Duty Lead"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={saveAndBind}
            disabled={busy || !dealId}
            className="inline-flex items-center rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
          >
            {busy ? "Binding…" : "Bind SLA & Continue"}
          </button>
          {msg && <span className="text-sm text-red-400">{msg}</span>}
        </div>
      </div>
    </main>
  );
}