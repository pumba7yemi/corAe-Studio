"use client";

/**
 * corAe — Universal ArrowNav · 150.logic
 *
 * - Drop-in Prev/Next navigation with keyboard hotkeys (← / →).
 * - Auto-computes flow using global presets matched by pathname prefix.
 * - Works across OBARI, BDO, POS, OMS, Work, Home, and Studio tools.
 * - Can be overridden with custom steps[] or explicit prev/next props.
 */

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

export type Step = {
  href: string;          // absolute app route
  label: string;         // button label
  match?: RegExp | null; // optional matcher; default = startsWith(href)
};

export type ArrowNavProps = {
  steps?: Step[];               // override auto-detected flow
  prevHref?: string;
  nextHref?: string;
  prevLabel?: string;
  nextLabel?: string;
  dock?: "top" | "bottom";      // sticky dock position
  hotkeys?: boolean;            // enable ←/→ shortcuts
  className?: string;
};

/* ───────────────────────────────────────────────
   Preset Flows (auto-detected by pathname prefix)
──────────────────────────────────────────────── */
export const ARROWNAV_PRESETS: Array<{ prefix: string; steps: Step[] }> = [
  // OBARI — Order Flow
  {
    prefix: "/obari/order",
    steps: [
      { href: "/obari/order/prep",     label: "Prep" },
      { href: "/obari/order/schedule", label: "Schedule" },
      { href: "/obari/order",          label: "Order" },
    ],
  },
  // BDO — Business Development Orders
  {
    prefix: "/bdo",
    steps: [
      { href: "/bdo",          label: "BDO List" },
      { href: "/bdo/create",   label: "Create" },
      { href: "/bdo/review",   label: "Review" },
      { href: "/bdo/convert",  label: "Convert" },
    ],
  },
  // POS — Point of Sale
  {
    prefix: "/pos",
    steps: [
      { href: "/pos/products", label: "Products" },
      { href: "/pos/stock",    label: "Stock" },
      { href: "/pos/checkout", label: "Checkout" },
    ],
  },
  // OMS — Operations Management
  {
    prefix: "/oms/obari",
    steps: [
      { href: "/oms/obari",           label: "Overview" },
      { href: "/oms/obari/chronology", label: "Chronology" },
      { href: "/oms/obari/schedule",   label: "28-Day Hub" },
    ],
  },
  // Studio Tools
  {
    prefix: "/schema-builder",
    steps: [
      { href: "/schema-builder",             label: "Schema Tools" },
      { href: "/schema-builder/generator",   label: "Generator" },
    ],
  },
  // corAe Work (3³DTD cycle)
  {
    prefix: "/work",
    steps: [
      { href: "/work/plan",   label: "Plan" },
      { href: "/work/do",     label: "Do" },
      { href: "/work/review", label: "Review" },
    ],
  },
  // corAe Home
  {
    prefix: "/home",
    steps: [
      { href: "/home/start",  label: "Start" },
      { href: "/home/focus",  label: "Focus" },
      { href: "/home/end",    label: "End" },
    ],
  },
];

/* Default fallback */
const DEFAULT_STEPS: Step[] = [{ href: "/", label: "Home" }];

/* ───────────────────────────────────────────────
   Component
──────────────────────────────────────────────── */
export default function ArrowNav({
  steps,
  prevHref,
  nextHref,
  prevLabel,
  nextLabel,
  dock = "top",
  hotkeys = true,
  className = "",
}: ArrowNavProps) {
  const pathname = (usePathname() || "").split("?")[0];

  // Choose steps: explicit > preset by prefix > default
  const flow: Step[] = useMemo(() => {
    if (steps?.length) return steps;
    const match = ARROWNAV_PRESETS.find((p) => pathname?.startsWith(p.prefix));
    return match?.steps ?? DEFAULT_STEPS;
  }, [steps, pathname]);

  // Find current step index
  const idx = useMemo(() => {
    if (!pathname) return -1;
    for (let i = 0; i < flow.length; i++) {
      const s = flow[i];
      if (s.match instanceof RegExp) {
        if (s.match.test(pathname)) return i;
      } else {
        if (pathname === s.href || pathname.startsWith(s.href)) return i;
      }
    }
    return -1;
  }, [pathname, flow]);

  // Auto compute prev/next
  const autoPrev = idx > 0 ? flow[idx - 1] : null;
  const autoNext = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;

  // Final computed links (props override auto)
  const finalPrevHref = prevHref ?? autoPrev?.href;
  const finalPrevLabel = prevLabel ?? autoPrev?.label ?? "Back";
  const finalNextHref = nextHref ?? autoNext?.href;
  const finalNextLabel = nextLabel ?? autoNext?.label ?? "Next";

  // Keyboard shortcuts
  useEffect(() => {
    if (!hotkeys) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const editing =
        t?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(t?.tagName ?? "");
      if (editing) return;

      if (e.key === "ArrowLeft" && finalPrevHref) {
        window.location.assign(finalPrevHref);
      } else if (e.key === "ArrowRight" && finalNextHref) {
        window.location.assign(finalNextHref);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkeys, finalPrevHref, finalNextHref]);

  const dockClasses =
    dock === "top" ? "sticky top-0 border-b" : "sticky bottom-0 border-t";

  return (
    <nav
      aria-label="corAe page navigation"
      className={[
        "z-40 bg-surface/80 backdrop-blur-sm",
        "px-3 py-2",
        "border-ring",
        dockClasses,
        className,
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        {/* Prev */}
        {finalPrevHref ? (
          <Link
            href={finalPrevHref as unknown as any}
            className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-ring bg-card hover:bg-surface transition"
            aria-label={`Previous: ${finalPrevLabel}`}
          >
            <span aria-hidden>←</span>
            <span className="small">{finalPrevLabel}</span>
            <kbd className="ml-2 hidden sm:inline text-xs opacity-60 border px-1 rounded">
              ←
            </kbd>
          </Link>
        ) : (
          <span />
        )}

        {/* Next */}
        {finalNextHref ? (
          <Link
            href={finalNextHref as unknown as any}
            className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-ring bg-card hover:bg-surface transition"
            aria-label={`Next: ${finalNextLabel}`}
          >
            <span className="small">{finalNextLabel}</span>
            <kbd className="ml-2 hidden sm:inline text-xs opacity-60 border px-1 rounded">
              →
            </kbd>
            <span aria-hidden>→</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}