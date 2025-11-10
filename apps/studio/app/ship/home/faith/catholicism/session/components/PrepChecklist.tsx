'use client';
import React from 'react';

const ITEMS = [
  { key: 'confessionRecent', label: 'Been to confession recently' },
  { key: 'forgiveOthers', label: 'Forgiven others' },
  { key: 'restitutionPlanned', label: 'Planned restitution' },
  { key: 'removeOccultSuperstition', label: 'Removed occult/superstition' },
  { key: 'fastingOrAlmsgiving', label: 'Fasting or almsgiving' },
  { key: 'reconciliationAttempted', label: 'Sought reconciliation' },
  { key: 'gratitudePracticed', label: 'Practiced gratitude' },
  { key: 'scriptureMeditated', label: 'Meditated on scripture' },
  { key: 'humilityAndTrust', label: 'Centered in humility & trust' },
];

export default function PrepChecklist({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  function toggle(key: string) {
    const next = { ...(value || {}) };
    next[key] = !next[key];
    onChange(next);
    if (!next.confessionRecent && !next.forgiveOthers) {
      // gentle toast - for scaffold purposes we use console.warn
      console.warn('Consider confession and forgiveness as part of preparation');
    }
  }

  return (
    <div>
      {ITEMS.map((it) => (
        <div key={it.key} style={{ marginBottom: 6 }}>
          <label>
            <input type="checkbox" checked={!!value?.[it.key]} onChange={() => toggle(it.key)} />{' '}
            {it.label}
          </label>
        </div>
      ))}
    </div>
  );
}
