"use client";
import { useState } from "react";
export default function DemoRibbon() {
  const [show, set] = useState(true);
  if (!show) return null;
  return (
    <div className="fixed top-2 right-2 z-50 rounded-xl px-3 py-2 shadow text-xs bg-black/80 text-white">
      DEMO SANDBOX • no real writes
      <button className="ml-3 underline" onClick={() => set(false)}>hide</button>
    </div>
  );
}
