"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from 'react';
import ArrowNav from '@/components/navigation/ArrowNav';

type WeekRef = "W1" | "W2" | "W3" | "W4";
type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";

export default function BdoSchedulePage() {
  const [mode, setMode] = useState<ScheduleMode>('CYCLE_28');
  const [weekRef, setWeekRef] = useState<WeekRef>('W1');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [label, setLabel] = useState<string>('');

  const [startDate, setStart] = useState<string>('');
  const [endDate, setEnd] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const start = new Date(today); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    setStart(start.toISOString()); setEnd(end.toISOString());
  }, []);

  function save() {
    const payload = { mode, weekRef, month, year, startDate, endDate, label: label || null };
    sessionStorage.setItem('bdo.schedule.selection', JSON.stringify(payload));
    alert('✅ Schedule saved for BDO');
  }

  return (
    <main className="p-6 space-y-6">
      <header className="stack">
        <h1 className="text-3xl font-bold">OBARI — BDO Schedule</h1>
        <p className="muted">Pick cadence and window. This snapshot will be used in BDO Prep/Order.</p>
      </header>

      <section className="c-card p-4 grid gap-3 md:grid-cols-3">
        <label className="stack">
          <span className="small muted">Mode</span>
          <select className="border rounded-lg p-2" value={mode} onChange={(e) => setMode(e.target.value as ScheduleMode)}>
            <option value="CYCLE_28">CYCLE_28</option>
            <option value="MONTHLY">MONTHLY</option>
            <option value="HYBRID">HYBRID</option>
          </select>
        </label>

        <label className="stack">
          <span className="small muted">Week (CYCLE_28)</span>
          <select className="border rounded-lg p-2" value={weekRef} onChange={(e) => setWeekRef(e.target.value as WeekRef)}>
            <option value="W1">W1</option><option value="W2">W2</option><option value="W3">W3</option><option value="W4">W4</option>
          </select>
        </label>

        <label className="stack">
          <span className="small muted">Label (optional)</span>
          <input className="border rounded-lg p-2" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Ramadan Cycle A" />
        </label>

        <label className="stack">
          <span className="small muted">Month (MONTHLY)</span>
          <input className="border rounded-lg p-2" type="number" value={month} onChange={(e) => setMonth(Number(e.target.value)||1)} />
        </label>

        <label className="stack">
          <span className="small muted">Year</span>
          <input className="border rounded-lg p-2" type="number" value={year} onChange={(e) => setYear(Number(e.target.value)||new Date().getFullYear())} />
        </label>

        <label className="stack">
          <span className="small muted">Start (ISO)</span>
          <input className="border rounded-lg p-2" type="datetime-local" value={startDate.slice(0,16)} onChange={(e) => setStart(new Date(e.target.value).toISOString())} />
        </label>

        <label className="stack">
          <span className="small muted">End (ISO)</span>
          <input className="border rounded-lg p-2" type="datetime-local" value={endDate.slice(0,16)} onChange={(e) => setEnd(new Date(e.target.value).toISOString())} />
        </label>

        <div className="row items-end">
          <button className="btn btn-primary" onClick={save}>Save Schedule</button>
        </div>
      </section>

      <ArrowNav backHref="/ship/business/oms/obari/thedeal/bdo/bdo-ready" nextHref="/ship/business/oms/obari/thedeal/bdo/prep" nextLabel="To BDO Prep">
        Step 2 of 3 — BDO Schedule
      </ArrowNav>
    </main> 
  );
}