"use client";
import { useEffect, useState } from 'react';

export default function CaiaDailyPulse() {
  const [shown, setShown] = useState(false);
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    try {
      const done = localStorage.getItem('caia_daily_done');
      const hour = new Date().getHours();
      if (!done && hour >= 6) setShown(true);
    } catch (e) {}
  }, []);

  async function submit(v: string) {
    setValue(v);
    try {
      await fetch('/api/caia/daily', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feeling: v }) });
      localStorage.setItem('caia_daily_done', new Date().toISOString());
      setShown(false);
    } catch (e) {
      // ignore
    }
  }

  if (!shown) return null;
  return (
    <div className="p-4 bg-slate-800 rounded mb-4">
      <div className="mb-2">Before we begin… how are you feeling today?</div>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={() => submit('good')}>Good</button>
        <button className="px-3 py-1 bg-sky-600 text-white rounded" onClick={() => submit('ok')}>Ok</button>
        <button className="px-3 py-1 bg-yellow-600 text-black rounded" onClick={() => submit('stressed')}>Stressed</button>
        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => submit('unwell')}>Unwell</button>
      </div>
    </div>
  );
}
