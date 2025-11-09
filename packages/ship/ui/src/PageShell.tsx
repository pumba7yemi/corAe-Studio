import { ReactNode } from "react";

export default function PageShell({
  title,
  subtitle,
  actions,
  children
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold leading-tight text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
        {children}
      </section>
    </div>
  );
}