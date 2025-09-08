'use client';

import { useEffect, useMemo, useState } from 'react';

type BuildEvent = {
  ts: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  scope: string;
  action: string;
  file?: string;
  notes?: string;
  meta?: Record<string, any>;
};

export default function BuildLogPage() {
  const [events, setEvents] = useState<BuildEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/build/log', { cache: 'no-store' });
      const d = await r.json();
      setEvents(d?.events || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => (level === 'ALL' ? true : e.level === level))
      .filter((e) => {
        if (!q) return true;
        const bag =
          `${e.ts} ${e.level} ${e.scope} ${e.action} ${e.file || ''} ${e.notes || ''} ${JSON.stringify(e.meta || {})}`.toLowerCase();
        return bag.includes(q);
      })
      .reverse(); // newest first
  }, [events, query, level]);

  function badgeColor(lvl: BuildEvent['level']) {
    switch (lvl) {
      case 'ERROR':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'WARN':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">corAe One-Build Log</h1>
          <p className="text-sm text-slate-500">
            Append-only audit of worker jobs, safe-writer actions, and manual notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto refresh
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter… (scope, action, notes, file)"
          className="sm:col-span-2 rounded-xl border px-3 py-2 text-sm"
        />

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as any)}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          <option value="ALL">All levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((e, i) => (
          <div key={i} className="rounded-2xl border shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <time className="text-xs font-mono text-slate-500">
                {new Date(e.ts).toLocaleString()}
              </time>
              <span className={`text-xs px-2 py-1 rounded-full border ${badgeColor(e.level)}`}>
                {e.level}
              </span>
            </div>

            <div className="mt-2 text-sm">
              <div className="font-medium">
                {e.scope} → {e.action}
              </div>
              {e.file && <div className="text-xs text-slate-500 mt-0.5">{e.file}</div>}
              {e.notes && <div className="mt-2 whitespace-pre-wrap">{e.notes}</div>}
              {e.meta && Object.keys(e.meta).length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-600">meta</summary>
                  <pre className="mt-1 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
                    {JSON.stringify(e.meta, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-sm text-slate-500">No events yet. Trigger a job from CAIA.</div>
        )}
      </div>
    </div>
  );
}