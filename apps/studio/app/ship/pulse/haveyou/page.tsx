// apps/studio/app/ship/pulse/haveyou/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function PulseHaveYouPage() {
  const [scope, setScope] = useState<"HOME" | "WORK" | "BUSINESS">("BUSINESS");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ship/haveyou?scope=${scope}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function runTick() {
    setMsg("Running tick...");
    await fetch(`/api/ship/haveyou/tick?all=1`);
    setMsg("✓ Tick executed");
    setTimeout(() => setMsg(""), 2500);
  }

  useEffect(() => { load(); }, [scope]);

  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">
        <h1 className="text-2xl font-semibold mb-4">Have-You Chrono Pulse</h1>
        <div className="flex items-center gap-3 mb-6">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
          >
            <option value="HOME">Home</option>
            <option value="WORK">Work</option>
            <option value="BUSINESS">Business</option>
          </select>
          <button
            onClick={load}
            className="bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm"
          >
            Refresh
          </button>
          <button
            onClick={runTick}
            className="bg-green-600 hover:bg-green-500 rounded-lg px-4 py-2 text-sm"
          >
            Run Tick
          </button>
          {msg && <span className="text-xs text-zinc-400">{msg}</span>}
        </div>

        {loading ? (
          <div className="text-sm text-zinc-400">Loading...</div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
              >
                <div className="text-sm">{it.text}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {it.schedule} · {it.scope}
                </div>
              </div>
            ))}
            {!items.length && (
              <div className="text-sm text-zinc-500">No Have-You items for this scope.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}