import fs from "node:fs/promises";
import path from "node:path";
import { GovernanceDialog } from "@/../GOVERNANCE/ui/GovernanceDialog";

export const dynamic = "force-dynamic";

async function readFileSafe(p: string) {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return "";
  }
}

// The canonical read-first page is provided at `governance/canonical`.
// Keep this UI-focused governance page as the Studio control panel (client-side).
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

type LogEntry = { id: number; action: string; ok: boolean; output: string };

const ACTIONS = [
  { id: "run-backup", label: "Run Backup Script" },
  { id: "run-ts-verify", label: "Run TypeScript Verification" },
  { id: "run-150-build", label: "Run 150-Confidence Build" },
  { id: "run-nightly-sweep", label: "Run Nightly Sweep (manual)" },
  { id: "view-decision-metrics", label: "View Decision Memory Metrics" },
  { id: "view-last-known-good", label: "View Last Known Good Build" },
  { id: "view-sil-structural", label: "View SIL Structural Scan" },
  { id: "trigger-onboarding-caia", label: "Trigger Onboarding → CAIA Script Generation" },
];

export default function GovernancePage(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [shipAudit, setShipAudit] = useState<any|null>(null);
  const [snapshot, setSnapshot] = useState<any|null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  async function loadAudit(){
    setLoadingAudit(true);
    try{
      const res = await fetch('/api/governance/audit');
      const j = await res.json().catch(()=>null);
      if(j?.snapshot) setSnapshot(j.snapshot);
      else setSnapshot(null);
      if(j?.snapshot?.checks) setShipAudit(j.snapshot.checks.find((c:any)=>c.key==='ship-config') ?? null);
    }catch{ setSnapshot(null); setShipAudit(null); }finally{ setLoadingAudit(false); }
  }

  useEffect(()=>{ void loadAudit(); },[]);

  async function runAction(actionId: string) {
    setRunning(actionId);
    const id = Date.now();
    try {
      const res = await fetch(`/api/governance/${actionId}`, { method: "POST" });
      const json = await res.json();
      setLogs((s) => [{ id, action: actionId, ok: !!json.ok, output: json.output || json.message || JSON.stringify(json) }, ...s]);
    } catch (err: any) {
      setLogs((s) => [{ id, action: actionId, ok: false, output: String(err) }, ...s]);
    } finally {
      setRunning(null);
    }
  }

  function badgeFor(ok: boolean | null) {
    if (ok === null) return <span className="inline-block px-2 py-1 text-xs bg-neutral-200 rounded">unknown</span>;
    return ok ? <span className="inline-block px-2 py-1 text-xs bg-green-200 text-green-800 rounded">green</span> : <span className="inline-block px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded">issue</span>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Build Governance</h1>
        <p className="text-sm text-neutral-600">v2 — control panel (UI + endpoints only)</p>
      </header>

      <div className="mt-2">
        <Link href="/governance/console" className="underline text-sm">Open Governance Console</Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACTIONS.map((a) => (
          <div key={a.id} className="p-4 border rounded">
            <div className="flex items-center justify-between mb-3">
              <strong>{a.label}</strong>
              <div>
                <button
                  className="mr-2 px-3 py-1 bg-neutral-100 rounded hover:bg-neutral-200"
                  onClick={() => runAction(a.id)}
                  disabled={running !== null}
                >
                  Run
                </button>
                {running === a.id ? <span className="text-sm">running…</span> : null}
              </div>
            </div>
            <div className="text-sm text-neutral-500">Status: {badgeFor(null)}</div>
          </div>
        ))}
      </section>

      <section className="mt-4 p-4 border rounded">
        <h3 className="font-medium mb-2">Rebuild Scripts for User</h3>
        <div className="flex gap-2">
          <input className="px-2 py-1 border rounded" placeholder="person-slug" value={slug} onChange={(e)=>setSlug(e.target.value)} />
          <button className="px-3 py-1 bg-neutral-100 rounded" onClick={async ()=>{
            if(!slug) return alert('enter slug');
            setRunning('rebuild-scripts');
            try{
              const res = await fetch('/api/governance/rebuild-scripts', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({slug})});
              const j = await res.json();
              const id = Date.now();
              setLogs(s=>[{id, action:`rebuild-scripts:${slug}`, ok:!!j.ok, output: j.output||JSON.stringify(j) }, ...s]);
            }catch(err:any){
              const id=Date.now(); setLogs(s=>[{id, action:`rebuild-scripts:${slug}`, ok:false, output:String(err)}, ...s]);
            } finally { setRunning(null); }
          }}>Rebuild scripts for this user</button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-50">Governance Completion</div>
            <div className="text-xs text-slate-300">{snapshot && snapshot.total>0 ? `${snapshot.completed}/${snapshot.total} checks • ${(snapshot.completionRatio*100).toFixed(1)}%` : 'No audit snapshot yet'}</div>
          </div>
          <div>
            <button type="button" onClick={loadAudit} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800" disabled={loadingAudit}>{loadingAudit?"Refreshing...":"Refresh Audit"}</button>
          </div>
        </div>

        {snapshot && snapshot.checks?.length > 0 && (
          <div className="mt-3 grid gap-1 text-xs text-slate-200">
            {snapshot.checks.slice(0,6).map((c:any)=> (
              <div key={c.key} className="flex items-center justify-between gap-2">
                <span className="truncate">{c.label}</span>
                <span className={c.status === 'ok' ? 'rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300' : c.status === 'fail' ? 'rounded-full bg-red-500/20 px-2 py-0.5 text-red-300' : c.status === 'warn' ? 'rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300' : 'rounded-full bg-slate-700/60 px-2 py-0.5 text-slate-200'}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Action Log</h2>
        <div className="h-64 overflow-auto border rounded p-2 bg-black text-white text-xs font-mono">
          {logs.length === 0 ? <div className="text-neutral-400">No actions run yet.</div> : null}
          {logs.map((l) => (
            <div key={l.id} className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{l.action}</span>
                  <span className="ml-2 text-xs">{new Date(l.id).toLocaleString()}</span>
                </div>
                <div>{badgeFor(l.ok)}</div>
              </div>
              <pre className="whitespace-pre-wrap mt-1">{l.output}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
