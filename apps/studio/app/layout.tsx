/* ──────────────────────────────────────────────────────────────────────────────
 * corAe Studio • Root Layout (150% Logic)
 * - Server Component layout (Next.js 15 compliant)
 * - Universal Nav: NavBar (top), SideBar (md+), Mobile Tabs (mobile via wrapper)
 * - Dark/Light theme bootstrap (no flash, no deps)
 * - A11y: skip link + landmarks
 * - Safe-area padding + mobile bottom inset handling
 * - Swap-in zone for CAIA/providers/analytics (kept noop for compile safety)
 * ────────────────────────────────────────────────────────────────────────────── */

import "./globals.css";
import type { Metadata, Viewport } from "next";
import React, { PropsWithChildren } from "react";

import NavBar from "@/app/system/nav/components/NavBar";
import SideBar from "@/app/system/nav/components/SideBar";
import CaiaClientShell from "@/components/CaiaClientShell";
import CaiaProvider from "./_components/caia/CaiaProvider.client";
import CaiaQuickActions from "./_components/caia/CaiaQuickActions.client";
// Placeholder for MobileTabsWrapper (real client-only component can be swapped in at the original path)
function MobileTabsWrapper() {
  // This is a server-side placeholder that renders nothing; replace with the client-only implementation
  // (e.g. a file with "use client" at "@/app/system/nav/components/MobileTabsWrapper")
  return null;
}

// apps/ship/app/layout.tsx
// Example fragment removed: the accidental "..." and the inline <body> snippet were deleted.
// If you need TopBar in a specific app layout, import it there:
// import TopBar from "@/app/system/nav/components/TopBar";

/* ───────── Metadata / Viewport ───────── */
export const metadata: Metadata = {
  title: "corAe Studio",
  description: "OS² Navigation Layer — Universal Engine Interface",
  applicationName: "corAe Studio",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* ───────── Minimal Theme Bootstrap (no deps) ───────── */
const THEME_BOOTSTRAP = `
(function () {
  try {
    var pref = (localStorage && localStorage.getItem("theme")) || "system";
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = pref === "dark" || (pref === "system" && prefersDark);
    var root = document.documentElement;
    root.dataset.theme = dark ? "dark" : "light";
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
  } catch(_) {}
})();
`;

/* ───────── Providers (swap in real ones later) ───────── */
function RootProviders({ children }: PropsWithChildren) {
  // SWAP-IN: CAIA, QueryClient, Auth, i18n, Toaster, etc.
  return <>{children}</>;
}

/* ───────── A11y Skip Link ───────── */
function SkipToContent() {
  return (
    <a
      href="#__corae_main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-100 focus:rounded-lg focus:bg-neutral-900 focus:px-3 focus:py-2 focus:text-white dark:focus:bg-white dark:focus:text-neutral-900"
    >
      Skip to content
    </a>
  );
}

/* ───────── Root Layout (Server Component) ───────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before hydration to prevent theme flash */}
        <script id="corae-theme-bootstrap" dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {/* CAIA focus-mode CSS: lightweight rules to hide nav/header when CAIA toggles focus */}
        <style dangerouslySetInnerHTML={{ __html: `
          .caia-focus nav, .caia-focus header, .caia-focus .nav, .caia-focus .navbar { display: none !important; }
        ` }} />
      </head>

      <body
        className={[
          "min-h-dvh antialiased",
          "bg-neutral-50 text-neutral-900",
          "dark:bg-neutral-950 dark:text-neutral-100",
          // Leave space for mobile tab bar by default; md+ handled by layout
          "pb-24 md:pb-20",
        ].join(" ")}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
          <RootProviders>
          {/* Mount CAIA provider (client-only) so window.__CAIA is available app-wide */}
          <CaiaProvider />
          <CaiaClientShell />
          {/* Mount CAIA quick actions UI (client-only) */}
          <CaiaQuickActions />
          <SkipToContent />

          {/* Top navigation (universal) */}
          <NavBar />

          {/* Shell: SideBar (md+) + Content */}
          <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4">
            <SideBar />
            <main id="__corae_main" className="min-w-0 flex-1">
              {children}
            </main>
          </div>

          {/* Mobile bottom tabs (client-only, hidden ≥ md) */}
          <MobileTabsWrapper />

          {/* CAIA presence: client-only floating assistant mounted once per app */}
          <CaiaClientShell />

          {/* SWAP-IN (optional): <CAIARoot /> <Analytics /> <CommandPalette /> */}
        </RootProviders>
      </body>
    </html>
  );
}