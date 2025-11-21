'use client';

import { useState } from 'react';

export default function StartMarketingButton() {
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function startMarketingLoop() {
    try {
      setLoading(true);
      setErr(null);
      const r = await fetch('/api/workflows/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workflowId: 'marketing.loop.v1',
          data: { brand: 'Choice Plus' },
        }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed to start');
      setLastRun(j.runId);
    } catch (e: any) {
      setErr(e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={startMarketingLoop}
        disabled={loading}
        className="px-4 py-2 rounded-xl border shadow hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Starting…' : 'Start Marketing Loop'}
      </button>
      {lastRun && <span className="small text-green-700">Started: {lastRun}</span>}
      {err && <span className="small text-red-700">{err}</span>}
    </div>
  );
}
