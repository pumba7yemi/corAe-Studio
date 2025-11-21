'use client';
import React, { useState } from 'react';
// Local lightweight Section component to avoid a missing-module error for ./Section
function Section({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 12 }}>
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </section>
  );
}
import IntentSelector from './IntentSelector';
function PrepChecklist({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  // lightweight local stub to avoid missing-module error; mirrors a simple checklist API
  return (
    <div style={{ paddingLeft: 4 }}>
      <label>
        <input
          type="checkbox"
          checked={!!value?.ready}
          onChange={() => onChange({ ...(value || {}), ready: !value?.ready })}
        />
        {' '}Ready for grace
      </label>
    </div>
  );
}
function AudioLead({ text }: { text?: string }) {
  return (
    <div style={{ padding: 8, border: '1px dashed #ccc' }}>
      {text}
    </div>
  );
}
import LibraryPicker from './LibraryPicker';
import { buildTailoredPrayer, defaultPrep } from '../logic/have-you';

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
        <LibraryPicker onInsert={(doc: { title: string }) => { setTailored((t) => `${t}\n\n[Inserted: ${doc.title}]`); }} />
      </div>
    </div>
  );
}
