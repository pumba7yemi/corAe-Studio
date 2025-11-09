"use client";

/**
 * corAe Ship • TopBar
 * - Desktop: "Business" has a dropdown with OMS, Pulse, Chrono.
 * - Mobile: no dropdowns; "Business" is a plain link to /ship/business (the hub page).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/app/system/nav/routes";

const R = {
  home: "/ship",
  businessHub: "/ship/business",   // mobile goes here
  oms: "/ship/business/oms",
  pulse: "/ship/work/pulse",
  chrono: "/ship/work/chrono",
  work: "/ship/work",
};

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-[1000] flex items-center justify-between
                 border-b border-neutral-200 bg-white/80 px-4 py-2.5
                 backdrop-blur supports-[backdrop-filter]:bg-white/60
                 dark:border-neutral-800 dark:bg-neutral-950/70"
    >
      {/* Brand */}
      <Link href={R.home as any} className="text-lg font-semibold tracking-tight">
        corAe • Ship
      </Link>

      {/* Desktop: primary links intentionally removed. Use overflow (⋮) for all navigation. */}
      <nav className="hidden items-center gap-4 md:flex">
        <div className="ml-auto relative" ref={undefined}>
          <OverflowMenu />
        </div>
      </nav>

      {/* Mobile nav: removed inline links; rely on bottom tabs / overflow */}
      <nav className="flex items-center gap-3 md:hidden">
        <OverflowMenu compact />
      </nav>
    </header>
  );
}

/* ====== building blocks ====== */
/* helper components removed: TopLink / Dropdown / MenuItem / SimpleLink —
   TopBar now uses a single overflow menu (⋮) to provide navigation. */

function OverflowMenu({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const items = Object.entries(ROUTES).map(([k, v]) => ({ href: v, label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()) }));
  const seen = new Set<string>();
  const list = items.filter(i => (seen.has(i.href) ? false : seen.add(i.href)));

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="More"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <span className="inline-block leading-none text-lg">⋮</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-[1001]">
          <ul className="max-h-72 overflow-auto">
            {list.map(it => {
              const active = pathname === it.href || pathname?.startsWith(it.href + '/');
              return (
                <li key={it.href}>
                  <Link
                    href={it.href as any}
                    onClick={() => setOpen(false)}
                    className={[
                      'block rounded-md px-3 py-2 text-sm',
                      active
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                        : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
                    ].join(' ')}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}