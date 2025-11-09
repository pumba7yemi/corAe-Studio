"use client";

import React, { useEffect, useState } from "react";
import { speak, stopSpeaking, CAIA_NAME, getAvailableVoices } from "../lib/voice/caiaVoice";

export default function VoiceTestPage() {
  const [playing, setPlaying] = useState(false);
  const [voices, setVoices] = useState<{ name: string; lang?: string }[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('caia.voice') : null;
    } catch { return null; }
  });

  const handleSpeak = async () => {
    setPlaying(true);
    await speak(`Hello from ${CAIA_NAME} — your calm, joyful operating intelligence.`, { voiceName: selectedVoice ?? undefined });
    // best-effort flip back after a short time
    setTimeout(() => setPlaying(false), 1800);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await getAvailableVoices();
        if (!mounted) return;
        setVoices(v);
        // if no selection, try to auto-pick a likely Scottish/female voice by heuristics
        if (!selectedVoice) {
          const prefer = v.find((x) => /scot|scotland|fiona|kirsty|karen/i.test(x.name) || /en-?gb/i.test(x.lang || ''));
          if (prefer) setSelectedVoice(prefer.name);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      if (selectedVoice) localStorage.setItem('caia.voice', selectedVoice);
      else localStorage.removeItem('caia.voice');
    } catch {}
  }, [selectedVoice]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ marginBottom: 8 }}>{CAIA_NAME} Voice — Test</h1>
      <p style={{ marginTop: 0 }}>Press the button to hear {CAIA_NAME} pronounce her name as “Kaya”.</p>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Voice selection (browser dependent)</label>
        <select
          value={selectedVoice ?? ''}
          onChange={(e) => setSelectedVoice(e.target.value || null)}
          style={{ padding: '6px 8px', borderRadius: 6 }}
        >
          <option value="">(browser default)</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} — {v.lang}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={handleSpeak} disabled={playing} aria-pressed={playing}>
          {playing ? "Playing…" : "Play greeting"}
        </button>

        <button
          onClick={() => {
            stopSpeaking();
            setPlaying(false);
          }}
        >
          Stop
        </button>
      </div>
    </main>
  );
}
