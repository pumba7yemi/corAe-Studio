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

export default function NavBar() {
  const pathname = usePathname();

  // Classic layout: left logo + Home/Work quick links, center CAIA/System, right space/dev/settings
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

  return (
    <header className="sticky top-0 z-[1000] border-b bg-white/80 dark:bg-neutral-950/70">
      <div className="ca-wrap flex items-center gap-4 py-2">
        {/* Left: brand + quick links */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="text-neutral-900 dark:text-neutral-50">corAe Studio</span>
          </Link>
          <Link href={(ROUTES.home as any).path} className="hidden md:inline-block text-sm text-neutral-600 hover:text-neutral-900">
            {(ROUTES.home as any).label}
          </Link>
          <Link href={(ROUTES.work as any).path} className="hidden md:inline-block text-sm text-neutral-600 hover:text-neutral-900">
            {(ROUTES.work as any).label}
          </Link>
        </div>

        {/* Center: CAIA / System primary entry */}
        <div className="mx-auto">
          <Link href={(ROUTES.system as any).path} className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
            {(ROUTES.system as any).label}
          </Link>
        </div>

        {/* Right: space / dev / settings */}
        <div className="ml-auto flex items-center gap-3">
          <Link href={(ROUTES.ship as any).path} className="text-sm text-neutral-600 hover:text-neutral-900">
            {(ROUTES.ship as any).label}
          </Link>
          <Link href={(ROUTES.dev as any).path} className="text-sm text-neutral-600 hover:text-neutral-900">
            {(ROUTES.dev as any).label}
          </Link>
          <Link href="/settings" className="text-sm text-neutral-600 hover:text-neutral-900">
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}