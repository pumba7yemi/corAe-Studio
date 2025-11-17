"use client";

/**
 * corAe — Golden Page Template (self-contained)
 * Clone this file into any /app/<route>/page.tsx and adjust propsSection/content.
 * No custom aliases; only react + next/link. Tailwind optional.
 */

import React, { useMemo } from "react";
import Link from "next/link";

/* ---------------- Types (local, no imports) ---------------- */
type Crumb = { label: string; href?: string };
type Banner = {
  title: string;
  subtitle?: string;
  icon?: string; // small emoji/icon text
};

/* ---------------- Helpers (local) ---------------- */
function cls(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Template Page ---------------- */
export default function TemplatePage() {
  // Adjust these three sections when you clone the file
  const banner: Banner = useMemo(
    () => ({
      title: "Template",
      subtitle: "Clone • Adjust • Ship — consistent corAe UX",
      icon: "🧩",
    }),
    []
  );

  const breadcrumbs: Crumb[] = useMemo(
    () => [
      { label: "corAe", href: "/" },
      { label: "Studio", href: "/schema-builder" },
      { label: "Template" }, // current
    ],
    []
  );

  // Drop your content JSX in here when cloning
  const content = (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Left Pane">
        <p className="text-sm text-slate-600">
          Place your form or table here. Keep imports to <code>react</code>, <code>next</code>,{" "}
          and <code>@/components/*</code> if needed.
        </p>
      </Card>
      <Card title="Right Pane">
        <p className="text-sm text-slate-600">
          Mirror data, show a preview, or CAIA-readable script. This page compiles anywhere.
        </p>
      </Card>
      <Card title="Event Log" className="md:col-span-2">
        <div className="h-48 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700 overflow-auto">
          <ul className="list-disc ml-5">
            <li>Self-contained: no custom aliases.</li>
            <li>Clone-and-adjust in seconds.</li>
            <li>Breadcrumbs above are declarative.</li>
          </ul>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-[70vh]">
      <Header banner={banner} crumbs={breadcrumbs} />
      {content}
    </div>
  );
}

/* ---------------- UI Bits (local) ---------------- */
function Header({ banner, crumbs }: { banner: Banner; crumbs: Crumb[] }) {
  return (
    <section className="mb-4">
      <nav className="text-xs text-slate-400 mb-1 flex items-center gap-1">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="opacity-60">/</span>}
            {c.href ? (
              <Link href={c.href} className="hover:text-slate-200">
                {c.label}
              </Link>
            ) : (
              <span className="text-slate-300">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {banner.icon && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800">
            <span className="text-sm leading-none">{banner.icon}</span>
          </span>
        )}
        <h1 className="text-[24px] leading-7 font-semibold tracking-tight text-slate-100">
          {banner.title}
        </h1>
      </div>

      {banner.subtitle && (
        <p className="text-sm text-slate-400 mt-1">{banner.subtitle}</p>
      )}

      <div className="h-px bg-slate-700/60 mt-3 mb-4" />
    </section>
  );
}

function Card({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cls(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <h3 className="text-base font-semibold mb-2 text-slate-900">{title}</h3>
      {children}
    </section>
  );
}