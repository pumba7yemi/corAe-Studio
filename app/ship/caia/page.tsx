'use client';

import { useEffect, useState } from 'react';

type Seed = { name: string; version: string; system: string[]; facts: string[] };

export default function CaiaShip() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [seed, setSeed] = useState<Seed | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/caia/memory?mode=seed').then(r=>r.json()).then(d=>setSeed(d.seed));
  }, []);

  async function ask() {
    setLoading(true); setAnswer('');
    try {
      const r = await fetch('/api/caia/ship/ask', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ prompt, wl: 'demo', user: 'guest' })
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Failed');
      setAnswer(d.answer);
      setPrompt('');
    } catch (e:any) {
      setAnswer('Error: ' + (e?.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">🧠 CAIA (Ship)</h1>
        <p className="text-sm opacity-70">Uses **base brain** only; no Dockyard growth memory crosses the BBB.</p>

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
        <div className="text-sm font-medium">Base Brain Seed</div>
        <div className="rounded-2xl border p-3 bg-gray-50">
          {seed ? (
            <div className="text-sm space-y-2">
              <div className="font-medium">{seed.name} v{seed.version}</div>
              <div>
                <div className="text-xs uppercase opacity-60">System</div>
                <ul className="list-disc ml-5">{seed.system.map((s,i)=><li key={i}>{s}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs uppercase opacity-60">Facts</div>
                <ul className="list-disc ml-5">{seed.facts.map((s,i)=><li key={i}>{s}</li>)}</ul>
              </div>
            </div>
          ) : <div className="text-sm opacity-60">Loading…</div>}
        </div>
      </div>
    </div>
  );
}