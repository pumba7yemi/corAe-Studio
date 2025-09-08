'use client';

import { useEffect, useState } from 'react';

type Item = { ts: string; role: 'user'|'assistant'|'system'|'note'; text: string; user?: string };

export default function CaiaDockyard() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch('/api/caia/memory?mode=dockyard');
    const d = await r.json();
    setHistory(d.items || []);
  }

  useEffect(() => { load(); }, []);

  async function ask() {
    setLoading(true); setAnswer('');
    try {
      const r = await fetch('/api/caia/ask', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ prompt, user: 'owner' })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Failed');
      setAnswer(d.answer);
      setPrompt('');
      await load();
    } catch (e:any) {
      setAnswer('Error: ' + (e?.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">🧠 CAIA (Dockyard)</h1>
        <p className="text-sm opacity-70">Growth memory is private to Dockyard and **never** crosses the BBB.</p>

        <textarea className="w-full border rounded-xl p-3" rows={4}
          placeholder="Ask CAIA…" value={prompt} onChange={e=>setPrompt(e.target.value)} />
        <div className="flex gap-2">
          <button disabled={loading || !prompt.trim()} onClick={ask}
            className="border rounded-xl px-4 py-2 hover:bg-gray-100">{loading ? 'Thinking…' : 'Ask'}</button>
          <a href="/dockyard/build/log" className="text-sm underline self-center">Build Log</a>
        </div>

        {answer && (
          <div className="p-4 border rounded-xl bg-gray-50">
            <div className="font-medium">Answer</div>
            <div className="mt-1">{answer}</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Growth Memory (latest)</div>
        <div className="rounded-2xl border p-3 max-h-[60vh] overflow-auto">
          {history.slice().reverse().map((m, i) => (
            <div key={i} className="py-1">
              <div className="text-xs opacity-60">{new Date(m.ts).toLocaleString()} — {m.role}</div>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
          {history.length === 0 && <div className="text-sm opacity-60">Empty.</div>}
        </div>
      </div>
    </div>
  );
}