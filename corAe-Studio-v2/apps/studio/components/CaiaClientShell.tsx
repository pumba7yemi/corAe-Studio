"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * CaiaClientShell
 * - Shows a pulsing CAIA presence on every page
 * - Uses the Web Speech API to announce status (muted by default on unsupported envs)
 * - Provides a focus toggle that hides the global nav (adds/removes `caia-focus` class)
 */
export default function CaiaClientShell() {
  const [muted, setMuted] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [autonomy, setAutonomy] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  const append = (msg: string) => setLog((s) => [new Date().toLocaleTimeString() + " â€” " + msg, ...s].slice(0, 10));

  const speak = (text: string) => {
    try {
      if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      // ignore
    }
  };

  

  useEffect(() => {
    append("CAIA initialized");
    // Announce presence once on mount
    setTimeout(() => speak("CAIA online and listening."), 300);

    // periodic status ping (non-blocking)
    intervalRef.current = window.setInterval(() => {
      const msg = "CAIA heartbeat";
      append(msg);
      speak(msg);
    }, 30000) as unknown as number;

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current as number);
      try {
        window.speechSynthesis?.cancel();
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bootstrap autonomy pref from localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem('caia:autonomy');
      setAutonomy(v === '1');
    } catch (_) {}
  }, []);

  // persist autonomy
  useEffect(() => {
    try {
      localStorage.setItem('caia:autonomy', autonomy ? '1' : '0');
    } catch (_) {}
  }, [autonomy]);

  // toggle site-wide focus mode: add/remove class on documentElement
  const toggleFocus = () => {
    const root = document.documentElement;
    const is = root.classList.toggle("caia-focus");
    append(is ? "CAIA focus mode on" : "CAIA focus mode off");
    if (!muted) speak(is ? "Focus mode enabled. Hiding UI." : "Focus mode disabled.");
  };

  return (
    <div aria-hidden={false} className="caia-shell" style={{ position: "fixed", right: 18, bottom: 18, zIndex: 9999 }}>
      <div
        role="button"
        aria-label="CAIA control"
        title="Open CAIA controls"
        onClick={() => setOpen((v) => !v)}
        className="caia-bubble"
        style={{
          width: 56,
          height: 56,
          borderRadius: 9999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(2,6,23,0.5)",
          background: "radial-gradient(circle at 30% 30%, #7dd3fc, #0369a1)",
          cursor: "pointer",
          animation: "caia-pulse 2.2s infinite",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="rgba(255,255,255,0.06)" />
          <path d="M8 12h8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      {open ? (
        <div
          className="caia-panel"
          style={{
            width: 320,
            maxWidth: "calc(100vw - 48px)",
            background: "rgba(10,10,10,0.9)",
            color: "white",
            padding: 12,
            marginTop: 8,
            borderRadius: 12,
            boxShadow: "0 20px 40px rgba(2,6,23,0.6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <strong>CAIA</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn"
                onClick={() => {
                  setMuted((m) => !m);
                  append((!muted ? "Muted" : "Unmuted") + " by user");
                }}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
              <button
                className="btn"
                onClick={() => {
                  toggleFocus();
                }}
              >
                Focus
              </button>
                <button
                  className="btn"
                  onClick={() => {
                    setAutonomy((a) => !a);
                    append(!autonomy ? 'Autonomy enabled' : 'Autonomy disabled');
                  }}
                  title="Gentle autonomy: allow CAIA to make gentle timed reminders"
                >
                  {autonomy ? 'Autonomy On' : 'Autonomy Off'}
                </button>
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 13, color: "#cbd5e1" }}>
            <div>Status: <span style={{ color: "#86efac" }}>online</span></div>
            <div style={{ marginTop: 8, maxHeight: 160, overflow: "auto" }}>
              {log.length === 0 ? <div className="muted">No events yet.</div> : null}
              <ul style={{ paddingLeft: 14, marginTop: 6 }}>
                {log.map((l, i) => (
                  <li key={i} style={{ fontSize: 12, opacity: 0.9 }}>{l}</li>
                ))}
              </ul>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="btn"
                onClick={() => speak("This is CAIA speaking. If you hear me, audio is enabled.")}
              >
                Speak
              </button>
              <button
                className="btn"
                onClick={() => {
                  append("Manual ping");
                  speak("Manual ping from CAIA.");
                }}
              >
                Ping
              </button>

              {/* Guide-me: fetch wizard snapshot and walk user through plan */}
              <GuideControls speak={speak} append={append} />
            </div>
          </div>
        </div>
      ) : null}

      <style>{`\n        @keyframes caia-pulse {\n          0% { transform: scale(1); box-shadow: 0 6px 18px rgba(2,6,23,0.4); }\n          50% { transform: scale(1.06); box-shadow: 0 10px 28px rgba(2,6,23,0.55); }\n          100% { transform: scale(1); box-shadow: 0 6px 18px rgba(2,6,23,0.4); }\n        }\n        /* When focus mode is active, hide common nav elements to make CAIA the center */\n        .caia-focus nav, .caia-focus header, .caia-focus .nav, .caia-focus .navbar, .caia-focus .brand, .caia-focus .TopBar {\n          display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;\n        }\n      `}</style>
    </div>
  );
}

/**
 * GuideControls â€” small client component embedded in CAIA panel.
 * Props: speak(text) and append(log) are functions from the parent.
 */
function GuideControls({
  speak,
  append,
}: {
  speak: (t: string) => void;
  append: (m: string) => void;
}) {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Array<{ id: string; text: string; time?: string }>>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  function scopeFromPath() {
    try {
      const p = typeof window !== "undefined" ? window.location.pathname : "/";
      if (p.includes("/business")) return "business";
      if (p.includes("/work")) return "work";
      if (p.includes("/home")) return "home";
      return "home";
    } catch (_) {
      return "home";
    }
  }

  async function fetchScript() {
    const scope = scopeFromPath();
    append(`Fetching chronological script for ${scope}`);
    try {
      const res = await fetch(`/api/script/chronological?scope=${encodeURIComponent(scope)}`);
      const json = await res.json();
      const script = Array.isArray(json?.script) ? json.script : [];
      // normalize into {id, text, time}
      // apply local overrides (reschedule/snooze) stored in localStorage
      let overrides: Record<string, string> = {};
      try { overrides = JSON.parse(localStorage.getItem('caia:overrides') || '{}'); } catch (_) { overrides = {}; }
      const normalized = script.map((s: any, i: number) => {
        const id = s.id || `s-${i}`;
        const baseTime = s.time || undefined;
        const over = overrides[id];
        return { id, text: s.text || String(s), time: over || baseTime };
      });
      setSteps(normalized);
      append(`Loaded ${normalized.length} script items`);
      return normalized;
    } catch (e: any) {
      append("Failed to load script: " + String(e));
      return [];
    }
  }

  function speakIndex(i: number, list = steps) {
    const s = list[i];
    if (!s) return;
    const text = s.time ? `${s.text} (scheduled at ${s.time})` : s.text;
    append(`Guide: ${text}`);
    speak(text);
    setIndex(i);
  }

  // Persist an override for step id -> ISO time (localStorage) and optionally POST to server
  async function persistOverride(stepId: string, isoTime: string | null) {
    try {
      const raw = localStorage.getItem('caia:overrides') || '{}';
      const obj = JSON.parse(raw || '{}');
      if (isoTime) obj[stepId] = isoTime; else delete obj[stepId];
      localStorage.setItem('caia:overrides', JSON.stringify(obj));
    } catch (_) {}
    // non-blocking server save (best-effort)
    try {
      await fetch('/api/script/chronological/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: stepId, time: isoTime }),
      });
      append('Saved override to server');
    } catch (e: any) {
      append('Server override save failed: ' + String(e));
    }
  }

  async function startGuide() {
    if (running) return;
    const loaded = await fetchScript();
    if (!loaded || loaded.length === 0) {
      return;
    }
    setIndex(0);
    setRunning(true);

    // speak first immediately
    speakIndex(0, loaded);

    // advance every 8s
    timerRef.current = window.setInterval(() => {
      setIndex((cur) => {
        const next = cur + 1;
        if (next >= loaded.length) {
          stopGuide();
          return cur;
        }
        speakIndex(next, loaded);
        return next;
      });
    }, 8000) as unknown as number;
  }

  function stopGuide() {
    setRunning(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current as number);
      timerRef.current = null;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch (_) {}
    append("Guide stopped");
  }

  function prev() {
    const prevIndex = Math.max(0, index - 1);
    setIndex(prevIndex);
    speakIndex(prevIndex);
  }

  function next() {
    const nextIndex = Math.min(steps.length - 1, index + 1);
    setIndex(nextIndex);
    speakIndex(nextIndex);
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button className="btn" onClick={() => { if (!running) startGuide(); else stopGuide(); }}>
        {running ? "Stop Guide" : "Guide me"}
      </button>
      <button className="btn" onClick={prev} disabled={steps.length === 0} title="Previous">
        â—€
      </button>
      <button className="btn" onClick={next} disabled={steps.length === 0} title="Next">
        â–¶
      </button>
      <div style={{ fontSize: 12, color: "#cbd5e1" }}>{steps.length > 0 ? `${Math.max(0, index + 1)}/${steps.length}` : "â€”"}</div>
      {/* Current step quick actions: Do Now, Snooze, Reschedule */}
      {steps.length > 0 && (
        <div style={{ marginLeft: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ maxWidth: 220 }} className="text-xs">{steps[index]?.text}</div>
          <button className="btn btn-sm" onClick={() => { speakIndex(index); persistOverride(steps[index].id, null); }}>Do Now</button>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-sm" onClick={() => { const t = new Date(Date.now() + 5*60*1000).toISOString(); persistOverride(steps[index].id, t); append('Snoozed 5m'); setTimeout(()=>speakIndex(index), 5*60*1000); }}>Snooze 5m</button>
            <button className="btn btn-sm" onClick={() => { const t = new Date(Date.now() + 15*60*1000).toISOString(); persistOverride(steps[index].id, t); append('Snoozed 15m'); setTimeout(()=>speakIndex(index), 15*60*1000); }}>Snooze 15m</button>
            <button className="btn btn-sm" onClick={() => { const t = new Date(Date.now() + 60*60*1000).toISOString(); persistOverride(steps[index].id, t); append('Snoozed 1h'); setTimeout(()=>speakIndex(index), 60*60*1000); }}>Snooze 1h</button>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-sm" onClick={() => {
              const d = new Date(); d.setHours(8,0,0,0); const t = d.toISOString(); persistOverride(steps[index].id, t); append('Rescheduled to Morning');
            }}>Morning</button>
            <button className="btn btn-sm" onClick={() => {
              const d = new Date(); d.setHours(13,0,0,0); const t = d.toISOString(); persistOverride(steps[index].id, t); append('Rescheduled to Afternoon');
            }}>Afternoon</button>
            <button className="btn btn-sm" onClick={() => {
              const d = new Date(); d.setHours(18,0,0,0); const t = d.toISOString(); persistOverride(steps[index].id, t); append('Rescheduled to Evening');
            }}>Evening</button>
          </div>
        </div>
      )}
    </div>
  );
}

