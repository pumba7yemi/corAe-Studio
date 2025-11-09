"use client";
import { useEffect, useState } from "react";

export function CaiaDock({ onOpen }: { onOpen: () => void }) {
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => setHint(true), 1200);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [onOpen]);

  return (
    <button
      onClick={onOpen}
      className="fixed bottom-5 right-5 z-50 rounded-full px-4 py-2 shadow-lg border bg-white hover:bg-slate-50"
      aria-label="Open CAIA"
    >
      CAIA
      <span className="ml-2 text-xs text-slate-500 border px-2 py-0.5 rounded hidden md:inline">
        ⌘/Ctrl K
      </span>
      {hint && (
        <span className="absolute -top-8 right-0 text-xs bg-black text-white px-2 py-1 rounded">
          Press ⌘/Ctrl+K
        </span>
      )}
    </button>
  );
}