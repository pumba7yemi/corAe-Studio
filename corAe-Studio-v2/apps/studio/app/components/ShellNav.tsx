"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/app/system/nav/routes";

const links = [
  { href: "/morning-exec", label: "Morning Exec" },
  { href: "/shipyard", label: "Shipyard" },
  { href: "/shipped", label: "Shipped" },
  { href: "/updates", label: "Updates" },
  { href: "/health", label: "Health" },
];

export default function ShellNav() {
  const pathname = usePathname() || "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const overflow = [
    // BusinessPages removed from inline nav; available via overflow menu
    { href: ROUTES.pos, label: "POS" },
    { href: ROUTES.finance, label: "Finance" },
    { href: ROUTES.cims, label: "CIMS" },
    { href: ROUTES.automate, label: "Automate" },
    { href: ROUTES.reserve, label: "Reserve" },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white/60 p-3 dark:border-neutral-800 dark:bg-neutral-950/50 md:block">
      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Studio</div>

      <ul className="space-y-1">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`group block rounded-lg px-2 py-2 text-sm transition ${
                  active
                    ? "bg-neutral-900 text-white shadow dark:bg-white dark:text-neutral-950"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}

        {/* Overflow / More menu (vertical-dots trigger) */}
        <li ref={moreRef} className="pt-2">
          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="w-full rounded-md border border-neutral-200 px-2 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              aria-expanded={moreOpen}
              aria-label="More"
            >
              <span className="inline-block text-lg leading-none">⋮</span>
            </button>

            {moreOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <ul className="space-y-1">
                  {overflow.map((o) => (
                    <li key={o.href}>
                      <Link
                        href={o.href as any}
                        onClick={() => setMoreOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        {o.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </li>
      </ul>
    </aside>
  );
}
