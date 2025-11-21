"use client";

import React from 'react';

export type GreenConfidenceMeterProps = {
  health: any | null;
  className?: string;
};

function pct(v: number) {
  return Math.round(v * 100);
}

function barColorClass(v: number) {
  if (v >= 0.8) return 'bg-emerald-500';
  if (v >= 0.5) return 'bg-amber-400';
  return 'bg-red-500';
}

export function GreenConfidenceMeter({ health, className }: GreenConfidenceMeterProps) {
  // robust build/metrics extraction per spec
  const build = health?.build ?? health?.systems?.build ?? null;
  const metrics =
    build?.['v2-build-run'] ??
    build?.v2BuildRun ??
    build?.['v2-build'] ??
    null;

  const greens = Number(metrics?.greens ?? metrics?.success ?? 0);
  const reds = Number(metrics?.reds ?? metrics?.failures ?? 0);
  const total = Math.max(greens + reds, 1);

  const passRate = Number(metrics?.passRate ?? (greens / total));
  const score150 = Number(metrics?.score150 ?? 0);
  const consecutiveGreens = Number(metrics?.consecutiveGreens ?? 0);

  const greenStability = Math.max(0, Math.min(1, passRate));
  const redRecovery = Math.max(0, Math.min(1, greens / total));
  const confidenceCertainty = Math.max(0, Math.min(1, score150 / 150));

  let confidenceLabel = 'Unknown';
  if (health && metrics) {
    if (confidenceCertainty < 0.5) confidenceLabel = 'Low';
    else if (confidenceCertainty < 0.8) confidenceLabel = 'Medium';
    else if (confidenceCertainty < 0.99) confidenceLabel = 'High';
    else confidenceLabel = '150% Certified';
  }

  const showUnknown = !health || !metrics;

  const bar = (label: string, value: number, rawPct?: number) => (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <div className="text-xs text-slate-300">{label}</div>
        <div className="text-xs font-mono text-slate-200">{rawPct ?? pct(value)}%</div>
      </div>
      <div className="w-full bg-slate-800 rounded h-3 overflow-hidden">
        <div
          className={`${barColorClass(value)} h-3`} 
          style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`rounded-md border border-slate-700 bg-slate-900/60 p-4 text-sm ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-slate-300">Green Confidence</div>
          <div className="text-lg font-semibold text-slate-100">{showUnknown ? 'Unknown' : confidenceLabel}</div>
        </div>
        <div className="text-xs text-slate-400">
          {showUnknown ? '--' : `${Math.round(score150)}/150`}
        </div>
      </div>

      <div className="space-y-3">
        {bar('Green Stability', showUnknown ? 0 : greenStability, showUnknown ? 0 : pct(greenStability))}
        {bar('Red Recovery', showUnknown ? 0 : redRecovery, showUnknown ? 0 : pct(redRecovery))}
        {bar('Confidence Certainty', showUnknown ? 0 : confidenceCertainty, showUnknown ? 0 : pct(confidenceCertainty))}
      </div>

      <div className="mt-3 text-xs text-slate-400">
        {showUnknown ? (
          <div>Waiting for first green run…</div>
        ) : confidenceCertainty >= 0.99 ? (
          <div>Last run: 150-logic certified.</div>
        ) : confidenceCertainty >= 0.8 ? (
          <div>Green but still learning — keep watching.</div>
        ) : (
          <div>Not yet trusted — corAe is still stabilising this path.</div>
        )}
        { !showUnknown && consecutiveGreens > 0 && (
          <div className="text-xs text-slate-500 mt-1">Consecutive greens: {consecutiveGreens}</div>
        )}
      </div>
    </div>
  );
}

export default GreenConfidenceMeter;
