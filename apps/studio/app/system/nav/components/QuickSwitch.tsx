"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useNav } from "../hooks/useNav";

/**
 * QuickSwitch: small dropdown to jump between key areas. Shows the
 * `space` group (Studio / Ship / Shipped / Dockyard) when available.
 */
export default function QuickSwitch() {
  const { groupsMap } = useNav();
  const space = groupsMap?.space ?? [];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!space.length) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        title="Quick Switch"
      >
        Space
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-[1001]">
          <ul className="space-y-1">
            {space.map((it) => (
              <li key={`${it.id}:${it.path}`}>
                <Link
                  href={it.path as any}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}