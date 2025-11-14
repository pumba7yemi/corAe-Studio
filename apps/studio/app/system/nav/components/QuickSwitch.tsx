"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ROUTES, ROUTE_META } from "../routes";

/**
 * QuickSwitch: small dropdown to jump between key Classic areas.
 */
export default function QuickSwitch() {
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

  const groups = [
    { title: "Home & Work", items: ["home", "work"] },
    { title: "Business & System", items: ["business", "system"] },
    { title: "Space", items: ["spaceStudio", "spaceShip", "spaceShipped", "spaceDockyard"] },
    { title: "Dev & Tools", items: ["dev", "dev-atlas"] },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        title="Quick Switch"
      >
        Quick
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-[1001]">
          {groups.map((g) => (
            <div key={g.title} className="mb-2">
              <div className="px-3 text-xs font-semibold text-neutral-500">{g.title}</div>
              <ul className="space-y-1">
                {g.items.map((k: any) => {
                  const path = (ROUTES as any)[k];
                  const meta = (ROUTE_META as any)[k] ?? { label: k };
                  return (
                    <li key={path}>
                      <Link
                        href={path as any}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        {meta.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}