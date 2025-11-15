"use client";
import React from "react";

type DemoMetrics = {
  timeReclaimed: number; // minutes
  incomeEarned: number; // currency units
  flowScore: number; // 0-100
  financialHealth: number; // 0-100
};

const DEMO: DemoMetrics = {
  timeReclaimed: 135, // 2h15m
  incomeEarned: 420,
  flowScore: 68,
  financialHealth: 52,
};

function formatMinutes(m: number) {
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function TimeFuelWidget({
  metrics = DEMO,
}: {
  metrics?: DemoMetrics;
}) {
  const { timeReclaimed, incomeEarned, flowScore, financialHealth } = metrics;

  const timePercent = Math.min(100, Math.round((timeReclaimed / 240) * 100));
  const incomePercent = Math.min(100, Math.round((incomeEarned / 1000) * 100));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 w-full max-w-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-sky-400">Finance · Time Fuel</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-50">Time Purchased vs Time Reclaimed</h3>
          <p className="mt-2 text-xs text-slate-300">Demo metrics — shows how liquidity converts into minutes reclaimed.</p>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-sm font-medium text-slate-50">Flow</div>
          <div className="text-xs text-slate-300">{flowScore}%</div>
          <div className="mt-2 text-sm font-medium text-slate-50">Health</div>
          <div className="text-xs text-slate-300">{financialHealth}%</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <div className="text-xs text-slate-300 mb-1">Time Reclaimed</div>
          <div className="flex items-center gap-3">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-sky-400"
                style={{ width: `${timePercent}%`, transition: "width 400ms ease" }}
              />
            </div>
            <div className="text-xs text-slate-300 w-20 text-right">{formatMinutes(timeReclaimed)}</div>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-300 mb-1">Income Earned</div>
          <div className="flex items-center gap-3">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-emerald-400"
                style={{ width: `${incomePercent}%`, transition: "width 400ms ease" }}
              />
            </div>
            <div className="text-xs text-slate-300 w-20 text-right">{incomeEarned}</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">Time Purchasable (est.)</div>
          <div className="text-sm font-semibold text-sky-300">{(financialHealth / 100 * 0.5).toFixed(2)} min/unit</div>
        </div>
      </div>
    </div>
  );
}
