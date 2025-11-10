'use client';
import React, { useRef, useState } from 'react';

export default function AudioLead({ text }: { text?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);

  function speak() {
    if (!synthRef.current || !('SpeechSynthesisUtterance' in window)) {
      console.warn('TTS not available in this environment');
      return;
    }
    const utter = new SpeechSynthesisUtterance(text || '');
    // Prefer British female if available
    const voices = synthRef.current.getVoices();
    const preferred = voices.find((v) => /en-?gb|british/i.test(v.lang) && /female/i.test(v.name)) || voices.find((v) => /en-?gb/i.test(v.lang));
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    synthRef.current.speak(utter);
  }

  function stop() {
    synthRef.current?.cancel();
    setSpeaking(false);
  }

  return (
    <div>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => speak()} disabled={speaking}>Play</button>
        <button onClick={() => stop()} style={{ marginLeft: 8 }}>Stop</button>
      </div>
    </div>
  );
}
