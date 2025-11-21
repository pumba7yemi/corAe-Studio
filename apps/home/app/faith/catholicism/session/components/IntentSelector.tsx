'use client';
import React from 'react';

const INTENTS = [
  'provision','healing','protection','guidance','deliverance','vocation','family','business','debtRelief','housing','relationships'
];

export default function IntentSelector({ value, onChange }: { value?: string; onChange: (v?: string) => void }) {
  return (
    <div>
      <label htmlFor="intent">What is your prayer for?</label>
      <select id="intent" value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">-- choose an intent --</option>
        {INTENTS.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
    </div>
  );
}
