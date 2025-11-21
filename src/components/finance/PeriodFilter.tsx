'use client';

import React, { useEffect, useState } from 'react';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from 'date-fns';

export type PeriodKind =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

export interface PeriodValue {
  kind: PeriodKind;
  from: string;
  to: string;
}

function toISO(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

export function computeRange(kind: PeriodKind, base = new Date()): PeriodValue {
  switch (kind) {
    case 'day': {
      const iso = toISO(base);
      return { kind, from: iso, to: iso };
    }
    case 'week': {
      return {
        kind,
        from: toISO(startOfWeek(base, { weekStartsOn: 1 })),
        to: toISO(endOfWeek(base, { weekStartsOn: 1 })),
      };
    }
    case 'month': {
      return {
        kind,
        from: toISO(startOfMonth(base)),
        to: toISO(endOfMonth(base)),
      };
    }
    case 'quarter': {
      const month = base.getMonth();
      const startQ = month - (month % 3);
      const start = new Date(base.getFullYear(), startQ, 1);
      const end = new Date(base.getFullYear(), startQ + 3, 0);
      return { kind, from: toISO(start), to: toISO(end) };
    }
    case 'year': {
      const start = new Date(base.getFullYear(), 0, 1);
      const end = new Date(base.getFullYear(), 11, 31);
      return { kind, from: toISO(start), to: toISO(end) };
    }
    default:
      return { kind, from: toISO(startOfMonth(base)), to: toISO(endOfMonth(base)) };
  }
}

export default function PeriodFilter({
  initial = 'month',
  value,
  onChange,
  fyStartMonth,
}: {
  initial?: PeriodKind;
  value?: PeriodValue;
  onChange: (v: PeriodValue) => void;
  fyStartMonth?: number;
}) {
  const [kind, setKind] = useState<PeriodKind>(value?.kind ?? initial);
  const [from, setFrom] = useState(value?.from ?? computeRange(initial).from);
  const [to, setTo] = useState(value?.to ?? computeRange(initial).to);

  useEffect(() => {
    onChange({ kind, from, to });
  }, [kind, from, to, onChange]);

  function handleQuickSet(next: PeriodKind) {
    setKind(next);
    const range = computeRange(next);
    setFrom(range.from);
    setTo(range.to);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-2 py-1 text-sm"
        value={kind}
        onChange={(e) => handleQuickSet(e.target.value as PeriodKind)}
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="quarter">Quarter</option>
        <option value="year">Financial Year</option>
        <option value="custom">Custom</option>
      </select>

      <input
        type="date"
        value={from}
        className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-2 py-1 text-sm"
        onChange={(e) => {
          setKind('custom');
          setFrom(e.target.value);
        }}
      />
      <span className="text-slate-400 text-xs">to</span>
      <input
        type="date"
        value={to}
        className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-2 py-1 text-sm"
        onChange={(e) => {
          setKind('custom');
          setTo(e.target.value);
        }}
      />
    </div>
  );
}