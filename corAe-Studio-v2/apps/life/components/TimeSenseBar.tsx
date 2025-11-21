"use client";

import React from "react";

type Props = {
  timesense?: {
    hasPlan: boolean;
    date: string | null;
    mode: string;
    blocks: number;
    aheadOfSchedule: boolean;
    behindSchedule: boolean;
    driftMode: string;
    minutesBehind: number;
    activeBlock: {
      id: string;
      label: string;
      status: string;
      start: string;
      end: string;
    } | null;
  };
};

export function TimeSenseBar({ timesense }: Props) {
  if (!timesense) return null;

  const {
    hasPlan,
    date,
    mode,
    blocks,
    aheadOfSchedule,
    behindSchedule,
    driftMode,
    minutesBehind,
    activeBlock,
  } = timesense;

  const statusLabel = !hasPlan
    ? "No plan for today"
    : activeBlock
    ? `Now: ${activeBlock.label}`
    : "Between blocks";

  const modeLabel =
    driftMode === "behind"
      ? `Behind by ${minutesBehind} min`
      : driftMode === "at-risk"
      ? `At risk (+${minutesBehind} min)`
      : aheadOfSchedule
      ? "Ahead of schedule"
      : behindSchedule
      ? "Was behind (recovered)"
      : "On track";

  const bg =
    driftMode === "behind"
      ? "bg-red-500/80"
      : driftMode === "at-risk"
      ? "bg-amber-500/80"
      : aheadOfSchedule
      ? "bg-emerald-500/80"
      : "bg-sky-500/80";

  return (
    <div className={`rounded-xl px-4 py-2 text-xs text-white ${bg}`}>
      <div className="flex justify-between gap-2">
        <div className="font-semibold">TimeSense • {date ?? "No date"}</div>
        <div className="opacity-80">Mode: {mode} • Blocks: {blocks}</div>
      </div>
      <div className="mt-1 flex justify-between gap-2">
        <div>{statusLabel}</div>
        <div className="opacity-90">{modeLabel}</div>
      </div>
    </div>
  );
}
