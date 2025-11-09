"use client";

import React, { useCallback, useMemo, useState } from "react";

type CheckResult = {
  actionable: boolean;
  item: {
    id: string;
    title: string;
    code?: string;
  };
  rule: {
    status: string;
    reason?: string;
  };
};

type Props = { initial: CheckResult[] };

export default function HaveYouChecklist({ initial }: Props) {
  const [rows, setRows] = useState<CheckResult[]>(initial);

  const ready = useMemo<CheckResult[]>(() => rows.filter((r: CheckResult) => r.actionable), [rows]);
  const pending = useMemo<CheckResult[]>(() => rows.filter((r: CheckResult) => !r.actionable), [rows]);

  const mutate = useCallback(async (action: "done" | "snooze", itemId: string, until?: string) => {
    const res = await fetch("/api/have-you", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, itemId, until })
    });
    if (res.ok) {
      const next = await fetch("/api/have-you").then((r) => r.json());
      setRows(next.results);
    }
  }, []);

  return (
    <div className="grid gap-6">
      <section>
        <h2 className="text-xl font-semibold">Ready</h2>
        <div className="grid gap-3">
          {ready.map((r: CheckResult) => (
            <article key={r.item.id} className="p-4 rounded-2xl shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{r.item.title}</h3>
                  <p className="text-sm opacity-80">{r.item.code}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-xl border" onClick={() => mutate("done", r.item.id)}>Mark done</button>
                  <button
                    className="px-3 py-1 rounded-xl border"
                    onClick={() => mutate("snooze", r.item.id, new Date(Date.now() + 6 * 3600_000).toISOString())}
                  >
                    Snooze 6h
                  </button>
                </div>
              </div>
              {r.rule.reason && <p className="text-xs opacity-70 mt-2">Reason: {r.rule.reason}</p>}
            </article>
          ))}
          {ready.length === 0 && <p className="text-sm opacity-70">Nothing actionable right now.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Pending</h2>
        <div className="grid gap-3">
          {pending.map((r: CheckResult) => (
            <article key={r.item.id} className="p-4 rounded-2xl border bg-neutral-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{r.item.title}</h3>
                  <p className="text-sm opacity-80">{r.item.code}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border">{r.rule.status}</span>
              </div>
              {r.rule.reason && <p className="text-xs opacity-70 mt-2">Reason: {r.rule.reason}</p>}
            </article>
          ))}
          {pending.length === 0 && <p className="text-sm opacity-70">No pending items.</p>}
        </div>
      </section>
    </div>
  );
}