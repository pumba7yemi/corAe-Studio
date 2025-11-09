import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Shipyard",
  description: "Prototype surface for promoted builds"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-900 antialiased">{children}</body>
    </html>
  );
}