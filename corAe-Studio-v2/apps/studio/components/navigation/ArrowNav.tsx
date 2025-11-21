"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

type ArrowNavProps = {
  backHref?: string;
  prevHref?: string;
  nextHref?: string;
  prevLabel?: string;
  nextLabel?: string;
  onNext?: () => void;
  className?: string;
};

/**
 * ArrowNav — universal step navigator for corAe
 * - Use across modules to move chronologically through flows.
 * - Shows Back, Prev, Next when provided.
 */
export default function ArrowNav(props: PropsWithChildren<ArrowNavProps>) {
  const {
    backHref,
    prevHref,
    nextHref,
    prevLabel = "Prev",
    nextLabel = "Next",
    className = "",
    children,
  } = props;

  const router = useRouter();

  return (
    <nav
      aria-label="Step navigation"
      className={`flex items-center justify-between gap-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 border border-ring rounded-lg px-3 py-2 hover:bg-card"
          >
            <span aria-hidden>←</span>
            <span className="small">Back</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => (router as any).back?.()}
            className="inline-flex items-center gap-2 border border-ring rounded-lg px-3 py-2 hover:bg-card"
            aria-label="Back"
            title="Back"
          >
            <span aria-hidden>←</span>
            <span className="small">Back</span>
          </button>
        )}

        {prevHref && (
          <Link
            href={prevHref}
            className="inline-flex items-center gap-2 border border-ring rounded-lg px-3 py-2 hover:bg-card"
          >
            <span aria-hidden>⟵</span>
            <span className="small">{prevLabel}</span>
          </Link>
        )}
      </div>

      {/* Optional center content (breadcrumbs, step title) */}
      {children && <div className="small muted">{children}</div>}

      <div className="flex items-center gap-2">
        {nextHref && (
          <Link
            href={nextHref}
            className="inline-flex items-center gap-2 border border-ring rounded-lg px-3 py-2 hover:bg-card"
          >
            <span className="small">{nextLabel}</span>
            <span aria-hidden>⟶</span>
          </Link>
        )}
      </div>
    </nav>
  );
}