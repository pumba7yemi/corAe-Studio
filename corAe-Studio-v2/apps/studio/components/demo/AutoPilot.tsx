"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Step = { url: string; pauseMs?: number; action?: () => Promise<void> | void; label?: string; };

const STEPS: Step[] = [
  { url: "/home", label: "Home Overview", pauseMs: 1000 },
  { url: "/home/faith", label: "Home â€¢ Faith", pauseMs: 1000 },
  { url: "/home/tasks", label: "Home â€¢ Tasks", pauseMs: 1000, action: async () => {
      await fetch("/api/home/demo/tasks", { method: "POST", body: JSON.stringify({ title: "Greet customers (Demo)" }) });
    } },
  { url: "/work/diary", label: "Work â€¢ 3Â³ Diary", pauseMs: 1000 },
  { url: "/work/cims", label: "Work â€¢ CIMS", pauseMs: 1000 },
  { url: "/business/obari", label: "Business â€¢ OBARI", pauseMs: 1000 },
  { url: "/business/pos", label: "Business â€¢ POS", pauseMs: 1000 },
];

export default function AutoPilot() {
  const r = useRouter();
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);
  const t = useRef<number | null>(null);

  useEffect(() => {
    if (!running) { if (t.current) window.clearTimeout(t.current); return; }
    const s = STEPS[i];
    if (!s) { setRunning(false); return; }
    r.push(s.url);
    (async () => { if (s.action) await s.action(); })();
    t.current = window.setTimeout(() => setI(x => x + 1), s.pauseMs ?? 1000);
    return () => { if (t.current) window.clearTimeout(t.current); };
  }, [running, i, r]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur rounded-2xl shadow p-3">
      <div className="text-sm font-medium">Auto-Pilot (Demo)</div>
      <div className="mt-1 text-xs text-gray-600">Step {Math.min(i+1, STEPS.length)} / {STEPS.length}</div>
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-1 rounded-lg border" onClick={()=>{ setI(0); setRunning(true); }}>Start</button>
        <button className="px-3 py-1 rounded-lg border" onClick={()=>setRunning(false)}>Pause</button>
        <button className="px-3 py-1 rounded-lg border" onClick={()=>{ setI(0); setRunning(false); }}>Reset</button>
      </div>
    </div>
  );
}

