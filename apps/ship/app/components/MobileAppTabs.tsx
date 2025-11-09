"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function MobileAppTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/landing/home/pulse", label: "Home", color: "bg-sky-600" },
    { href: "/landing/business/pulse", label: "Business", color: "bg-emerald-600" },
    { href: "/landing/work/pulse", label: "Work", color: "bg-violet-600" },
  ];

  return (
    <nav
      aria-label="Ship bottom nav"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/60 dark:bg-neutral-950/80 dark:border-neutral-800"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-center gap-6">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname?.startsWith(t.href + "/");
          const dotBase = "block w-3 h-3 rounded-full transition-all transform";
          const dotClass = active ? `${t.color} scale-125 shadow-lg` : `bg-neutral-300 hover:scale-110`;
          const labelClass = active ? 'text-neutral-900 dark:text-neutral-100 font-medium' : 'text-neutral-600 dark:text-neutral-400';

          return (
            <Link key={t.href} href={t.href as any} className="inline-flex flex-col items-center gap-1">
              <span className={[dotBase, dotClass].join(' ')} aria-hidden />
              <span className={["text-xs leading-none", labelClass].join(' ')}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
