'use client';
// Lightweight CAIA voice layer using the Web Speech API (browser-only).
// Exports speak(text, opts?) and stopSpeaking().

type SpeakOpts = { rate?: number; pitch?: number; voiceName?: string; lang?: string };

// Pronunciation dictionary: patterns (regex) -> replacement
const PRONUNCIATION: [RegExp, string][] = [
  [/\bCAIA\b/gi, 'Kaya'],
  [/\bcorae\b/gi, 'kor-ay'],
];

let preferredVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

// Publicly exported display name for the voice assistant.
export const CAIA_NAME = 'Caia';

/**
 * Return available voices (name + lang) for UI selection.
 * Useful because available voices differ by browser/OS.
 */
export async function getAvailableVoices(): Promise<{ name: string; lang?: string }[]> {
  await loadVoices();
  return speechSynthesis
    .getVoices()
    .map((v) => ({ name: v.name, lang: v.lang }))
    .filter(Boolean);
}

function applyPronunciation(text: string) {
  return PRONUNCIATION.reduce((t, [re, sub]) => t.replace(re, sub), text);
}

function loadVoices(): Promise<void> {
  return new Promise((resolve) => {
    const onLoaded = () => {
      const voices = speechSynthesis.getVoices();
      // Prefer en-GB female if available, else any en-GB, else any en
      preferredVoice =
        // try en-GB first
        voices.find((v) => v.lang?.toLowerCase().startsWith('en-gb')) ||
        // then any en
        voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
        null;
      voicesLoaded = true;
      resolve();
    };

    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      onLoaded();
    } else {
      // Some browsers (Chrome) fire voiceschanged event
      window.speechSynthesis.onvoiceschanged = () => {
        onLoaded();
        window.speechSynthesis.onvoiceschanged = null;
      };
      // Fallback: resolve after a short timeout
      setTimeout(() => {
        if (!voicesLoaded) onLoaded();
      }, 500);
    }
  });
}

export async function speak(text: string, opts?: SpeakOpts) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API is not available in this environment.');
    return;
  }

  await loadVoices();

  const utter = new SpeechSynthesisUtterance(applyPronunciation(text));

  // Tone defaults: calm, slightly amused, purposeful
  utter.rate = opts?.rate ?? 0.95;
  utter.pitch = opts?.pitch ?? 1.05;
  utter.lang = opts?.lang ?? (preferredVoice?.lang ?? 'en-GB');

  // Prefer explicit voice name if provided
  if (opts?.voiceName) {
    const v = speechSynthesis.getVoices().find((x) => x.name === opts.voiceName);
    if (v) utter.voice = v;
  }

  if (!utter.voice && preferredVoice) utter.voice = preferredVoice;

  utter.volume = 1;

  utter.onend = () => {
    // Placeholder for subtle delight hooks later
  };
  utter.onerror = (e) => {
    console.warn('Speech synthesis error', e);
  };

  // Cancel any current speech to keep interactions snappy
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
}
