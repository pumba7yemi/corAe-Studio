"use client";

/**
 * corAe Nav Layer™ • MobileTabsWrapper
 * ------------------------------------------------------
 * Client-only wrapper for the bottom app navigation bar.
 * - Uses next/dynamic to avoid SSR conflicts
 * - Always visible (remove “md:block” to hide on desktop)
 * - Fixed to bottom, safe-area aware
 */

import dynamic from "next/dynamic";

// Load your bottom tab bar client-side only
const MobileAppTabs = dynamic(() => import("@/components/MobileAppTabs"), {
  ssr: false,
});

export default function MobileTabsWrapper() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 block border-t border-neutral-200
                 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60
                 dark:border-neutral-800 dark:bg-neutral-950/80"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
    >
      <MobileAppTabs />
    </div>
  );
}