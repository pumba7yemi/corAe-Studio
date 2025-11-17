// apps/studio/app/ship/business/page.tsx
export default function BusinessHub() {
  const Tile = ({ href, title, desc, emoji }:{
    href: string; title: string; desc: string; emoji: string;
  }) => (
    <a href={href} className="block rounded-xl border bg-white hover:bg-gray-50 transition p-4 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="font-semibold mt-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </a>
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Business</h1>
        <p className="text-gray-600">OMS, CAIA and corAe Comms™ for the business lane.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tile href="/ship/business/oms"   title="OMS"   desc="Operations • Finance • OBARI • HR" emoji="⚙️" />
        <Tile href="/ship/business/caia"  title="CAIA"  desc="Work-aware assistant (business lane)" emoji="🧠" />
        <Tile href="/ship/business/comms" title="corAe Comms™" desc="Emails • OBARI feed • 3³DTD • CIMS" emoji="✉️" />
      </section>
    </div>
  );
}