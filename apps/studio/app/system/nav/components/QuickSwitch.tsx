"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ROUTES } from "../routes";

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
    { title: "Home & Work", items: [ROUTES.home, ROUTES.work] },
    { title: "Business & System", items: [ROUTES.business, ROUTES.system] },
    { title: "Space", items: [ROUTES.spaceStudio, ROUTES.spaceShip, ROUTES.spaceShipped, ROUTES.spaceDockyard] },
    { title: "Dev & Tools", items: [ROUTES.dev] },
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
                {g.items.map((r: any) => (
                  <li key={r.path}>
                    <Link
                      href={r.path as any}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}