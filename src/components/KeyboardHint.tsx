// src/components/KeyboardHint.tsx
"use client";
import { useEffect, useState } from "react";

export default function KeyboardHint({
  combo = "⌘/Ctrl + K",
  delay = 1200,
}: { combo?: string; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!show) return null;
  return (
    <span className="ml-2 text-xs text-slate-500 border rounded px-2 py-0.5">
      {combo}
    </span>
  );
}