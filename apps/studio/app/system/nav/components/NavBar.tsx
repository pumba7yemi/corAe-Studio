"use client";

/**
 * corAe NavBar™
 * ------------------------------------------------------
 * Top navigation for the Studio environment.
 * Now includes:
 *  • corAe logo / title
 *  • optional search or CAIA space (placeholder)
 *  • QuickSwitch™ button for jumping between
 *    new Business Pages ↔ Classic Business View
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/app/system/nav/routes";
import { LANDING, DEFAULT_AREA_ORDER, DEFAULT_LANDING } from "@/app/landing/landingConfig";

export default function NavBar() {
  const pathname = usePathname();

  // Build overflow list from landing areas (so users can pick Home/Business/Work)
  // and then from ROUTES. Landing area links use the configured default
  // landing slug (DEFAULT_LANDING) so selecting an area goes to the
  // classic/extra page by default.
  const overflowList = (() => {
    const items: { href: string; label: string }[] = [];

    // Add landing area shortcuts first (Home / Business / Work)
    try {
      for (const area of DEFAULT_AREA_ORDER) {
        const defaultSlug = DEFAULT_LANDING?.[area] ?? (LANDING[area]?.[0]?.slug ?? 'pulse');
        const href = `/landing/${area}/${defaultSlug}`;
        const label = area.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/^./, (s) => s.toUpperCase());
        items.push({ href, label });
      }
    } catch (e) {
      // fallback: ignore landing area population if config is missing
    }

    // Then append selected ROUTES entries (include space shortcuts first)
    const prioritized = [
      'space',
      'spaceStudio',
      'spaceShip',
      'spaceShipped',
      'spaceDockyard',
    ];
    for (const key of prioritized) {
      const v = (ROUTES as any)[key];
      if (v) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/^./, (s) => s.toUpperCase());
        items.push({ href: v, label });
      }
    }
    // then append the rest
    for (const [k, v] of Object.entries(ROUTES as Record<string, string>)) {
      if (prioritized.includes(k)) continue;
      const label = k.replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').replace(/^./, (s) => s.toUpperCase());
      items.push({ href: v, label });
    }

    const seen = new Set<string>();
    return items.filter((i) => (seen.has(i.href) ? false : seen.add(i.href)));
  })();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-[1000] border-b bg-white/80 dark:bg-neutral-950/70">
      <div className="ca-wrap flex items-center gap-4 py-2">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="text-neutral-900 dark:text-neutral-50">corAe Studio</span>
        </Link>

        {/* Primary navigation intentionally omitted here. Navigation is
            provided from the overflow menu (three-dot) only to simplify
            the top bar and keep a single entry point. */}

        {/* spacer + quick actions */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block text-xs text-neutral-500">CAIA active • Pulse Synced</div>

          {/* QuickSwitch removed: use the overflow (three-dot) menu for Business navigation */}

          {/* Overflow menu: vertical dots (single entry point) */}
          <div className="relative" ref={menuRef}>
            <button
              aria-label="More"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <span className="inline-block leading-none text-lg">⋮</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-[1001]">
                <ul className="max-h-72 overflow-auto">
                  {overflowList.map((it) => {
                    const active = pathname === it.href || pathname?.startsWith(it.href + "/");
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href as any}
                          onClick={() => setMenuOpen(false)}
                          className={[
                            "block rounded-md px-3 py-2 text-sm",
                            active
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                              : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                          ].join(" ")}
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
        </div>

        {/* Mobile links removed from the top bar — mobile navigation is
            handled elsewhere (MobileTabs / MobileTabsWrapper). */}
      </div>
    </header>
  );
}