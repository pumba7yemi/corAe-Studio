// apps/studio/src/components/BottomDock.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type DockItem = {
  label: string;
  href: string;
  emoji?: string;
};

const LEFT: DockItem[] = [
  { label: "Business", href: "/ship/business", emoji: "🏢" },
  { label: "Work",     href: "/ship/work",     emoji: "🛠️" },
  { label: "Home",     href: "/ship/home",     emoji: "🏠" },
];

const CENTER: DockItem[] = [
  { label: "POS",     href: "/pos",       emoji: "🧾" },
  { label: "Finance", href: "/finance",   emoji: "💸" },
  { label: "CIMS",    href: "/cims",      emoji: "💬" },
];

const RIGHT: DockItem[] = [
  { label: "Schema",  href: "/schema-builder", emoji: "🧩" },
  { label: "Dockyard",href: "/dockyard",       emoji: "⚓" },
  { label: "Shipyard",href: "/shipyard",       emoji: "🚢" },
];

export default function BottomDock() {
  const pathname = usePathname();

  // Avoid hydration mismatch by waiting for client mount for active highlighting
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="
        fixed inset-x-0 bottom-0 z-50
        border-t border-slate-700
        bg-slate-900/90 backdrop-blur-md
        px-2 sm:px-4
        pb-[max(env(safe-area-inset-bottom),0.25rem)]
        pt-2
      "
      role="navigation"
      aria-label="Bottom Dock"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-3 items-center gap-2">
        {/* Left cluster */}
  <DockCluster items={LEFT} pathname={mounted ? (pathname ?? "") : ""} align="left" />

        {/* Center cluster (slightly larger) */}
  <DockCluster items={CENTER} pathname={mounted ? (pathname ?? "") : ""} align="center" big />

        {/* Right cluster */}
  <DockCluster items={RIGHT} pathname={mounted ? (pathname ?? "") : ""} align="right" />
      </div>
    </div>
  );
}

function DockCluster({
  items,
  pathname,
  align,
  big = false,
}: {
  items: DockItem[];
  pathname: string;
  align: "left" | "center" | "right";
  big?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-1 sm:gap-2",
        align === "center" ? "justify-center" : "",
        align === "right" ? "justify-end" : "",
      ].join(" ")}
    >
      {items.map((it) => {
        const active =
          pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href as any}
            className={[
              "inline-flex items-center gap-2 rounded-xl border",
              "border-slate-700 bg-slate-800/60 hover:bg-slate-700/70",
              "px-3 py-1.5 transition-colors",
              big ? "px-4 py-2" : "",
              active ? "ring-1 ring-sky-500/60 bg-sky-500/10" : "",
            ].join(" ")}
            title={it.label}
          >
            <span className={big ? "text-base" : "text-sm"} aria-hidden="true">
              {it.emoji ?? "•"}
            </span>
            <span
              className={[
                "text-xs sm:text-sm",
                active ? "text-sky-200" : "text-slate-200",
              ].join(" ")}
            >
              {it.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}