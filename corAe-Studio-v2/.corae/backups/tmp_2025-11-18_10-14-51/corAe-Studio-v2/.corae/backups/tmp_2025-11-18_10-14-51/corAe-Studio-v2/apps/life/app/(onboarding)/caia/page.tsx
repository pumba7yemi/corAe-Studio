"use client";
import { useEffect, useState } from 'react';

const steps = [
  { id: 1, title: 'What CAIA is', body: 'CAIA is a lightweight corridor assistant that enforces 150-logic and watches Cassandra gates.' },
  { id: 2, title: '150 Logic', body: 'We compute a score150 from historical run success rates. Targets: GREEN >=135, AMBER >=100.' },
  { id: 3, title: 'Cassandra (Truth Pattern)', body: 'Cassandra detects patterns and can forbid dangerous behaviours. CAIA consults these patterns.' },
  { id: 4, title: 'Nightly Self-Healing', body: 'Nightly green sweep runs build checks and snapshots CAIA health.' },
  { id: 5, title: 'Working With CAIA', body: 'You give quick daily check-ins; CAIA suggests alignment if needed.' }
];

export default function Onboarding() {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const ok = localStorage.getItem('caia_onboarding_complete');
    if (ok) setDone(true);
  }, []);

  function next() {
    if (idx < steps.length - 1) setIdx(idx + 1);
    else {
      localStorage.setItem('caia_onboarding_complete', 'true');
      setDone(true);
    }
  }

  if (done) return (<div className="p-6 bg-slate-800 rounded">Onboarding complete. Welcome back.</div>);

  const s = steps[idx];
  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded">
      <h2 className="text-xl font-semibold mb-2">{s.title}</h2>
      <p className="text-sm text-slate-300 mb-4">{s.body}</p>
      <div className="flex justify-between">
        <div className="text-xs text-slate-400">Step {idx+1} of {steps.length}</div>
        <button className="px-3 py-1 bg-sky-600 rounded" onClick={next}>{idx < steps.length -1 ? 'Next' : 'Finish'}</button>
      </div>
    </div>
  );
}
