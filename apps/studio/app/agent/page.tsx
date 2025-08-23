'use client';

import React from 'react';

export default function AgentPage() {
  const [task, setTask] = React.useState('ping');
  const [payload, setPayload] = React.useState('{}');
  const [result, setResult] = React.useState<string>('');
  const [busy, setBusy] = React.useState(false);

  async function runTask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult('');
    try {
      const body = { task, payload: JSON.parse(payload || '{}') };
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setResult('Error: ' + (err?.message || String(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Dev Agent MVP</h1>
      <p className="text-sm opacity-80">Runs small maintenance tasks inside Studio.</p>

      <form onSubmit={runTask} className="space-y-3">
        <label className="block text-sm font-medium">
          Task
          <select
            className="mt-1 w-full border rounded p-2"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          >
            <option value="ping">ping</option>
            <option value="health">health</option>
            <option value="version">version</option>
            <option value="list-pages">list-pages</option>
            <option value="echo">echo</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          Payload (JSON)
          <textarea
            className="mt-1 w-full border rounded p-2 font-mono text-sm"
            rows={6}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="{}"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {busy ? 'Running…' : 'Run'}
        </button>
      </form>

      <div>
        <h2 className="text-sm font-semibold">Result</h2>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">{result}</pre>
      </div>
    </main>
  );
}
