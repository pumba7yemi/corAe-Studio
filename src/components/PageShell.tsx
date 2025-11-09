"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Tab = { label: string; href: string; active?: boolean };
type Crumb = { label: string; href?: string };

export default function PageShell({
  title,
  subtitle,
  crumbs = [],
  tabs = [],
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  tabs?: Tab[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {!!crumbs.length && (
        <nav className="text-xs text-slate-400">
          {crumbs.map((c, i) => (
            <span key={i}>
              {c.href ? (
                <Link href={c.href} className="hover:text-slate-200">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span className="mx-2 text-slate-600">/</span>}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold leading-tight text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>

      {!!tabs.length && (
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={
                "px-3 py-1.5 rounded-full border text-sm transition " +
                (t.active
                  ? "border-sky-500 bg-sky-500/10 text-sky-200"
                  : "border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60")
              }
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
        {children}
      </section>
    </div>
  );
}