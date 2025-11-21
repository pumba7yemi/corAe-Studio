"use client";
export function TaskList({ tasks, domain }: { tasks: any[]; domain?: string }) {
  const rows = (domain ? tasks.filter(t => t.domain === domain) : tasks);
  return (
    <div className="grid gap-2">
      {rows.map(t => (
        <div key={t.id} className="border rounded p-3">
          <div className="text-sm opacity-70">{t.pipeline} • {t.domain}</div>
          <div className="font-medium">{t.title}</div>
          <div className="text-xs">Tags: {(t.tags ?? []).join(", ")}</div>
        </div>
      ))}
      {rows.length === 0 && <div className="opacity-60 text-sm">No tasks yet.</div>}
    </div>
  );
}
