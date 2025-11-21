"use client";

import React, { useEffect, useState } from "react";

// Monkey steps:
// 1. Save this file to: apps/studio/app/components/demo/DemoSwitch.tsx
// 2. Import and render the <DemoSwitch /> component in a convenient client area (e.g. app layout or tooling panel).
// 3. Toggle to POST { state: 'on'|'off' } to /api/demo/toggle and a convenience cookie will be set for UX.

type DemoState = "on" | "off" | "unknown";

async function postToggle(state: "on" | "off") {
  const res = await fetch("/api/demo/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  return res.json();
}

function readDemoCookie(): DemoState {
  if (typeof document === "undefined") return "unknown";
  const m = document.cookie.match(/(?:^|; )demo_state=(on|off)/);
  return m ? (m[1] as DemoState) : "unknown";
}

function setDemoCookie(state: "on" | "off") {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `demo_state=${state}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

export default function DemoSwitch() {
  const [state, setState] = useState<DemoState>("unknown");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = readDemoCookie();
    if (s === "unknown") setState("off");
    else setState(s);
  }, []);

  const handleToggle = async () => {
    const next = state === "on" ? "off" : "on";
    setLoading(true);
    try {
      const json = await postToggle(next);
      if (json?.ok) {
        setState(next);
        setDemoCookie(next);
      } else {
        console.error("Demo toggle failed:", json);
      }
    } catch (e) {
      console.error("Demo toggle error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>Demo</div>
      <button
        onClick={handleToggle}
        disabled={loading}
        aria-pressed={state === "on"}
        style={{
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid #e6eef8",
          background: state === "on" ? "#ecfdf5" : "#fff",
          color: state === "on" ? "#065f46" : "#374151",
          cursor: loading ? "wait" : "pointer",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {loading ? "..." : state === "on" ? "DEMO ON" : "demo off"}
      </button>
    </div>
  );
}
