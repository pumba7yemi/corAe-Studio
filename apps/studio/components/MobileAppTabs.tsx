"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ShoppingCart } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ROUTES } from "@/app/system/nav/routes";

/**
 * MobileAppTabs — bottom navigation bar for corAe OS²
 * ----------------------------------------------------
 * - Responsive (shows only on mobile)
 * - Highlights the active route
 * - Uses lucide-react icons
 * - Safe-area aware for notched devices
 */

export default function MobileAppTabs() {
  const pathname = usePathname();

  // Primary tabs (kept compact for mobile) — rest available under "More"
  const items = [
    { href: "/", label: "Home", icon: House, testId: "tab-home" },
    { href: ROUTES.pos ?? "/pos", label: "POS", icon: ShoppingCart, testId: "tab-pos" },
    // Business removed from primary tabs — use the More (overflow) menu (three-dots)
  ];

  const overflowItems = [
    { href: ROUTES.cims ?? "/cims", label: "CIMS" },
    { href: ROUTES.finance ?? "/finance", label: "Finance" },
    { href: ROUTES.automate ?? "/automate", label: "Automate" },
    { href: ROUTES.reserve ?? "/reserve", label: "Reserve" },
  ];

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

  return (
    <nav
      role="navigation"
      aria-label="corAe App Tabs"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-950/80 dark:border-neutral-800"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
        {items.map(({ href, label, icon: Icon, testId }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href as any}
                data-testid={testId}
                aria-label={label}
                className={[
                  "group flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition",
                  active
                    ? "bg-neutral-900 text-white shadow dark:bg-white dark:text-neutral-950"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white",
                ].join(" ")}
              >
                <Icon className={["h-5 w-5", active ? "scale-110" : "opacity-80 group-hover:opacity-100"].join(" ")} />
                <span className="mt-1 leading-none">{label}</span>
              </Link>
            </li>
          );
        })}

        {/* More / overflow */}
        <li ref={moreRef} className="relative">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="More"
            className="inline-flex h-full w-full items-center justify-center rounded-xl px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            <span className="h-5 w-5 inline-block text-lg leading-none">⋯</span>
            <span className="sr-only">More</span>
          </button>

          {moreOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg border bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <ul className="space-y-1">
                {overflowItems.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href as any}
                      onClick={() => setMoreOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}