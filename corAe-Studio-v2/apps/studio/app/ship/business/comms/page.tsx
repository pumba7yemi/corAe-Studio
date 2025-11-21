// apps/studio/app/business/comms/page.tsx
export default function BusinessComms() {
  const Tile = ({ href, title, desc }:{ href:string; title:string; desc:string }) => (
    <a href={href} className="block rounded-xl border bg-white hover:bg-gray-50 transition p-4 shadow-sm">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </a>
  );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">corAe Commsâ„¢</h1>
      <p className="text-gray-600">Emails inbox, OBARI feed, 3Â³DTD triage, and CIMS queue.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile href="/comms/emails" title="Emails" desc="Inbox & normalization" />
        <Tile href="/comms"        title="CIMS"   desc="AI-drafted comms, overseer-gated" />
        <Tile href="/work"    title="3Â³DTD"  desc="Triage â†’ Decide â†’ Do" />
        <Tile href="/business/oms/obari" title="OBARI" desc="Lifecycle dashboard" />
      </div>
    </div>
  );
}

