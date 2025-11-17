"use client";
import React, { useMemo, useState } from "react";

async function callAPI(body: unknown) {
  const res = await fetch("/api/habits", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export default function HabitCard() {
  const [task, setTask] = useState("morning-exec");
  const [sig,  setSig]  = useState("have-you/morning-exec");
  const [out, setOut]   = useState<string>("");
  const busy = useMemo(() => out.startsWith("..."), [out]);

  async function record() {
    try {
      setOut("... recording");
      const r = await callAPI({ action: "record", task, context: { source: "HabitCard" } });
      setOut(JSON.stringify(r.data, null, 2));
    } catch (e:any) {
      setOut(String(e.message || e));
    }
  }
  async function enable() {
    try {
      setOut("... enabling");
      const r = await callAPI({ action: "enable", signature: sig || task });
      setOut(JSON.stringify(r.data, null, 2));
    } catch (e:any) {
      setOut(String(e.message || e));
    }
  }
  async function disable() {
    try {
      setOut("... disabling");
      const r = await callAPI({ action: "disable", signature: sig || task });
      setOut(JSON.stringify(r.data, null, 2));
    } catch (e:any) {
      setOut(String(e.message || e));
    }
  }
  async function view() {
    try {
      setOut("... get");
      const r = await callAPI({ action: "get", signature: sig || task });
      setOut(JSON.stringify(r.data, null, 2));
    } catch (e:any) {
      setOut(String(e.message || e));
    }
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="text-sm opacity-70">CAIA Habits</div>
      <div className="grid gap-2">
        <label className="text-sm">
          Task
          <input className="block w-full border rounded px-2 py-1" value={task} onChange={e=>setTask(e.target.value)} />
        </label>
        <label className="text-sm">
          Signature (optional)
          <input className="block w-full border rounded px-2 py-1" value={sig} onChange={e=>setSig(e.target.value)} />
        </label>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button disabled={busy} className="px-3 py-1 rounded border" onClick={record}>Record</button>
        <button disabled={busy} className="px-3 py-1 rounded border" onClick={enable}>Enable Auto</button>
        <button disabled={busy} className="px-3 py-1 rounded border" onClick={disable}>Disable Auto</button>
        <button disabled={busy} className="px-3 py-1 rounded border" onClick={view}>Get Policy</button>
      </div>
      <pre className="text-xs bg-neutral-50 rounded p-3 overflow-auto max-h-48">{out || "—"}</pre>
    </div>
  );
}
