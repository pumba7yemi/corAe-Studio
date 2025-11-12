"use client";
import { useMemo } from "react";

export function ThreadList({ threads, domain, pipeline }: { threads: any[]; domain?: string; pipeline?: string }) {
  const rows = useMemo(() => {
    return threads.filter(t => {
      const okDomain = domain && domain !== "All" ? t.domain === domain : true;
      const okPipe   = pipeline && pipeline !== "Any" ? t.pipeline === pipeline : true;
      return okDomain && okPipe;
    });
  }, [threads, domain, pipeline]);

  return (
    <div className="grid gap-2">
      {rows.map((t) => (
        <div key={t.threadId} className="border rounded p-3">
          <div className="text-sm opacity-70">{t.pipeline} • {t.domain}</div>
          <div className="font-medium">{t.subject}</div>
          <div className="text-xs">ID: {t.threadId} • Stage: {t.stage ?? t.homeFlowKind ?? t.workFlowKind} • Tasks: {t.relatedTasks?.length ?? 0}</div>
        </div>
      ))}
      {rows.length === 0 && <div className="opacity-60 text-sm">No threads yet.</div>}
    </div>
  );
}
