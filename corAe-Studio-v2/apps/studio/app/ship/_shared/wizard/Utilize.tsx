"use client";

import React, { useEffect, useState } from "react";
import type { Scope, WizardSnapshot, AutomateResponse } from "./types";

export default function Utilize({ scope }: { scope: Scope }) {
  const [snap, setSnap] = useState<WizardSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/wizard/latest?scope=${scope}`)
      .then((r) => r.json())
      .then((data) => mounted && setSnap(data))
      .catch(() => mounted && setSnap(null));
    return () => {
      mounted = false;
    };
  }, [scope]);

  async function callAutomate(kind: "schedule" | "summary") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/automate/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scope, plan: snap?.plan ?? [] }),
      });
      const data: AutomateResponse = await res.json();
      setMsg(data.ok ? `Scheduled (${data.id ?? "ok"})` : "Failed");
    } catch (e: any) {
      setMsg(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  const placeholder: WizardSnapshot = {
    scope,
    haveYou: [
      { id: "hy-1", title: "Daily check-in", when: "09:00" },
      { id: "hy-2", title: "Health quick task", when: "14:00" },
    ],
    pulse: { wins: ["No incidents"], risks: ["Stock low"], next: ["Follow up supplier"] },
    plan: [
      { id: "p-1", title: "Morning check-in", when: "09:00" },
      { id: "p-2", title: "Afternoon follow-up", when: "15:00" },
    ],
  };

  const view = snap ?? placeholder;

  return (
    <section className="space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Utilize — {scope}</h2>
        <div className="text-sm text-slate-400">Last: {snap ? "live" : "placeholder"}</div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-3 bg-slate-900/60">
          <h3 className="font-medium">Today plan</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {view.plan.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.title}</span>
                <span className="text-slate-400">{p.when}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border p-3 bg-slate-900/60">
          <h3 className="font-medium">Pulse snapshot</h3>
          <div className="mt-2 text-sm">
            <div>
              <b>Wins</b>
              <ul className="list-disc ml-4 mt-1">{view.pulse.wins.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
            <div className="mt-2">
              <b>Risks</b>
              <ul className="list-disc ml-4 mt-1">{view.pulse.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
            <div className="mt-2">
              <b>Next</b>
              <ul className="list-disc ml-4 mt-1">{view.pulse.next.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-3 bg-slate-900/60">
          <h3 className="font-medium">Automation</h3>
          <div className="mt-3 flex flex-col gap-2">
            <button className="px-3 py-2 rounded bg-sky-600 text-white" onClick={() => callAutomate("schedule")} disabled={busy}>
              {busy ? "Scheduling…" : "Schedule plan"}
            </button>
            <button className="px-3 py-2 rounded border" onClick={() => callAutomate("summary")} disabled={busy}>
              {busy ? "Running…" : "Generate summary"}
            </button>
            {msg && <div className="text-sm text-slate-300 mt-2">{msg}</div>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-3 bg-slate-900/60">
        <h3 className="font-medium">Have-You items</h3>
        <ul className="mt-2 text-sm">
          {view.haveYou.map((h) => (
            <li key={h.id} className="flex justify-between">
              <span>{h.title}</span>
              <span className="text-slate-400">{h.when ?? "—"}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
