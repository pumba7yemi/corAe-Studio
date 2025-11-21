"use client";

import React, { useState } from "react";

export function GovernanceDialog({ canWrite }: { canWrite: boolean }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!canWrite) return;
    if (!text.trim()) return;
    setStatus("saving");
    setErr(null);
    try {
      const res = await fetch("/api/governance/subject1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(await res.text());
      setText("");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1400);
    } catch (e: any) {
      setStatus("error");
      setErr(e?.message || "Failed");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      <div className="text-sm font-semibold text-slate-200">Subject 1 Governance Update</div>
      <textarea
        disabled={!canWrite}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={canWrite ? "Add a governance update..." : "Read-only in this OS."}
        className="w-full min-h-[120px] rounded-xl bg-slate-900/60 border border-slate-700 p-3 text-sm text-slate-100 placeholder:text-slate-500"
      />
      {err && <div className="text-xs text-rose-300">{err}</div>}
      <button
        disabled={!canWrite || status === "saving"}
        onClick={submit}
        className="px-3 py-2 rounded-lg text-sm bg-sky-600 hover:bg-sky-500 disabled:opacity-40"
      >
        {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : "Submit update"}
      </button>
    </div>
  );
}
