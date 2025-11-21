"use client";

import Link from "next/link";
import React from "react";

export default function HomeSectionLayout({
  title,
  hint,
  children,
}: { title: string; hint?: string; children: React.ReactNode }) {
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="mx-auto max-w-4xl px-3 pt-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {hint && <p className="text-xs text-zinc-400">{hint}</p>}
        </div>
        <nav className="flex gap-2 text-xs">
          <Link className="rounded-lg px-3 py-2 bg-zinc-800 hover:bg-zinc-700"
                href="/home">â† Home</Link>
          <Link className="rounded-lg px-3 py-2 bg-zinc-800 hover:bg-zinc-700"
                href="/home/onboarding/wizard/homefocus">Open Wizard</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-3 pb-24 pt-6">{children}</main>
    </div>
  );
}

/* Tiny UI primitives to keep pages self-contained */
export const Card = ({
  title, hint, children,
}: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    {hint && <p className="mt-1 text-sm text-zinc-400">{hint}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

export const Btn = ({
  children, onClick, variant = "primary", disabled,
}: { children: React.ReactNode; onClick?: () => void;
     variant?: "primary" | "secondary" | "ghost" | "danger"; disabled?: boolean }) => {
  const b = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const m = {
    primary:   `${b} bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50`,
    secondary: `${b} bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50`,
    ghost:     `${b} text-zinc-300 hover:bg-zinc-800/70`,
    danger:    `${b} bg-red-600 text-white hover:bg-red-500 disabled:opacity-50`,
  } as const;
  return <button onClick={onClick} disabled={disabled} className={m[variant]}>{children}</button>;
};

export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) =>
  <input {...p}
    className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className ?? ""}`} />;

export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
  <textarea {...p}
    className={`h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className ?? ""}`} />;

export const Chip = ({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) =>
  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs">
    {children}
    {onRemove && <button onClick={onRemove} className="text-zinc-400 hover:text-zinc-200">âœ•</button>}
  </span>;

