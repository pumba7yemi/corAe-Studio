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

import React from "react";

type LinkProps = React.PropsWithChildren<{ href: string; className?: string }>;
const Link = ({ href, children, className }: LinkProps) => (
  <a href={href} className={className}>
    {children}
  </a>
);
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROUTES, ROUTE_META } from "@/app/system/nav/routes";

export default function NavBar() {
  const pathname = usePathname();

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

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <header className="sticky top-0 z-1000 border-b bg-white/80 dark:bg-neutral-950/70">
      <div className="ca-wrap flex items-center gap-4 py-2">
        {/* Left: brand + quick links */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="text-neutral-900 dark:text-neutral-50">corAe Studio</span>
          </Link>
          <Link
            href={ROUTES.home}
            className={[
              'hidden md:inline-block text-sm px-2 py-1 rounded-md',
              isActive(ROUTES.home) ? 'font-semibold text-neutral-900' : 'text-neutral-600 hover:text-neutral-900',
            ].join(' ')}
            aria-current={isActive(ROUTES.home) ? 'page' : undefined}
          >
            {ROUTE_META?.home?.label ?? 'Home'}
          </Link>

          <Link
            href={ROUTES.work}
            className={[
              'hidden md:inline-block text-sm px-2 py-1 rounded-md',
              isActive(ROUTES.work) ? 'font-semibold text-neutral-900' : 'text-neutral-600 hover:text-neutral-900',
            ].join(' ')}
            aria-current={isActive(ROUTES.work) ? 'page' : undefined}
          >
            {ROUTE_META?.work?.label ?? 'Work'}
          </Link>

          <Link
            href={ROUTES.business}
            className={[
              'hidden md:inline-block text-sm px-2 py-1 rounded-md',
              isActive(ROUTES.business) ? 'font-semibold text-neutral-900' : 'text-neutral-600 hover:text-neutral-900',
            ].join(' ')}
            aria-current={isActive(ROUTES.business) ? 'page' : undefined}
          >
            {ROUTE_META?.business?.label ?? 'Business'}
          </Link>

          <Link
            href={ROUTES.ascend}
            className={[
              'hidden md:inline-block text-sm px-2 py-1 rounded-md',
              isActive(ROUTES.ascend) ? 'font-semibold text-sky-600' : 'text-sky-500 hover:text-sky-400',
            ].join(' ')}
            aria-current={isActive(ROUTES.ascend) ? 'page' : undefined}
          >
            {ROUTE_META?.ascend?.label ?? 'Ascend'}
          </Link>
        </div>

        {/* Center: CAIA / System primary entry */}
        <div className="mx-auto">
          <Link href={ROUTES.system} className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
            {ROUTE_META.system.label}
          </Link>
        </div>

        {/* Right: space / dev / settings */}
        <div className="ml-auto flex items-center gap-3">
          <Link href={ROUTES.ship} className="text-sm text-neutral-600 hover:text-neutral-900">
            {ROUTE_META.ship.label}
          </Link>
          <Link href={ROUTES.dev} className="text-sm text-neutral-600 hover:text-neutral-900">
            {ROUTE_META.dev.label}
          </Link>
          <Link href="/settings" className="text-sm text-neutral-600 hover:text-neutral-900">
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}