// apps/studio/src/components/obari/SchedulePicker.tsx
// OBARI — 28-day schedule picker for Orders (150.logic)

"use client";

import { useEffect, useMemo, useState } from "react";

type WeekRef = "W1" | "W2" | "W3" | "W4";

type HubPayload = {
  year: number;
  mode: "CYCLE_28";
  weekRef: WeekRef;
  label: string; // e.g., "2025-Wk37 Hub"
};

type ApiResp =
  | { ok: true; current: HubPayload; neighbors: HubPayload[] }
  | { ok: false; error: string };

export type SchedulePickerProps = {
  /** Current expectedWeek coming from the form (can be undefined for auto). */
  value?: WeekRef;
  /** Called whenever user chooses a week ref. */
  onChange: (week?: WeekRef) => void;
  /** Optional: show a clear button for "Auto". */
  allowAuto?: boolean;
  /** Condensed rendering when used in tight forms. */
  compact?: boolean;
};

export default function SchedulePicker({
  value,
  onChange,
  allowAuto = true,
  compact = false,
}: SchedulePickerProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [current, setCurrent] = useState<HubPayload | null>(null);
  const [neighbors, setNeighbors] = useState<HubPayload[]>([]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/obari/schedule/current", { cache: "no-store" });
      const data: ApiResp = await res.json();
      if (!data.ok) throw new Error(data.error);
      setCurrent(data.current);
      setNeighbors(data.neighbors);
    } catch (e: any) {
      setErr(e.message || "Failed to fetch schedule.");
    } finally {
      setLoading(false);
    }
  }

  const options = useMemo<WeekRef[]>(() => ["W1", "W2", "W3", "W4"], []);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="row items-center gap-2">
        <span className="small muted">Schedule:</span>
        {loading && <span className="small">Loading…</span>}
        {!loading && current && (
          <span className="small font-mono">{current.label}</span>
        )}
        {err && <span className="small text-red-500">⚠ {err}</span>}
        <button className="btn btn-xs" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <div className="row gap-2">
        {/* Quick picks: neighbors + current */}
        {neighbors.map((n, i) => (
          <button
            key={`${n.year}-${n.weekRef}-${i}`}
            className={`px-3 py-1 rounded-lg border text-sm ${
              value === n.weekRef ? "bg-surface border-ring" : "bg-card border-ring"
            }`}
            onClick={() => onChange(n.weekRef)}
            type="button"
            title={n.label}
          >
            {n.weekRef}
          </button>
        ))}
        {current && (
          <button
            className={`px-3 py-1 rounded-lg border text-sm ${
              value === current.weekRef ? "bg-surface border-ring" : "bg-card border-ring"
            }`}
            onClick={() => onChange(current.weekRef)}
            type="button"
            title={current.label}
          >
            {current.weekRef}
          </button>
        )}

        {/* Exact selection */}
        <select
          value={value ?? ""}
          onChange={(e) => onChange((e.target.value || undefined) as WeekRef | undefined)}
          className="border border-ring rounded-lg px-2 py-1 bg-card text-sm"
          aria-label="Expected week"
        >
          {allowAuto && <option value="">Auto</option>}
          {options.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        {allowAuto && (
          <button
            type="button"
            className="btn btn-xs"
            onClick={() => onChange(undefined)}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}