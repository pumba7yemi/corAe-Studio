// src/components/FeatureCard.tsx
import KeyboardHint from "@/components/KeyboardHint";
import Link from "next/link";

export default function FeatureCard({
  title,
  subtitle,
  href,
  cta = "Open",
  hotkey,
}: {
  title: string;
  subtitle?: string;
  href: string;
  cta?: string;
  hotkey?: string; // show a little pill (e.g., "⌘/Ctrl + K")
}) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {hotkey ? <KeyboardHint combo={hotkey} /> : null}
      </div>
      {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
      <div className="mt-3">
        <Link
          href={href}
          className="inline-block px-3 py-1.5 rounded-md border bg-black text-white text-sm hover:opacity-90"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}