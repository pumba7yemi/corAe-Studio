// apps/studio/app/agent/page.tsx// apps/studio/app/agent/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type QueueItem = {
  id: string;
  task: string;
  payload?: any;
  status: 'queued' | 'running' | 'done' | 'error';
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  result?: any;
  error?: string;
};

const TASKS = [
  'ping',
  'scaffold-page',
  // THEME
  'apply-brand',
  // OBARI
  'create-order',
  'book-order',
  'mark-active',
  'report-order',
  'final-invoice',
  'list-obari',
  // scaffolder
  'scaffold-obari-ui',
] as const;

export default function AgentPage() {
  const [task, setTask] = useState<(typeof TASKS)[number]>('ping');
  const [payloadText, setPayloadText] = useState('{}');
  const [result, setResult] = useState<any>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);

  const prettyResult = useMemo(() => {
    try { return JSON.stringify(result, null, 2); }
    catch { return String(result ?? ''); }
  }, [result]);

  useEffect(() => { refreshQueue(); }, []);

  async function refreshQueue() {
    try {
      const r = await fetch('/api/agent/queue', { cache: 'no-store' });
      if (!r.ok) { setQueue([]); return; }
      const data = await r.json().catch(() => ({ queue: [] }));
      setQueue(Array.isArray(data.queue) ? data.queue : []);
    } catch { setQueue([]); }
  }

  function parsePayload(): any {
    if (!payloadText.trim()) return {};
    try { return JSON.parse(payloadText); }
    catch (err: any) { throw new Error(`Invalid JSON payload: ${err?.message || String(err)}`); }
  }

  async function runNow() {
    setBusy(true); setResult(null);
    try {
      const payload = parsePayload();
      const r = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, payload }),
      });
      const data = await r.json();
      setResult(data);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally { setBusy(false); refreshQueue(); }
  }

  async function enqueue() {
    setBusy(true); setResult(null);
    try {
      const payload = parsePayload();
      const r = await fetch('/api/agent/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, payload }),
      });
      const data = await r.json();
      setResult(data);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally { setBusy(false); refreshQueue(); }
  }

  async function processNext() {
    setBusy(true); setResult(null);
    try {
      const r = await fetch('/api/agent/worker', { method: 'POST' });
      const data = await r.json();
      setResult(data);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally { setBusy(false); refreshQueue(); }
  }

  async function clearQueue() {
    setBusy(true); setResult(null);
    try {
      await fetch('/api/agent/queue', { method: 'DELETE' });
      await refreshQueue();
      setResult({ ok: true, cleared: true });
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally { setBusy(false); }
  }

  async function enqueueObariUI() {
    setBusy(true); setResult(null);
    try {
      const r = await fetch('/api/agent/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'scaffold-obari-ui', payload: {} }),
      });
      const data = await r.json();
      setResult(data);
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || String(err) });
    } finally { setBusy(false); refreshQueue(); }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-extrabold">Dev Agent</h1>
      <p className="text-sm opacity-80">
        Declare the structure. The agent scaffolds modules and pages, and integrates theme + OBARI tasks.
      </p>

      <section className="space-y-2">
        <h2 className="text-2xl font-bold">One-click build: generates the OBARI pages (Orders, Bookings, Active, Reports, Invoices)</h2>
        <div className="flex items-center gap-3">
          <button onClick={enqueueObariUI} disabled={busy} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
            Build OBARI UI
          </button>
          <span className="text-xs opacity-70">(enqueues task: <code>scaffold-obari-ui</code>)</span>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Run task</h3>
        <div className="flex flex-wrap gap-3 items-start">
          <select
            value={task}
            onChange={(e) => setTask(e.target.value as any)}
            className="border rounded p-2 min-w-[220px] bg-black/20"
          >
            {TASKS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <textarea
            className="border rounded p-2 w-[420px] h-[92px] font-mono text-sm bg-black/20"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            placeholder='{"key":"value"}'
          />

          <div className="flex flex-col gap-2">
            <button onClick={runNow} disabled={busy} className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">
              Run now
            </button>
            <button onClick={enqueue} disabled={busy} className="px-3 py-2 rounded bg-amber-600 text-white disabled:opacity-50">
              Enqueue
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-xl font-semibold">Result</h3>
        <pre className="bg-black/30 rounded p-3 overflow-auto max-h-[40vh] text-sm">{prettyResult}</pre>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Build Queue</h3>
          <div className="flex gap-2">
            <button onClick={refreshQueue} disabled={busy} className="px-3 py-2 rounded bg-slate-600 text-white disabled:opacity-50">Refresh</button>
            <button onClick={processNext} disabled={busy} className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Process Next</button>
            <button onClick={clearQueue} disabled={busy} className="px-3 py-2 rounded bg-rose-700 text-white disabled:opacity-50">Clear</button>
          </div>
        </div>

        <div className="space-y-2">
          {queue.length === 0 && (<div className="opacity-70 text-sm">Queue empty.</div>)}
          {queue.map((q) => (
            <div key={q.id} className="border rounded p-3 bg-black/20 flex flex-col gap-1 text-sm">
              <div className="flex gap-4">
                <div><b>task</b>: {q.task}</div>
                <div><b>status</b>: {q.status}</div>
                <div className="opacity-70"><b>id</b>: {q.id}</div>
              </div>
              <div className="opacity-80"><b>payload</b>: <code>{safeJson(q.payload)}</code></div>
              {q.error && (<div className="text-rose-400"><b>error</b>: {q.error}</div>)}
              {q.result && (<div className="opacity-80"><b>result</b>: <code>{safeJson(q.result)}</code></div>)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function safeJson(v: any) {
  try { return JSON.stringify(v); } catch { return String(v ?? ''); }
}