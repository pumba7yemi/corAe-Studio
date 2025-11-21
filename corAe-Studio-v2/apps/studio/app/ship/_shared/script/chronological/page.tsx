"use client";

import React, { useEffect, useRef, useState } from "react";

type ScriptStep = { id: string; time?: string | null; text: string; source?: string };

export default function ChronologicalScriptPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<ScriptStep[]>([]);
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const liveRef = useRef<HTMLDivElement | null>(null);

  const PREF_KEY = 'caia:chronological:pref';
  const SNOOZE_ALL_KEY = 'caia:chronological:snooze:all';

  const [snoozedAllUntil, setSnoozedAllUntil] = useState<Date | null>(null);
  const [showSnoozeBanner, setShowSnoozeBanner] = useState(false);

  // helper storage helpers for snooze/reschedule per step
  const snoozeKey = (id: string) => `caia:chronological:snooze:${id}`;
  const rescheduleKey = (id: string) => `caia:chronological:reschedule:${id}`;

  useEffect(() => {
    // load prefs
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(PREF_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          if (typeof p.ttsEnabled === 'boolean') setTtsEnabled(p.ttsEnabled);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/script/chronological');
        const json = await res.json();
        if (!mounted) return;
        // handle possible shapes from API
        if (Array.isArray(json)) setScript(json as ScriptStep[]);
        else if (json?.items) setScript(json.items as ScriptStep[]);
        else if (json?.script) setScript(json.script as ScriptStep[]);
        else if (json?.ok && Array.isArray(json.script)) setScript(json.script as ScriptStep[]);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load script');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    // check global snooze-all flag
    try {
      if (typeof window !== 'undefined') {
        const rawAll = window.localStorage.getItem(SNOOZE_ALL_KEY);
        if (rawAll) {
          const ts = Number(rawAll);
          if (ts && Date.now() < ts) {
            const dt = new Date(ts);
            if (mounted) {
              setSnoozedAllUntil(dt);
              setShowSnoozeBanner(true);
            }
          } else {
            // expired
            window.localStorage.removeItem(SNOOZE_ALL_KEY);
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ignore shortcuts when focusing form controls
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;

      // navigation
      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') return next();
      if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') return prev();

      // action shortcuts relative to current index
      if (e.key === ' ' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        return toggleSpeak();
      }
      if (e.key === 'd' || e.key === 'D') return doNowAction(script[index]?.id);
      if (e.key === 'r' || e.key === 'R') return rescheduleAction(script[index]?.id);
      if (e.key === 'z' || e.key === 'Z') return snoozeAction(script[index]?.id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // dependencies intentionally omitted for stable listener
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script, index, speaking]);

  function navigateTo(i: number) {
    const clamped = Math.max(0, Math.min((script.length || 1) - 1, i));
    setIndex(clamped);
    announce(script[clamped]?.text || '');
  }
  function next() { navigateTo(index + 1); }
  function prev() { navigateTo(index - 1); }

  function announce(text: string) {
    if (!liveRef.current) return;
    // brief clear then set to ensure AT picks up changes
    liveRef.current.textContent = '';
    setTimeout(() => { if (liveRef.current) liveRef.current.textContent = text; }, 50);
  }

  function toggleSpeak() {
    if (speaking) return stopSpeak();
    const s = script[index];
    if (!s) return;
    speakText(s.text);
  }

  function speakText(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('SpeechSynthesis not available in this browser');
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      announce(text);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  // CAIA controls: snooze/reschedule/do-now helpers
  function isSnoozed(id: string) {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem(snoozeKey(id));
      if (!raw) return false;
      const ts = Number(raw);
      if (!ts) return false;
      return Date.now() < ts;
    } catch {
      return false;
    }
  }

  function getSnoozeUntil(id: string) {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(snoozeKey(id));
      if (!raw) return null;
      const ts = Number(raw);
      if (!ts) return null;
      return new Date(ts);
    } catch {
      return null;
    }
  }

  function setSnooze(id: string, until: Date) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(snoozeKey(id), String(until.getTime()));
  }

  function clearSnooze(id: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(snoozeKey(id));
  }

  function getReschedule(id: string) {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(rescheduleKey(id));
      return raw ? new Date(raw) : null;
    } catch {
      return null;
    }
  }

  function setReschedule(id: string, dt: Date) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(rescheduleKey(id), dt.toISOString());
  }

  // user actions
  // legacy quick snooze: if called programmatically (keyboard), use default minutes
  function snoozeAction(id: string, quickMins = 60) {
    if (!id) return;
    const m = Number(quickMins) || 60;
    const until = new Date(Date.now() + m * 60000);
    setSnooze(id, until);
    // if this is the current step, advance
    if (script[index]?.id === id) next();
    announce(`Snoozed step until ${until.toLocaleString()}`);
  }

  // legacy quick reschedule via prompt (kept for keyboard), otherwise use inline editor
  function rescheduleAction(id: string, isoDefault?: string) {
    if (!id) return;
    const cur = getReschedule(id) || script.find(s => s.id === id)?.time ? new Date(String(script.find(s => s.id === id)?.time)) : null;
    const iso = isoDefault ?? prompt('Enter new date/time ISO (YYYY-MM-DDTHH:MM) or full ISO string', cur ? cur.toISOString().slice(0,16) : '');
    if (!iso) return;
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return alert('Invalid date/time');
    setReschedule(id, dt);
    announce(`Rescheduled step to ${dt.toLocaleString()}`);
  }

  // Inline editor state
  const [editingSnoozeFor, setEditingSnoozeFor] = useState<string | null>(null);
  const [snoozeMinutesDraft, setSnoozeMinutesDraft] = useState<number>(60);
  const [editingRescheduleFor, setEditingRescheduleFor] = useState<string | null>(null);
  const [rescheduleDraft, setRescheduleDraft] = useState<string>('');

  function openSnoozeEditor(id: string) {
    setEditingSnoozeFor(id);
    setSnoozeMinutesDraft(60);
  }

  function confirmSnooze(id: string) {
    const m = Number(snoozeMinutesDraft) || 0;
    if (!m || m <= 0) return alert('Invalid minutes');
    const until = new Date(Date.now() + m * 60000);
    setSnooze(id, until);
    if (script[index]?.id === id) next();
    setEditingSnoozeFor(null);
    announce(`Snoozed step until ${until.toLocaleString()}`);
  }

  function openRescheduleEditor(id: string) {
    setEditingRescheduleFor(id);
    const cur = getReschedule(id) || (script.find(s => s.id === id)?.time ? new Date(String(script.find(s => s.id === id)?.time)) : null);
    // populate draft in datetime-local format
    if (cur) {
      // yyyy-MM-ddTHH:mm
      const iso = cur.toISOString();
      setRescheduleDraft(iso.slice(0,16));
    } else {
      const nowIso = new Date().toISOString();
      setRescheduleDraft(nowIso.slice(0,16));
    }
  }

  function confirmReschedule(id: string) {
    if (!rescheduleDraft) return alert('No date/time provided');
    const dt = new Date(rescheduleDraft);
    if (isNaN(dt.getTime())) return alert('Invalid date/time');
    setReschedule(id, dt);
    setEditingRescheduleFor(null);
    announce(`Rescheduled step to ${dt.toLocaleString()}`);
  }

  function doNowAction(id: string) {
    const i = script.findIndex(s => s.id === id);
    if (i >= 0) {
      setIndex(i);
      const s = script[i];
      if (ttsEnabled && s?.text) speakText(s.text);
      announce('Doing now: ' + (script[i]?.text || '').slice(0, 120));
    }
  }

  function toggleTtsPref() {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(PREF_KEY, JSON.stringify({ ttsEnabled: next }));
    } catch {}
  }

  function unsnoozeAll() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SNOOZE_ALL_KEY);
        setSnoozedAllUntil(null);
        setShowSnoozeBanner(false);
        announce('Have-You script unsnoozed');
        // telemetry hook
        try { window.__CAIA?.quickAction?.('unsnoozeAll'); } catch {}
      }
    } catch {}
  }

  function stopSpeak() {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    } finally {
      setSpeaking(false);
    }
  }

  if (loading) return <div className="p-4">Loading chronological script…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      {/* Global snooze-all banner */}
      {showSnoozeBanner && snoozedAllUntil && (
        <div role="status" aria-live="polite" className="mb-3 p-3 rounded bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <strong className="block">Have-You script snoozed</strong>
              <div className="text-sm">Chronological script notifications are snoozed until {snoozedAllUntil.toLocaleString()}.</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => { setShowSnoozeBanner(false); announce('Keeping snoozed'); }}>Keep snoozed</button>
              <button className="btn btn-primary btn-sm" onClick={() => unsnoozeAll()}>Unsnooze now</button>
            </div>
          </div>
        </div>
      )}
      <h2 className="text-lg font-semibold">Chronological Script — Have-You Order</h2>
  <p className="text-sm text-muted">Keyboard: ←/n previous • →/p next • Space/S toggle speak • d do-now • z snooze • r reschedule</p>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted">Steps: {script.length}</div>
          <div className="flex items-center gap-2">
            <label className="text-sm">TTS</label>
            <button onClick={toggleTtsPref} className={`btn btn-sm ${ttsEnabled ? 'btn-primary' : 'btn-ghost'}`}>{ttsEnabled ? 'On' : 'Off'}</button>
          </div>
        </div>

        <ol role="list" className="list-decimal pl-6 space-y-3 mt-3">
          {script.map((s, i) => {
            const snoozed = isSnoozed(s.id);
            const snoozeUntil = getSnoozeUntil(s.id);
            const rescheduled = getReschedule(s.id);
            const displayTime = rescheduled ? rescheduled : s.time ? new Date(s.time) : null;
            return (
              <li
                key={s.id}
                role="listitem"
                aria-current={i === index ? 'true' : undefined}
                tabIndex={0}
                onKeyDown={(e) => {
                  // Enter = do now, Space = speak this step
                  if (e.key === 'Enter') return doNowAction(s.id);
                  if (e.key === ' ') {
                    e.preventDefault();
                    setIndex(i);
                    if (ttsEnabled) toggleSpeak();
                  }
                }}
                className={`p-2 rounded ${i === index ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-sm font-medium">{s.text}</div>
                    {displayTime && <div className="text-xs text-muted">{new Date(displayTime).toLocaleString()}</div>}
                    {snoozed && snoozeUntil && <div className="text-xs text-yellow-600">Snoozed until {snoozeUntil.toLocaleString()}</div>}
                    {rescheduled && <div className="text-xs text-green-600">Rescheduled to {rescheduled.toLocaleString()}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button aria-label={`Do now: ${s.text.slice(0,40)}`} onClick={() => doNowAction(s.id)} className="btn btn-sm">Do Now</button>
                    <button aria-label={`Snooze: ${s.text.slice(0,40)}`} onClick={() => openSnoozeEditor(s.id)} className="btn btn-sm">Snooze</button>
                    <button aria-label={`Reschedule: ${s.text.slice(0,40)}`} onClick={() => openRescheduleEditor(s.id)} className="btn btn-ghost btn-sm">Reschedule</button>
                    <button aria-label={`Speak: ${s.text.slice(0,40)}`} onClick={() => { setIndex(i); if (ttsEnabled) toggleSpeak(); }} className="btn btn-sm">Speak</button>
                    <button aria-label={`Focus: ${s.text.slice(0,40)}`} onClick={() => setIndex(i)} className="btn btn-ghost btn-sm">Focus</button>
                  </div>
                  {/* inline editors */}
                  <div style={{ minWidth: 240 }}>
                    {editingSnoozeFor === s.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs">Minutes</label>
                        <input
                          aria-label="Snooze minutes"
                          type="number"
                          min={1}
                          value={snoozeMinutesDraft}
                          onChange={(e) => setSnoozeMinutesDraft(Number(e.target.value))}
                          className="input input-sm"
                          style={{ width: 100 }}
                        />
                        <button onClick={() => confirmSnooze(s.id)} className="btn btn-sm">Confirm</button>
                        <button onClick={() => setEditingSnoozeFor(null)} className="btn btn-ghost btn-sm">Cancel</button>
                      </div>
                    )}

                    {editingRescheduleFor === s.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs">When</label>
                        <input
                          aria-label="Reschedule date/time"
                          type="datetime-local"
                          value={rescheduleDraft}
                          onChange={(e) => setRescheduleDraft(e.target.value)}
                          className="input input-sm"
                          style={{ width: 220 }}
                        />
                        <button onClick={() => confirmReschedule(s.id)} className="btn btn-sm">Confirm</button>
                        <button onClick={() => setEditingRescheduleFor(null)} className="btn btn-ghost btn-sm">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={prev} className="btn">Previous</button>
        <button onClick={toggleSpeak} className="btn">{speaking ? 'Stop' : 'Speak Current'}</button>
        <button onClick={next} className="btn">Next</button>
      </div>

      <div aria-live="polite" aria-atomic="true" ref={liveRef} className="sr-only mt-2" />
    </div>
  );
}
