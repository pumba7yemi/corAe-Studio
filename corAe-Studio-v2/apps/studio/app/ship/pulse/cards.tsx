"use client";

import React, { useEffect, useState } from 'react';

type PulseCardProps = { endpoint?: string; title?: string };

export function PulseMiniCard({ endpoint = '/api/ship/pulse/haveyou', title = 'Pulse' }: PulseCardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(endpoint);
        if (!mounted) return;
        if (!res.ok) {
          setError(`HTTP ${res.status}`);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!mounted) return;
        setData(json);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [endpoint]);

  return (
    <div className="p-3 border rounded-md bg-white shadow-sm" style={{ minWidth: 200 }}>
      <div className="flex items-center justify-between">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted">{loading ? 'Loading…' : 'Live'}</div>
      </div>
      <div className="mt-2">
        {error && <div className="text-xs text-red-600">Error: {error}</div>}
        {!error && !data && !loading && <div className="text-xs text-muted">No data</div>}
        {!error && data && (
          <div>
            {/* render small summary */}
            <div className="text-sm font-semibold">{data.title || data.name || 'Activity'}</div>
            <div className="text-xs text-muted">{data.summary || JSON.stringify(data).slice(0, 120)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PulseMiniCard;
