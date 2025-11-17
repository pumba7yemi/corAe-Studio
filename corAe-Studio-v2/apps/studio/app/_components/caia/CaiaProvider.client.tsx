"use client";

import React, { useEffect } from "react";

// Lightweight client-only CAIA provider placeholder.
// Exposes a safe, minimal window.__CAIA API for other client components to use.

type CaiaApi = {
  open: () => void;
  close: () => void;
  speak: (text: string) => void;
  notify: (message: string) => Promise<{ ok: boolean }>;
  quickAction: (action: string, payload?: any) => void;
  getPrefs: () => any;
  setPref: (k: string, v: any) => void;
  getTelemetry: () => any[];
};

const PREF_KEY = "caia:pref";
const TELEMETRY_KEY = "caia:telemetry";

declare global {
  interface Window {
    __CAIA?: Partial<CaiaApi>;
  }
}

function readPrefs() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("CAIA: failed reading prefs", e);
    return {};
  }
}

function writePref(k: string, v: any) {
  try {
    const p = readPrefs();
    p[k] = v;
    localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch (e) {
    console.warn("CAIA: failed writing pref", e);
  }
}

function pushTelemetry(evt: any) {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ts: new Date().toISOString(), evt });
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(arr));
  } catch (e) {
    // non-blocking
  }
}

export default function CaiaProvider() {
  useEffect(() => {
    // expose a safe, minimal API only on the client
    if (!window.__CAIA) {
      const api: Partial<CaiaApi> = {
        open: () => {
          console.debug("CAIA.open() called");
          pushTelemetry({ type: "open" });
        },
        close: () => {
          console.debug("CAIA.close() called");
          pushTelemetry({ type: "close" });
        },
        speak: (text: string) => {
          try {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              const u = new SpeechSynthesisUtterance(text);
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(u);
            } else {
              console.debug("speechSynthesis not available — CAIA.speak fallback:", text);
            }
            pushTelemetry({ type: "speak", text });
          } catch (e) {
            console.warn("CAIA.speak error", e);
          }
        },
        notify: async (message: string) => {
          console.debug("CAIA.notify():", message);
          pushTelemetry({ type: "notify", message });
          // no-op stub: return success so callers can await
          return { ok: true };
        },
        quickAction: (action: string, payload?: any) => {
          console.debug("CAIA.quickAction", action, payload);
          pushTelemetry({ type: "quickAction", action, payload });
        },
        getPrefs: () => readPrefs(),
        setPref: (k: string, v: any) => writePref(k, v),
        getTelemetry: () => {
          try {
            const raw = localStorage.getItem(TELEMETRY_KEY);
            return raw ? JSON.parse(raw) : [];
          } catch (e) {
            return [];
          }
        },
      };

      // attach as non-writable if possible
      try {
        Object.defineProperty(window, "__CAIA", {
          value: api,
          configurable: true,
          writable: false,
        });
      } catch (e) {
        // fallback
        window.__CAIA = api;
      }
    }

    return () => {
      // leave telemetry/history in place; remove reference only if it was our object
      // don't aggressively delete in case other code relies on it during hot reload.
    };
  }, []);

  // Provider renders an offscreen anchor node. The visible UI (quick-actions, etc.) will be separate.
  // Provider renders an offscreen anchor node. The visible UI (quick-actions, etc.) will be separate.
  return React.createElement("div", { id: "caia-root", "aria-hidden": "true", style: { display: "none" } });
}
