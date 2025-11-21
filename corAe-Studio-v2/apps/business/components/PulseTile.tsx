"use client";
import React from "react";
import type { PulseMetric } from "@corae/pulse-core-v2";

interface Props {
  metric: PulseMetric;
}

export function PulseTile({ metric }: Props) {
  const trendLabel =
    metric.trend === "up"
      ? "↑"
      : metric.trend === "down"
      ? "↓"
      : "•";

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/70 px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{metric.label}</span>
        <span className="text-xs">{trendLabel}</span>
      </div>
      <div className="text-lg font-semibold text-slate-50">{metric.value}</div>
      {metric.sublabel && (
        <div className="text-[11px] text-slate-400">{metric.sublabel}</div>
      )}
    </div>
  );
}

export default PulseTile;
