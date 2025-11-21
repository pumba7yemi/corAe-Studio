import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ScriptsBySphere = Record<string, { daily: string | null; haveYou: any; alignment: any }>;

export default function PersonScriptsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [scripts, setScripts] = useState<ScriptsBySphere | null>(null);
  const [tab, setTab] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/persons/${slug}/scripts`).then((r) => r.json()).then((j) => {
      if (j.ok) {
        setScripts(j.scripts);
        const keys = Object.keys(j.scripts || {});
        setTab(keys[0] || null);
      }
    });
  }, [slug]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl">Scripts for {slug}</h1>
      </header>

      <div className="flex gap-3">
        {scripts ? Object.keys(scripts).map((s) => (
          <button key={s} className={`px-3 py-1 rounded ${tab===s?'bg-neutral-200':''}`} onClick={()=>setTab(s)}>{s}</button>
        )) : <div>Loading…</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <h2 className="font-medium">Daily</h2>
          <div className="border rounded p-2 bg-black text-white font-mono text-sm">
            <pre>{tab && scripts ? scripts[tab]?.daily ?? 'No daily script' : 'Select a sphere'}</pre>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Badges</h3>
          <ul className="space-y-2">
            <li>CAIA Health: <span className="text-sm">unknown</span></li>
            <li>Have-You Engine: <span className="text-sm">unknown</span></li>
            <li>Build Confidence Meter: <span className="text-sm">unknown</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
