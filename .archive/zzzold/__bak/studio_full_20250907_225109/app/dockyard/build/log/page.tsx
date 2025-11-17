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

type ApiList = { ok: boolean; events: BuildEvent[] };

function parseBackupFromNotes(notes?: string): { timestamp: string; filePath: string } | null {
  if (!notes) return null;
  // expected pattern from safe-writer: "... backup=build/backups/<timestamp>/<filePath>"
  const m = notes.match(/backup=\s*build\/backups\/([^/]+)\/(.+)$/);
  if (m && m[1] && m[2]) {
    return { timestamp: m[1], filePath: m[2] };
  }
  // alternate hint: meta captured in logs; leave flexible if future format changes
  const m2 = notes.match(/from backup\s+([^\s]+)/i);
  if (m2 && m2[1] && m2[1].includes('T')) {
    // if only timestamp is present, we need file separately; cannot restore
    return null;
  }
  return null;
}

export default function BuildLogPage() {
  const [events, setEvents] = useState<BuildEvent[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function fetchEvents() {
    const r = await fetch('/api/build/log');
    const d: ApiList = await r.json();
    setEvents(Array.isArray(d.events) ? d.events : []);
  }

  useEffect(() => { fetchEvents(); }, []);

  async function handleRestore(e: BuildEvent) {
    const parsed = parseBackupFromNotes(e.notes);
    if (!parsed) {
      setFlash('No backup info found in this event.');
      return;
    }
    const id = `${e.ts}|${e.file}`;
    setBusyId(id);
    try {
      const res = await fetch('/api/build/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const json = await res.json();
      if (json.ok) {
        setFlash(`Restored ${json.restored} from ${json.from}`);
        await fetchEvents();
      } else {
        setFlash(`Restore failed: ${json.error || 'unknown error'}`);
      }
    } catch (err: any) {
      setFlash(`Restore failed: ${err?.message || 'unknown error'}`);
    } finally {
      setBusyId(null);
      setTimeout(() => setFlash(null), 4000);
    }
  }

  const grouped = useMemo(() => {
    // group by day for readability
    const map = new Map<string, BuildEvent[]>();
    for (const ev of events) {
      const day = new Date(ev.ts).toISOString().slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(ev);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [events]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-2">corAe One-Build Log</h1>
      <p className="text-sm text-gray-600 mb-6">
        Append-only audit of one-build actions across modules and white-labels. Protected by Safe-Writer.
      </p>

      {flash && (
        <div className="mb-4 rounded-xl border p-3 bg-green-50 text-sm">{flash}</div>
      )}

      <div className="space-y-8">
        {grouped.map(([day, evs]) => (
          <section key={day}>
            <h2 className="text-lg font-medium mb-3 opacity-80">{day}</h2>
            <div className="space-y-3">
              {evs.map((e, i) => {
                const key = `${e.ts}-${i}`;
                const canRestore = Boolean(parseBackupFromNotes(e.notes || ''));
                const lvlStyle =
                  e.level === 'ERROR' ? 'bg-red-50 border-red-200'
                    : e.level === 'WARN' ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200';
                return (
                  <div key={key} className={`rounded-2xl border p-4 ${lvlStyle}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono opacity-70">
                          {new Date(e.ts).toLocaleString()}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-white">
                          {e.level}
                        </span>
                      </div>
                      {canRestore && (
                        <button
                          onClick={() => handleRestore(e)}
                          disabled={busyId === `${e.ts}|${e.file}`}
                          className="text-sm px-3 py-1.5 rounded-lg border shadow bg-white hover:bg-gray-100 disabled:opacity-60"
                          title="Restore this file from the referenced backup"
                        >
                          ↩ Restore
                        </button>
                      )}
                    </div>

                    <div className="mt-2 font-medium">
                      {e.scope} → {e.action}
                    </div>
                    {e.file && <div className="text-xs opacity-70">{e.file}</div>}
                    {e.notes && (
                      <div className="mt-2 text-sm whitespace-pre-wrap opacity-90">
                        {e.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {events.length === 0 && (
          <div className="text-sm opacity-70">
            No events yet. POST to <code>/api/build/log</code> to begin.
          </div>
        )}
      </div>
    </main>
  );
}