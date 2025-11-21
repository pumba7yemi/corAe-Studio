"use client";

/**
 * OBARI — Order › Schedule · 150.logic
 * Identify cadence (28-day / monthly / hybrid) and capture the working window.
 * - Tries /api/obari/schedule/current for server truth, falls back to client calc
 * - Persists selection to a flow token (cookie+sessionStorage) for the next steps
 * - Also stores a lightweight snapshot in sessionStorage for UI continuity
 */

import { useEffect, useMemo, useState } from "react";
import ArrowNav from "@/components/navigation/ArrowNav";
import {
  signFlowToken,
  type WeekRef,
  type ScheduleMode,
} from "@/lib/obari/flow-guard.client";

type CurrentScheduleDTO = {
  mode: ScheduleMode;
  label?: string | null;
  startDate: string; // ISO
  endDate: string;   // ISO
  weekRef?: WeekRef | null;
  month?: number | null; // 1..12
  year?: number | null;
};

function startOfWeekSunday(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay(); // 0..6
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - day);
  return dt;
}
function getCurrentWeekRef(base = new Date()): WeekRef {
  const sunday = startOfWeekSunday(base);
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const firstSunday =
    first.getDay() === 0
      ? startOfWeekSunday(first)
      : startOfWeekSunday(new Date(first.getTime() + (7 - first.getDay()) * 86400000));
  const deltaDays = Math.floor((sunday.getTime() - firstSunday.getTime()) / 86400000);
  const idx = Math.max(0, Math.floor(deltaDays / 7));
  return (`W${(idx % 4) + 1}` as WeekRef);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export default function ObariOrderSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ScheduleMode>("CYCLE_28");
  const [weekRef, setWeekRef] = useState<WeekRef>(getCurrentWeekRef());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // 1..12
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [startISO, setStartISO] = useState<string>("");
  const [endISO, setEndISO] = useState<string>("");
  const [label, setLabel] = useState<string>("");

  // Load current schedule (server), fallback (client)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/obari/schedule/current", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { ok: boolean; data?: CurrentScheduleDTO };
          if (data.ok && data.data && !cancelled) {
            const d = data.data;
            setMode(d.mode);
            if (d.weekRef) setWeekRef(d.weekRef);
            if (d.month) setMonth(d.month);
            if (d.year) setYear(d.year);
            setStartISO(d.startDate);
            setEndISO(d.endDate);
            setLabel(d.label ?? "");
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore → fallback below
      }
      if (!cancelled) {
        // Fallback: compute a 7-day window for the current week (CYCLE_28)
        const s = startOfWeekSunday(new Date());
        const e = addDays(s, 6);
        setMode("CYCLE_28");
        setWeekRef(getCurrentWeekRef());
        setStartISO(s.toISOString());
        setEndISO(e.toISOString());
        setLabel("");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Recompute dates when user changes the selection
  useEffect(() => {
    if (loading) return;
    if (mode === "CYCLE_28") {
      // Pick the 7-day block for the chosen weekRef within the current month anchor
      const today = new Date();
      const first = new Date(year || today.getFullYear(), (month ? month - 1 : today.getMonth()), 1);
      const firstSunday =
        first.getDay() === 0
          ? startOfWeekSunday(first)
          : startOfWeekSunday(new Date(first.getTime() + (7 - first.getDay()) * 86400000));
      const idx = { W1: 0, W2: 1, W3: 2, W4: 3 }[weekRef] ?? 0;
      const s = addDays(firstSunday, idx * 7);
      const e = addDays(s, 6);
      setStartISO(s.toISOString());
      setEndISO(e.toISOString());
      setLabel(`Wk ${weekRef}`);
    } else if (mode === "MONTHLY") {
      const s = new Date(year, month - 1, 1);
      const e = new Date(year, month, 0); // last day of month
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      setStartISO(s.toISOString());
      setEndISO(e.toISOString());
      setLabel(`${year}-${String(month).padStart(2, "0")}`);
    } else {
      // HYBRID: weekly ops with month-end finance → keep week window but carry month label
      const today = new Date();
      const first = new Date(year || today.getFullYear(), (month ? month - 1 : today.getMonth()), 1);
      const firstSunday =
        first.getDay() === 0
          ? startOfWeekSunday(first)
          : startOfWeekSunday(new Date(first.getTime() + (7 - first.getDay()) * 86400000));
      const idx = { W1: 0, W2: 1, W3: 2, W4: 3 }[weekRef] ?? 0;
      const s = addDays(firstSunday, idx * 7);
      const e = addDays(s, 6);
      setStartISO(s.toISOString());
      setEndISO(e.toISOString());
      setLabel(`HYBRID ${year}-${String(month).padStart(2, "0")} / ${weekRef}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, weekRef, month, year, loading]);

  const preview = useMemo(() => {
    if (!startISO || !endISO) return "—";
    const s = new Date(startISO);
    const e = new Date(endISO);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return `${fmt(s)} → ${fmt(e)}`;
  }, [startISO, endISO]);

  function persistSelection() {
    // Persist a UI snapshot for convenience
    const snap = {
      mode,
      weekRef: mode !== "MONTHLY" ? weekRef : null,
      month: mode !== "CYCLE_28" ? month : null,
      year: mode !== "CYCLE_28" ? year : null,
      startDate: startISO,
      endDate: endISO,
      label: label || null,
    };
    sessionStorage.setItem("obari.schedule.selection", JSON.stringify(snap));

    // And write the authoritative flow token for the next steps
    // Use a deterministic scheduleId for now (label+window); real impl would come from server.
    const scheduleId = `${mode}:${startISO.slice(0, 10)}:${endISO.slice(0, 10)}`;
    signFlowToken({
      scheduleId,
      scheduleMode: mode,
      expectedWeek: mode === "MONTHLY" ? getCurrentWeekRef(new Date(startISO)) : weekRef,
      prepDone: false,
    });
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — Schedule</h1>
        <p className="muted">Choose cadence and confirm the working window for this order flow.</p>
      </header>

      {/* Mode */}
      <section className="c-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Cadence</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="stack">
            <span className="small muted">Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ScheduleMode)}
              className="border border-ring rounded-lg p-2 bg-card"
              disabled={loading}
            >
              <option value="CYCLE_28">28-Day (W1..W4)</option>
              <option value="MONTHLY">Monthly</option>
              <option value="HYBRID">Hybrid (weekly ops, month finance)</option>
            </select>
          </label>

          {mode !== "MONTHLY" && (
            <label className="stack">
              <span className="small muted">Week</span>
              <select
                value={weekRef}
                onChange={(e) => setWeekRef(e.target.value as WeekRef)}
                className="border border-ring rounded-lg p-2 bg-card"
                disabled={loading}
              >
                <option value="W1">W1</option>
                <option value="W2">W2</option>
                <option value="W3">W3</option>
                <option value="W4">W4</option>
              </select>
            </label>
          )}

          {mode !== "CYCLE_28" && (
            <>
              <label className="stack">
                <span className="small muted">Month</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(Math.min(12, Math.max(1, Number(e.target.value || 1))))}
                  className="border border-ring rounded-lg p-2"
                  disabled={loading}
                />
              </label>
              <label className="stack">
                <span className="small muted">Year</span>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Math.max(1970, Number(e.target.value || new Date().getFullYear())))}
                  className="border border-ring rounded-lg p-2"
                  disabled={loading}
                />
              </label>
            </>
          )}
        </div>
      </section>

      {/* Preview */}
      <section className="c-card p-4 space-y-2">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="row gap-3 items-center">
          <div className="badge">{mode}</div>
          {mode !== "MONTHLY" && <div className="badge">{weekRef}</div>}
          {mode !== "CYCLE_28" && <div className="badge">{year}-{String(month).padStart(2, "0")}</div>}
          {label && <div className="badge">{label}</div>}
        </div>
        <div className="mt-2 small muted">Window: {preview}</div>
      </section>

      <div className="row justify-between items-center">
        <ArrowNav
          backHref="/obari/order/prep"
          nextHref="/obari/order"
          nextLabel="To Orders"
          onNext={persistSelection}
        >
          Step 1 of 7 — Schedule
        </ArrowNav>

        <button
          onClick={persistSelection}
          className="btn"
          disabled={loading || !startISO || !endISO}
          title="Save selection for the next step"
        >
          Save Selection
        </button>
      </div>
    </main>
  );
}
