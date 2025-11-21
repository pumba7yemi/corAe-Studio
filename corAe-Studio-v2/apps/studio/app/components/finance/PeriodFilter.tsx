import React from 'react';

export type PeriodValue = { kind: 'day'|'week'|'month'|'quarter'|'year'|'custom'; from: string; to: string };

export function computeRange(kind: PeriodValue['kind'] = 'month'): PeriodValue {
  const now = new Date();
  const pad = (d: Date) => d.toISOString().slice(0,10);
  if (kind === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { kind, from: pad(from), to: pad(to) };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = now;
  return { kind, from: pad(from), to: pad(to) };
}

export default function PeriodFilter({ value, onChange, fyStartMonth }: { value: PeriodValue; onChange: (v: PeriodValue) => void; fyStartMonth?: number }) {
  return (
    <div className="flex items-center gap-2">
      <input type="date" value={value.from} onChange={e => onChange({ ...value, from: e.target.value })} className="rounded-md border px-2 py-1 bg-transparent" />
      <span className="text-sm opacity-70">to</span>
      <input type="date" value={value.to} onChange={e => onChange({ ...value, to: e.target.value })} className="rounded-md border px-2 py-1 bg-transparent" />
    </div>
  );
}
