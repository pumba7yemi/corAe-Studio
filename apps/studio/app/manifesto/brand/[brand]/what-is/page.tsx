// apps/studio/app/manifesto/brand/[brand]/what-is/page.tsx
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { sectorTemplates, type SectorTemplate } from "@/lib/sector-templates";

export const dynamic = "force-dynamic";

export default async function BrandWhatIs({ params }: { params: Promise<{ brand: string }> }) {
  const p = await params;
  // cookies()
  const store = await cookies();
  const brandsCookie = store.get("corae.brands");
  const all = JSON.parse(brandsCookie?.value ?? "[]") as any[];
  const brand = all.find((b: any) => b.slug === p.brand);
  if (!brand) return notFound();

  // sector fallback
  const sector = sectorTemplates[brand.sector] as SectorTemplate | undefined;
  const sectorText = sector?.defaults.manifesto.whatMd ?? "";
  const customText = brand.copy?.whatMd ?? "";

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">What is {brand.name}</h1>

      <p className="opacity-80">
        {customText ||
          `The ${brand.name} system is a tailored deployment of ${
            sector?.title || brand.sector
          }, powered by corAe OS². It merges brand identity with operational discipline — 
          ensuring that every booking, order, or sale flows through intelligent logic.`}
      </p>

      {sectorText && <p className="opacity-80">{sectorText}</p>}

      <ul className="list-disc pl-5 opacity-80">
        {(sector?.defaults.modules || []).map((m: string) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      <PoweredByBadge show={brand.poweredByCorae !== false} />

      <div className="mt-6 text-sm opacity-70">
        <span>⚡ {brand.name} — A {brand.sector} system powered by corAe OS².</span>
      </div>
    </main>
  );
}