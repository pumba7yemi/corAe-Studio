"use client";
import { useState, useEffect } from 'react';

export default function HealthPage() {
  const [score, setScore] = useState(120);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<any>(null);

  async function submit(e: any) {
    e.preventDefault();
    const res = await fetch('/api/health/today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, notes })
    });
    const json = await res.json();
    setResult(json);
  }

  useEffect(() => {
    // no-op
  }, []);

  return (
    <div className="max-w-xl w-full p-6 bg-slate-800 rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Morning Check-in</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm">How are you feeling (0-200)?</label>
          <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} className="mt-1 w-full p-2 rounded bg-slate-700" />
        </div>
        <div>
          <label className="block text-sm">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full p-2 rounded bg-slate-700" />
        </div>
        <div>
          <button className="px-4 py-2 bg-green-600 rounded">Save</button>
        </div>
        {result && (
          <pre className="mt-2 bg-slate-900 p-2 rounded text-xs">{JSON.stringify(result, null, 2)}</pre>
        )}
      </form>
    </div>
  );
}
