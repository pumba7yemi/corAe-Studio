"use client";
import React from "react";
import { usePulse } from "@/lib/hooks/usePulse";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border p-3 min-w-[110px] shadow-sm">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function PulseWidget() {
  const { data, loading } = usePulse(30000);

  const time = data?.timeSavedMin ?? 0;
  const flow = data?.flowRating ?? 0;
  const purpose = data?.purposeIndex ?? 50;

  // circle size/animation
  const pct = Math.max(0, Math.min(100, (flow + purpose) / 2));
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div className="w-full max-w-xl mx-auto grid gap-6">
      <div className="relative flex items-center justify-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="drop-shadow-sm">
          <circle cx="90" cy="90" r={radius} strokeWidth="12" className="stroke-gray-200 fill-none" />
          <circle
            cx="90"
            cy="90"
            r={radius}
            strokeWidth="12"
            className="fill-none"
            style={{
              stroke: "currentColor",
              color: pct > 80 ? "#f59e0b" : pct > 60 ? "#16a34a" : "#3b82f6",
              strokeDasharray: `${dash} ${circumference}`,
              strokeLinecap: "round",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              transition: "stroke-dasharray 600ms ease, color 600ms ease",
            }}
          />
          <text x="90" y="90" textAnchor="middle" dominantBaseline="middle" className="text-xl fill-gray-700">
            {loading ? "…" : `${pct.toFixed(0)}%`}
          </text>
        </svg>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Stat label="Time Saved" value={`${Math.round(time)}m`} />
        <Stat label="Flow Rating" value={`${Math.round(flow)}%`} />
        <Stat label="Purpose Index" value={`${Math.round(purpose)}%`} />
      </div>
    </div>
  );
}
