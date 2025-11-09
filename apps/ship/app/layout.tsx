import "./globals.css";
import type { Metadata } from "next";

import Link from "next/link";
import React from "react";
import MobileAppTabs from "./components/MobileAppTabs";

export const metadata: Metadata = {
  title: "corAe Ship",
  description: "Live app — Business, Work, Home",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-0 bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <main className="min-w-0 flex-1 pb-24">{children}</main>
        <MobileAppTabs />
      </body>
    </html>
  );
}