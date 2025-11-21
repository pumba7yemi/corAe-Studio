"use client";
import React from "react";
import type { PulseTimelineItem } from "@corae/pulse-core-v2";

interface Props {
  items: PulseTimelineItem[];
}

export function PulseTimeline({ items }: Props) {
  if (!items?.length) return null;

  return (
    <div className="mt-6 rounded-2xl bg-slate-900/60 border border-slate-700/70 p-4">
      <div className="text-xs font-semibold text-slate-300 mb-3">Today Timeline</div>
      <div className="space-y-2 text-xs text-slate-300">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-14 text-slate-400">{item.time}</div>
            <div className="flex-1">
              <div>{item.label}</div>
              {item.channel && (
                <div className="text-[11px] text-slate-500">{item.channel}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PulseTimeline;
