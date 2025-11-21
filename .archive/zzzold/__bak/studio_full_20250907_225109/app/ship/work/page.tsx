'use client';
import CaiaCard from '@/components/CaiaCard';

export default function ShipWork() {
  const tasks = [
    { id: 1, title: 'Kickoff white-label AL-AMBA', due: 'today' },
    { id: 2, title: 'Sync POS integration', due: 'tomorrow' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">💼 Work</h1>
      <p className="opacity-70">Tasks, projects, 3cuDTD diaries.</p>

      <ul className="space-y-2">
        {tasks.map(t => (
          <li key={t.id} className="rounded-xl border p-3 shadow flex justify-between">
            <span>{t.title}</span>
            <span className="text-xs opacity-70">{t.due}</span>
          </li>
        ))}
      </ul>

      <CaiaCard href="/ship/caia" label="🧠 CAIA (Ship)" subtitle="Work-aware assistant" />
    </div>
  );
}