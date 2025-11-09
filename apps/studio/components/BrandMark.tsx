"use client";
import Link from "next/link";
import { useBrand } from "./BrandProvider";

export function BrandMark() {
  const b = useBrand();
  return (
    <Link href="/" className="flex items-center gap-2 no-underline">
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 10, height: 10, borderRadius: "999px",
          background: "var(--brand-primary)",
        }}
      />
      <span style={{ color: "var(--brand-text)" }}>
        {b.logoText ?? b.name}
      </span>
    </Link>
  );
}
