// apps/studio/app/comms/page.tsx
import fs from "node:fs";
import path from "node:path";
import FeedClient from "./FeedClient";
import CountsClient from "./CountsClient";

export const dynamic = "force-dynamic";

type FeedItem = { id:string; kind:string; title:string; when:number; path:string; };

function pjoin(...parts: string[]) { return path.join(process.cwd(), ...parts); }
function listJson(absDir: string, kind: string, prefixTitle = ""): FeedItem[] {
  try {
    if (!fs.existsSync(absDir)) return [];
    return fs.readdirSync(absDir)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        const abs = path.join(absDir, f);
        const st = fs.statSync(abs);
        return {
          id: f.replace(/\.json$/,""),
          kind,
          title: prefixTitle ? `${prefixTitle}: ${f}` : f,
          when: st.mtimeMs,
          path: abs,
        };
      });
  } catch { return []; }
}

export default function CommsHub() {
  const feed: FeedItem[] = [
    ...listJson(pjoin("data","inbox","emails"), "emails","Email"),
    ...listJson(pjoin("data","oms","obari","orders"),    "obari.orders","Order"),
    ...listJson(pjoin("data","oms","obari","booking"),   "obari.booking","Booking"),
    ...listJson(pjoin("data","oms","obari","active"),    "obari.active","Active"),
    ...listJson(pjoin("data","oms","obari","reporting"), "obari.reporting","Reporting"),
    ...listJson(pjoin("data","oms","obari","invoicing"), "obari.invoicing","Invoicing"),
    ...listJson(pjoin("data","workbrain","queue"), "workbrain","3³DTD"),
    ...listJson(pjoin("data","cims","drafts"),  "cims.drafts","CIMS Draft"),
    ...listJson(pjoin("data","cims","outbox"),  "cims.outbox","CIMS Outbox"),
    ...listJson(pjoin("data","cims","sent"),    "cims.sent","CIMS Sent"),
  ].sort((a,b)=>b.when-a.when).slice(0,12);

  const tiles = [
    { href: "/comms/emails", title: "Emails", desc: "Inbox feeds 3³DTD & CIMS.", badge: "Inbox" },
    { href: "/oms",          title: "OMS",    desc: "OBARI + Ops/Finance pipeline.", badge: "Pipeline" },
    { href: "/comms/work",   title: "3³DTD",  desc: "Decide • Do • Describe triage.", badge: "Triage" },
    { href: "/comms/cims",   title: "CIMS",   desc: "Auto-draft & overseer-gated send.", badge: "Comms" },
  ];

  return (
    <div className="space-y-6">
      {/* Global Feed Banner */}
      <section className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Global Feed — corAe Comms™</div>
            <div className="text-xs text-gray-500">Live funnel from Emails, OMS/OBARI, 3³DTD, CIMS.</div>
          </div>
          <a href="/oms" className="text-xs underline hover:text-black">Open OMS</a>
        </div>
        <FeedClient items={feed} />
      </section>

      {/* Live OMS/OBARI counts (auto-refresh via API) */}
      <section className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold mb-2">OMS / OBARI — Weekly Stages (live)</div>
        <CountsClient />
      </section>

      {/* Navigation tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tiles.map(t => (
          <a key={t.href} href={t.href} className="border rounded-xl p-5 hover:shadow-sm transition bg-white block">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">{t.title}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border">{t.badge}</span>
            </div>
            <p className="text-sm text-gray-600">{t.desc}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
