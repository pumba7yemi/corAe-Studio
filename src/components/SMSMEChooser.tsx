"use client";

import React, { useState } from "react";
import UploadPanel from "@/components/UploadPanel";

export default function SMSMEChooser() {
  const [oldPath, setOldPath] = useState<string>("");
  const [newPath, setNewPath] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function runWithUploads() {
    if (!oldPath || !newPath) return;
    setBusy(true);
    setStatus("Running SMSME on selected snapshots…");
    try {
      const res = await fetch("/api/smsme/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath, newPath }),
      });
      const data = await res.json();
      setStatus(data.ok ? `✅ Completed — ${data.steps} steps, plan: ${data.planPath}` : `❌ ${data.error}`);
    } catch (e: any) {
      setStatus(`❌ ${e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function useLatestPrisma() {
    setBusy(true);
    setStatus("Converting schema.prisma → data/schemas/next.json…");
    try {
      const gen = await fetch("/api/smsme/snapshot/prisma", { method: "POST" });
      const g = await gen.json();
      if (!g.ok) {
        setStatus(`❌ ${g.error}`);
        return;
      }
      setNewPath("schemas/next.json");
      setStatus("✅ NEXT set to data/schemas/next.json — now pick OLD and Run");
    } catch (e: any) {
      setStatus(`❌ ${e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <UploadPanel bucket="schemas" accept=".json" title="Upload OLD snapshot" onUploaded={(x) => setOldPath(`schemas/${x.filename}`)} />

        <div className="space-y-2">
          <UploadPanel bucket="schemas" accept=".json" title="Upload NEXT snapshot" onUploaded={(x) => setNewPath(`schemas/${x.filename}`)} />
          <button onClick={useLatestPrisma} disabled={busy} className="w-full rounded-md bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700 disabled:opacity-60">
            Use latest Prisma as NEXT
          </button>
          <div className="text-[11px] text-slate-500">Reads <code>schema.prisma</code>, converts it, saves <code>data/schemas/next.json</code>.</div>
        </div>
      </div>

      <div className="text-xs text-slate-600">Selected: <code>{oldPath || "(OLD not set)"}</code> → <code>{newPath || "(NEXT not set)"}</code></div>

      <button onClick={runWithUploads} disabled={!oldPath || !newPath || busy} className="w-full rounded-xl bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700 disabled:opacity-60">
        {busy ? "Working…" : "Run SMSME on selected snapshots"}
      </button>

      {status && <div className="text-xs text-slate-700 bg-slate-50 border p-2 rounded-lg">{status}</div>}
    </div>
  );
}