'use client';
import React, { useState } from 'react';
const AudioLead: React.FC<{ text?: string }> = ({ text }) => {
  // Minimal inline fallback for the missing './AudioLead' module.
  // This placeholder renders the text and can be easily replaced by the real component.
  return (
    <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 4 }}>
      <div style={{ fontStyle: 'italic', color: '#555', marginBottom: 6 }}>Audio lead (placeholder)</div>
      <div>{text}</div>
    </div>
  );
};
import { buildTailoredPrayer, defaultPrep } from '../logic/have-you';

// Fallback LibraryPicker: simple inline stub to avoid missing module error.
// Props: onInsert receives a document { title: string }.
const LibraryPicker: React.FC<{ onInsert: (doc: { title: string }) => void }> = ({ onInsert }) => {
  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={() => onInsert({ title: 'Sample Library Item' })}
      >
        Insert Sample Library Item
      </button>
    </div>
  );
};

const PrepChecklist: React.FC<{ value: any; onChange: (v: any) => void }> = ({ value, onChange }) => {
  // Minimal local fallback to replace the missing './PrepChecklist' module.
  // Keeps shape simple: toggles boolean keys on an object-shaped prep value.
  const toggle = (key: string) => {
    const next = { ...(value ?? {}), [key]: !value?.[key] };
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <label>
        <input
          type="checkbox"
          checked={!!value?.prepared}
          onChange={() => toggle('prepared')}
        />
        Prepared
      </label>
      <label>
        <input
          type="checkbox"
          checked={!!value?.prayerReady}
          onChange={() => toggle('prayerReady')}
        />
        Prayer Ready
      </label>
    </div>
  );
};

type IntentSelectorProps = {
  value?: string;
  onChange: (v?: string) => void;
};

const IntentSelector: React.FC<IntentSelectorProps> = ({ value, onChange }) => {
  const options: { value?: string; label: string }[] = [
    { value: undefined, label: 'General' },
    { value: 'healing', label: 'Healing' },
    { value: 'guidance', label: 'Guidance' },
    { value: 'gratitude', label: 'Gratitude' },
  ];

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? undefined : v);
      }}
      aria-label="Select intent"
    >
      {options.map((opt) => (
        <option key={String(opt.value ?? '')} value={opt.value ?? ''}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

const Section: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: 12 }}>
    <h2 style={{ margin: '6px 0' }}>{title}</h2>
    <div>{children}</div>
  </section>
);

export default function SessionShell() {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<string | undefined>(undefined);
  const [prep, setPrep] = useState(() => defaultPrep());
  const [tailored, setTailored] = useState('');

  function next() {
    setStep((s) => Math.min(8, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <strong>Step {step} / 8</strong>
      </div>

      {step === 1 && <Section title="Opening">Sign of the Cross — Come, Holy Spirit.</Section>}
      {step === 2 && <Section title="Scripture">{/* stub */}Scripture reading and reflection.</Section>}
      {step === 3 && <Section title="Thanksgiving">Thanksgiving and reflections.</Section>}
      {step === 4 && (
        <Section title="Intent">
          <IntentSelector value={intent} onChange={(v) => { setIntent(v); setTailored(buildTailoredPrayer(v)); }} />
        </Section>
      )}
      {step === 5 && (
        <Section title="Grace Prep">
          <PrepChecklist value={prep} onChange={setPrep} />
        </Section>
      )}
      {step === 6 && (
        <Section title="Tailored Prayer">
          <AudioLead text={tailored || buildTailoredPrayer(intent)} />
        </Section>
      )}
      {step === 7 && <Section title="Intercessions">Pray for the Church, family, souls, saints.</Section>}
      {step === 8 && <Section title="Closing">Our Father, Hail Mary, Glory Be.</Section>}

      <div style={{ marginTop: 12 }}>
        <button onClick={prev} disabled={step === 1}>Back</button>
        <button onClick={next} style={{ marginLeft: 8 }}>{step === 8 ? 'Finish' : 'Next'}</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <LibraryPicker onInsert={(doc) => { setTailored((t) => `${t}\n\n[Inserted: ${doc.title}]`); }} />
      </div>
    </div>
  );
}
