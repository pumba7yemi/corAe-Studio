'use client';
import { useEffect, useState } from 'react';

type BuildEvent = {
  ts: string; level: 'INFO' | 'WARN' | 'ERROR'; scope: string; action: string; file?: string; notes?: string;
};

export default function BuildLogPage() {
  const [events, setEvents] = useState<BuildEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/build/log')
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <a href="/dockyard" className="text-sm underline">← Dockyard</a>
      <h1 className="text-3xl font-semibold mt-2">corAe One-Build Log</h1>
      <p className="text-sm opacity-70 mb-6">Append-only audit of one-build actions across modules and white-labels.</p>

      {loading && <div className="text-sm opacity-70">Loading…</div>}

      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="rounded-2xl shadow p-4 border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono opacity-70">{new Date(e.ts).toLocaleString()}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${
                e.level === 'ERROR' ? 'bg-red-50' : e.level === 'WARN' ? 'bg-yellow-50' : 'bg-green-50'
              }`}>{e.level}</span>
            </div>
            <div className="mt-2 font-medium">{e.scope} → {e.action}</div>
            {e.file && <div className="text-xs opacity-70">{e.file}</div>}
            {e.notes && <div className="mt-2 text-sm whitespace-pre-wrap">{e.notes}</div>}
          </div>
        ))}
        {!loading && events.length === 0 && (
          <div className="text-sm opacity-70">No events yet. POST to <code>/api/build/log</code> to begin.</div>
        )}
      </div>
    </div>
  );
}