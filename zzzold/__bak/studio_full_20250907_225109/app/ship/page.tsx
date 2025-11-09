// apps/studio/app/ship/page.tsx
export default function ShipHub() {
  const Card = ({
    href, title, desc, emoji,
  }: { href: string; title: string; desc: string; emoji: string }) => (
    <a href={href} className="block rounded-xl border bg-white hover:bg-gray-50 transition p-4 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="font-semibold mt-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </a>
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Ship</h1>
        <p className="text-gray-600">Business, Work, Home — plus OMS, corAe Comms™, CIMS, and CAIA.</p>
      </header>

      {/* Primary triad */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card href="/ship/business" title="Business" desc="P&L, pipeline, growth targets, governance" emoji="📈" />
        <Card href="/ship/work" title="Work (3³DTD)" desc="Triage → Decide → Do diaries" emoji="📓" />
        <Card href="/ship/home" title="Home" desc="Personal ops, corAe@Home automation" emoji="🏡" />
      </section>

      {/* Systems */}
      <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card href="/ship/oms" title="OMS" desc="Operations • Finance • OBARI lifecycle" emoji="⚙️" />
        <Card href="/comms" title="corAe Comms™" desc="Emails • OBARI feed • Work sync • CIMS" emoji="✉️" />
        <Card href="/cims" title="CIMS" desc="AI-drafted, overseer-gated comms" emoji="📤" />
        <Card href="/ship/caia" title="CAIA (Ship)" desc="Work-aware assistant" emoji="🧠" />
        <Card href="/dockyard" title="Dockyard" desc="Build log • Theme • DevAgent" emoji="🛠️" />
      </section>
    </div>
  );
}