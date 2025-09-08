import fs from "node:fs";
import path from "node:path";

// ---------- helpers ----------
const P = (...segs: string[]) => path.join(process.cwd(), ...segs);
const count = (p: string) => (fs.existsSync(p) ? fs.readdirSync(p).length : 0);

type Stat = { label: string; value: number | string; hint?: string };

// ---------- live stats pulled from filesystem (optional-safe) ----------
function getStats(): Stat[] {
  // Comms / CIMS
  const cimsDrafts = count(P("data","cims","drafts"));
  const cimsOutbox = count(P("data","cims","outbox"));
  const cimsSent   = count(P("data","cims","sent"));
  const inboxEmails= count(P("data","inbox","emails"));

  // 3³DTD (workbrain)
  const wbQueue   = count(P("data","workbrain","queue"));
  const wbDecided = count(P("data","workbrain","decided"));

  // OMS / OBARI
  const ord = count(P("data","oms","obari","orders"));
  const bok = count(P("data","oms","obari","booking"));
  const act = count(P("data","oms","obari","active"));
  const rep = count(P("data","oms","obari","reporting"));
  const inv = count(P("data","oms","obari","invoicing"));

  // Build / Dev / Theme (optional)
  const buildQ  = count(P("data","build","queue"));
  const buildOK = count(P("data","build","done"));
  const devLogs = count(P("data","agents","dev","logs"));
  const themes  = count(P("data","theme","themes"));

  return [
    { label: "CIMS drafts", value: cimsDrafts }, { label: "CIMS outbox", value: cimsOutbox }, { label: "CIMS sent", value: cimsSent },
    { label: "Inbox emails", value: inboxEmails, hint: "Inputs → 3³DTD" },
    { label: "3³DTD queue", value: wbQueue },    { label: "3³DTD decided", value: wbDecided },
    { label: "OBARI • Orders", value: ord },     { label: "Booking", value: bok }, { label: "Active", value: act },
    { label: "Reporting", value: rep },          { label: "Invoicing", value: inv },
    { label: "Build queue", value: buildQ },     { label: "Build done", value: buildOK },
    { label: "DevAgent logs", value: devLogs },  { label: "Themes", value: themes },
  ];
}

function Tile({
  href, title, desc, emoji,
}: { href:string; title:string; desc:string; emoji:string }) {
  return (
    <a href={href} className="block rounded-xl border bg-white hover:bg-gray-50 transition p-4 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="font-semibold mt-1">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </a>
  );
}

export default async function Dockyard() {
  const stats = getStats();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Dockyard</h1>
        <p className="text-gray-600">Your launch pad: build logs, dev agents, themes, comms, CAIA.</p>
      </header>

      {/* Top row — the ones you asked for */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile href="/dockyard/build-log" title="Build Log" desc="Pipelines, queue, recent builds" emoji="🛠️" />
        <Tile href="/dockyard/theme"     title="Theme Engine" desc="Brand/theme packs & switches" emoji="🎨" />
        <Tile href="/dockyard/dev-agent" title="Dev Agent" desc="Automation runs & traces" emoji="🤖" />
        <Tile href="/ship/caia"          title="CAIA" desc="Work-aware assistant" emoji="🧠" />
      </section>

      {/* Core operations */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile href="/comms"       title="corAe Comms™" desc="Emails • OBARI feed • 3³DTD • CIMS" emoji="✉️" />
        <Tile href="/cims"        title="CIMS" desc="AI-drafted, overseer-gated comms" emoji="📤" />
        <Tile href="/ship/oms"    title="OMS" desc="Operations • Finance • OBARI lifecycle" emoji="⚙️" />
        <Tile href="/ship/work"   title="3³DTD" desc="Triage → Decide → Do [diaries]" emoji="📓" />
      </section>

      {/* Live system health */}
      <section>
        <h2 className="text-xl font-semibold mb-2">System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {stats.map(s => (
            <div key={s.label} className="rounded-lg border bg-white p-3">
              <div className="text-sm text-gray-600">{s.label}</div>
              <div className="text-2xl font-semibold">{s.value}</div>
              {s.hint && <div className="text-xs text-gray-400">{s.hint}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Quick shortcuts */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Shortcuts</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          <a className="px-3 py-1 rounded border hover:bg-gray-50" href="/comms/emails">Open Emails</a>
          <a className="px-3 py-1 rounded border hover:bg-gray-50" href="/comms/obari">Open OBARI feed</a>
          <a className="px-3 py-1 rounded border hover:bg-gray-50" href="/cims">Open CIMS</a>
          <a className="px-3 py-1 rounded border hover:bg-gray-50" href="/dockyard/build-log">Build log</a>
          <a className="px-3 py-1 rounded border hover:bg-gray-50" href="/dockyard/theme">Theme engine</a>
          <a className="px-3 py-1 rounded border hover:bg-gray-50" href="/dockyard/dev-agent">Dev Agent</a>
        </div>
      </section>
    </div>
  );
}