"use client";
import React from "react";

export default function SignPledge() {
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onPledge() {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/pulse/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasksCompleted: 1, purposeTags: ['respect'] })
      });

      fetch('/api/cims/campaign/pledge', { method: 'POST', body: JSON.stringify({ pledge: true }) }).catch(()=>{});

      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'failed');
    } finally {
      setLoading(false);
    }
  }

  if (done) return <div className="rounded-md bg-green-50 p-3 text-green-700">Thanks — your pledge is recorded.</div>;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <button
        className="px-4 py-2 rounded-xl bg-black text-white"
        onClick={onPledge}
        disabled={loading}
      >
        {loading ? 'Signing…' : 'Sign the Contract'}
      </button>

      <button
        className="px-4 py-2 rounded-xl border"
        onClick={() => {
          const yes = confirm('Have you respected your neighbour today?');
          if (yes) onPledge();
        }}
      >
        Quick Have-You
      </button>

      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
