"use client";

/**
 * corAe Ship • TopBar
 * - Desktop: "Business" has a dropdown with OMS, Pulse, Chrono.
 * - Mobile: no dropdowns; "Business" is a plain link to /ship/business (the hub page).
 */

// Lightweight local Link shim to avoid requiring the 'next/link' types at build time.
// This behaves like an anchor and preserves href/children/props used in this file.
const Link = ({ href, children, ...props }: any) => <a href={href as any} {...props}>{children}</a>;

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
      className="sticky top-0 z-1000 border-b border-neutral-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-neutral-800 dark:bg-neutral-950/70"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
        {/* Left: primary links (desktop) */}
        <nav className="hidden items-center gap-4 md:flex">
          <Link href={R.home} className={['px-3 py-2 rounded-md text-sm', pathname === R.home ? 'font-semibold' : 'text-neutral-700'].join(' ')}>Home</Link>
          <Link href={R.work} className={['px-3 py-2 rounded-md text-sm', pathname?.startsWith(R.work) ? 'font-semibold' : 'text-neutral-700'].join(' ')}>Work</Link>
          <BusinessDropdown currentPath={pathname} />
        </nav>

        {/* Center: brand */}
        <div className="flex-1 text-center">
          <Link href={R.home} className="text-lg font-semibold tracking-tight">corAe • Ship</Link>
        </div>

        {/* Right: overflow / mobile compact */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <OverflowMenu />
          </div>
          <div className="md:hidden">
            <OverflowMenu compact />
          </div>
        </div>
      </div>
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
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-1001">
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

function BusinessDropdown({ currentPath }: { currentPath?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'px-3 py-2 rounded-md text-sm',
          currentPath?.startsWith(R.businessHub) ? 'font-semibold' : 'text-neutral-700',
        ].join(' ')}
        aria-expanded={open}
      >
        Business
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-40 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-50">
          <ul>
            <li>
              <Link href={R.oms} className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">OMS</Link>
            </li>
            <li>
              <Link href={R.pulse} className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">Pulse</Link>
            </li>
            <li>
              <Link href={R.chrono} className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">Chrono</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}