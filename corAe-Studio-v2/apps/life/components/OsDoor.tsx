"use client";
import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  subtitle: string;
  href: string;
};

export function OsDoor({ title, subtitle, href }: Props) {
  const resolveHref = (h: string) => {
    if (!h) return h;
    // Accept both route-style ('/home') and file-style ('apps/home/page') references.
    if (h.startsWith('apps/')) {
      const parts = h.split('/').filter(Boolean);
      // apps/<appName>/...
      if (parts.length >= 2) return `/${parts[1]}`;
    }
    if (h.startsWith('/apps/')) {
      const parts = h.split('/').filter(Boolean);
      if (parts.length >= 2) return `/${parts[1]}`;
    }
    return h;
  };

  return (
    <Link
      href={resolveHref(href)}
      className="group block rounded-2xl bg-slate-900/70 border border-slate-700/70 px-5 py-4 shadow-lg hover:shadow-xl transition hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-50 group-hover:text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-300/80 group-hover:text-slate-200/90">{subtitle}</p>
        </div>
        <div className="text-xs font-medium text-emerald-300 group-hover:text-emerald-200">Enter →</div>
      </div>
    </Link>
  );
}

export default OsDoor;
