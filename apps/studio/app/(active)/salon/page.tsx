// apps/studio/app/(active)/salon/page.tsx
import Link from "next/link";
import { sectorTemplates } from "@/lib/sector-templates";

export const metadata = {
  title: "Salon OS — Active",
  description: "Bookings, stylists, inventory, POS and finance — Salon OS on corAe."
};

export default function SalonActive() {
  const sector = sectorTemplates["salon"];

  return (
    <main className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{sector.title}</h1>
        <p className="opacity-70">
          A structured operating system for beauty businesses — ready to brand, ready to sell.
        </p>
      </header>

      <section className="rounded-2xl border p-5">
        <h2 className="text-lg font-medium">What you get</h2>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {sector.defaults.modules.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/manifesto/sector/salon/who-is"
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Who is the Salon OS
        </Link>
        <Link
          href="/manifesto/sector/salon/what-is"
          className="rounded-xl border px-4 py-2 text-sm"
        >
          What is the Salon OS
        </Link>
        <Link
          href="/active/builder/new?sector=salon"
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Create a Salon Brand
        </Link>
      </section>

      <footer className="text-xs opacity-70">
        ⚡ Powered by corAe OS²
      </footer>
    </main>
  );
}
