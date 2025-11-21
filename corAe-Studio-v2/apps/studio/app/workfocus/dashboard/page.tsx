"use client";
import React, { useEffect, useMemo, useState } from "react";
import { computeNextOccurrence } from "@/lib/workfocus/scheduler";

type Action = { type: string; ref: string; payload?: Record<string,any> };
type Node = {
  id: string; title: string; prompt: string; role: string;
  requires?: string[]; meta?: any;
  onNo?: { actions?: Action[]; goto?: string };
  onYes?: { actions?: Action[]; goto?: string };
};
type Bundle = { id: string; title: string; nodes: Node[] };

type Row = {
  bundleId: string;
  nodeId: string;
  title: string;
  originalTitle?: string;
  role: string;
  when?: string;
  deadline?: string;
  nextAt: Date | null;
};

export default function Dashboard() {
  const [ids, setIds] = useState<string[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch("/api/workfocus/bundles");
      const d = await r.json();
      if (d.ok) setIds(d.ids || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const loaded: Bundle[] = [];
      for (const id of ids) {
        const r = await fetch(`/api/workfocus/bundles/${id}`);
        const d = await r.json();
        if (d.ok && d.bundle) loaded.push(d.bundle as Bundle);
      }
      setBundles(loaded);
    })();
  }, [ids]);

  const rows: Row[] = useMemo(() => {
    const now = new Date();
    const out: Row[] = [];
    for (const b of bundles) {
      for (const n of b.nodes) {
        const when = n.meta?.when as string | undefined;
        const deadline = n.meta?.deadline as string | undefined;
        const nextAt = computeNextOccurrence(when, deadline, now);
        out.push({
          bundleId: b.id,
          nodeId: n.id,
          title: n.title,
          originalTitle: n.meta?.originalTitle,
          role: n.role,
          when, deadline, nextAt
        });
      }
    }
    out.sort((a,b) => {
      if (a.nextAt && b.nextAt) return a.nextAt.getTime() - b.nextAt.getTime();
      if (a.nextAt && !b.nextAt) return -1;
      if (!a.nextAt && b.nextAt) return 1;
      return a.title.localeCompare(b.title);
    });
    return out;
  }, [bundles]);

  async function run(bundleId: string, nodeId: string, ans: "yes"|"no") {
    const r = await fetch("/api/workfocus/run", { method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ bundleId, nodeId, answer: ans }) });
    const d = await r.json();
    alert(d.ok ? d.log.join("\n") : d.error);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold">WorkFocus — Chronological Dashboard</h1>
      <p className="text-sm opacity-70 mb-4">Sorted by next occurrence. The wizard’s <i>when</i>/<i>deadline</i> drive ordering.</p>

      {loading && <div className="mb-4">Loading bundles…</div>}

      <div className="grid grid-cols-1 gap-3">
        {rows.map((r) => (
          <div key={`${r.bundleId}:${r.nodeId}`} className="rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {r.title}
                  {r.originalTitle && r.originalTitle !== r.title && (
                    <span className="ml-2 text-xs opacity-60">(original: {r.originalTitle})</span>
                  )}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  <span className="mr-3">Bundle: <b>{r.bundleId}</b></span>
                  <span className="mr-3">Role: <b>{r.role}</b></span>
                  {r.when && <span className="mr-3">When: <b>{r.when}</b></span>}
                  {r.deadline && <span className="mr-3">Deadline: <b>{r.deadline}</b></span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs opacity-70">Next</div>
                <div className="text-sm font-semibold">
                  {r.nextAt ? new Intl.DateTimeFormat(undefined, {
                    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                  }).format(r.nextAt) : "—"}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="px-3 py-2 rounded-xl border" onClick={() => run(r.bundleId, r.nodeId, "no")}>Answer: No</button>
              <button className="px-3 py-2 rounded-xl border" onClick={() => run(r.bundleId, r.nodeId, "yes")}>Answer: Yes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
