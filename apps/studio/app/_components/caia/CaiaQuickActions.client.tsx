"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Lightweight floating CAIA quick-actions UI.
// Single-file, client-only. Uses window.__CAIA when available.

export default function CaiaQuickActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    // load snapshot
    try {
      const raw = localStorage.getItem("caia:telemetry");
      setTelemetry(raw ? JSON.parse(raw) : []);
    } catch (_) {
      setTelemetry([]);
    }
    try {
      const raw = localStorage.getItem("caia:pref");
      setPrefs(raw ? JSON.parse(raw) : {});
    } catch (_) {
      setPrefs({});
    }
  }, []);

  function refresh() {
    try {
      const raw = localStorage.getItem("caia:telemetry");
      setTelemetry(raw ? JSON.parse(raw) : []);
    } catch (_) {
      setTelemetry([]);
    }
    try {
      const raw = localStorage.getItem("caia:pref");
      setPrefs(raw ? JSON.parse(raw) : {});
    } catch (_) {
      setPrefs({});
    }
  }

  function speakSample() {
    const txt = "Hello — this is CAIA. I am here to gently assist.";
    try {
      window.__CAIA?.speak?.(txt);
      window.__CAIA?.quickAction?.("speakSample", { text: txt });
    } catch (e) {
      // best-effort
      console.debug("CAIA quickAction speak failed", e);
    }
  }

  function openChronological() {
    // call provider hook if present
    window.__CAIA?.quickAction?.("openChronological");
    // conservative route: try to open a known route
    try {
      router.push("/ship/_shared/script/chronological");
    } catch (_) {
      // fallback to window location
      window.location.href = "/ship/_shared/script/chronological";
    }
  }

  function openDevExplorer() {
    window.__CAIA?.quickAction?.("openDevExplorer");
    router.push("/dev/explorer");
  }

  function snoozeAll() {
    // minimal local-only snooze flag — callers (chronological page) can interpret this.
    const until = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    localStorage.setItem("caia:chronological:snooze:all", until);
    window.__CAIA?.quickAction?.("snoozeAll", { until });
    window.__CAIA?.notify?.("Snoozed Have-You script for 1 hour");
    refresh();
  }

  function clearTelemetry() {
    localStorage.removeItem("caia:telemetry");
    refresh();
  }

  return (
    <div aria-hidden={false}>
      <button
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="CAIA quick actions"
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: "#0b74ff",
          color: "white",
          border: "none",
          boxShadow: "0 6px 20px rgba(11,116,255,0.2)",
          zIndex: 2000,
          cursor: "pointer",
        }}
      >
        CAIA
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="CAIA quick actions"
          style={{
            position: "fixed",
            right: 18,
            bottom: 88,
            width: 320,
            maxHeight: 420,
            background: "white",
            color: "#111",
            borderRadius: 8,
            padding: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            zIndex: 2000,
            overflow: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>CAIA</strong>
            <div>
              <button onClick={refresh} style={{ marginRight: 8 }}>Refresh</button>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>

          <hr style={{ margin: "8px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={speakSample} aria-label="Speak sample">Speak sample</button>
            <button onClick={openChronological} aria-label="Open Chronological script">Open Chronological</button>
            <button onClick={openDevExplorer} aria-label="Open Dev Explorer">Open Dev Explorer</button>
            <button onClick={snoozeAll} aria-label="Snooze all Have-You">Snooze Have-You (1h)</button>
          </div>

          <hr style={{ margin: "8px 0" }} />

          <details>
            <summary>Telemetry ({telemetry.length})</summary>
            <div style={{ fontSize: 12, marginTop: 8 }}>
              <button onClick={clearTelemetry} style={{ marginBottom: 8 }}>Clear telemetry</button>
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}>
                {telemetry.length ? JSON.stringify(telemetry.slice(-20).reverse(), null, 2) : "(no telemetry)"}
              </pre>
            </div>
          </details>

          <details style={{ marginTop: 8 }}>
            <summary>Prefs</summary>
            <div style={{ fontSize: 12, marginTop: 8 }}>
              <pre style={{ whiteSpace: "pre-wrap" }}>{prefs ? JSON.stringify(prefs, null, 2) : "(no prefs)"}</pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
