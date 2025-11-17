// apps/studio/app/manifesto/brand/[brand]/who-is/page.tsx
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PoweredByBadge } from "@/components/PoweredByBadge";

export default async function BrandWhoIs({ params }: { params: Promise<{ brand: string }> }) {
  const p = await params;
  const all = JSON.parse((await cookies()).get("corae.brands")?.value ?? "[]") as any[];
  const brand = all.find((b) => b.slug === p.brand);

  if (!brand) return notFound();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">
        Who is {brand.name}
      </h1>

      <p className="opacity-80">
        {brand.copy?.whoMd ||
          `This is ${brand.name}, a ${brand.sector} system built to bring structure, 
          precision, and clarity to daily operations. Each brand powered by corAe 
          follows its own identity, yet thrives within a unified rhythm.`}
      </p>

      <p className="opacity-80">
        With {brand.name}, managers lead with data, clients experience flow, and
        teams operate with purpose — because beneath the surface, corAe keeps
        everything connected and intelligent.
      </p>

      <PoweredByBadge show={brand.poweredByCorae !== false} />

      <div className="mt-6 text-sm opacity-70">
        <span>⚡ {brand.name} — Powered by corAe OS²</span>
      </div>
    </main>
  );
}