"use client";
import React, { useEffect, useState } from "react";

type PanicHealth = {
  score150?: number | null;
  lastSweepAt?: string | null;
  mood?: string | null;
  sil?: { status?: string | null; domain?: string | null } | null;
};

const isDev = process.env.NODE_ENV !== "production";

export function DevPanicButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<PanicHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDev || !open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/caia/health", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setHealth({
          score150: data?.build?.score150 ?? data?.score150 ?? null,
          lastSweepAt: data?.build?.lastSweepAt ?? data?.lastSweepAt ?? null,
          mood: data?.mood ?? data?.caiaMood ?? null,
          sil: data?.sil ?? null,
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!isDev) return null;

  const hardReload = () => window.location.reload();
  const openHealthInNewTab = () => window.open("/api/caia/health", "_blank", "noopener,noreferrer");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-red-600 text-white text-xs px-4 py-2 shadow-lg shadow-red-900/50 hover:bg-red-500 transition"
      >
        DEV PANIC
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
          <div className="m-4 w-full max-w-sm rounded-xl bg-slate-900 text-slate-100 border border-red-500/60 shadow-xl pointer-events-auto p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold">CAIA • Dev Panic Panel</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            {loading && <p className="text-slate-300">Checking CAIA health…</p>}

            {error && (
              <p className="text-red-400">Health check failed: <span className="font-mono">{error}</span></p>
            )}

            {health && !loading && (
              <div className="space-y-1">
                <p><span className="font-semibold">Score150:</span> {health.score150 ?? 'N/A'}</p>
                <p><span className="font-semibold">Last sweep:</span> {health.lastSweepAt ?? 'N/A'}</p>
                <p><span className="font-semibold">Mood:</span> {health.mood ?? 'unknown'}</p>
                {health.sil && (
                  <p><span className="font-semibold">SIL:</span> {health.sil.status ?? 'N/A'} {health.sil.domain ? `(${health.sil.domain})` : ''}</p>
                )}
              </div>
            )}

            <div className="pt-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={openHealthInNewTab}
                className="rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800"
              >
                Open /api/caia/health
              </button>
              <button
                type="button"
                onClick={hardReload}
                className="rounded-lg bg-red-500 px-3 py-1 font-semibold hover:bg-red-400"
              >
                Hard Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DevPanicButton;
