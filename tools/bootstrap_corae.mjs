// tools/bootstrap_corae.mjs
// One-shot scaffold for corAe OS surface: Studio pages, APIs, data, services, seeders, memory.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd(); // expect repo root: C:\corAe\corAe-Studio
const W = (p, c) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c); };
const J = (o) => JSON.stringify(o, null, 2);
const P = (...p) => path.join(root, ...p);

// --- 0) Guard rails ----------------------------------------------------------
function assertStudio() {
  const pkg = P("apps", "studio", "package.json");
  if (!fs.existsSync(pkg)) {
    console.error("❌ apps/studio not found. Create Next.js app in apps/studio first.");
    process.exit(1);
  }
}
assertStudio();

// --- 1) Data backbone ---------------------------------------------------------
const trees = [
  ["data", "cims", "drafts"],
  ["data", "cims", "outbox"],
  ["data", "cims", "sent"],
  ["data", "cims", "logs"],
  ["data", "cims", "templates"],
  ["data", "cims", "policies"],

  ["data", "oms", "inbox"],
  ["data", "oms", "queue"],
  ["data", "oms", "decisions"],
  ["data", "oms", "logs"],
  ["data", "oms", "policies"],

  ["data", "obari", "ledger"],
  ["data", "obari", "offers"],
  ["data", "obari", "locks"],
  ["data", "obari", "logs"],
  ["data", "obari", "policies"],

  ["memory", "docs"],
  ["memory", "index"],
];
trees.forEach(parts => fs.mkdirSync(P(...parts), { recursive: true }));

// Seed CIMS policy + template
W(P("data/cims/policies/policy.json"), J({
  version: "1.0",
  auto_send_threshold: 49,
  always_overseer_tags: ["legal", "termination", "hr-sensitive", "discount>20", "bank-details-change"],
  channel_allow: ["email", "whatsapp", "note"],
  redact_rules: [
    { match: "bank account", action: "mask" },
    { match: "password", action: "drop-line" }
  ],
  overseer_contacts: [{ name: "Owner", route: "note" }]
}));

W(P("data/cims/templates/invoice-reminder.txt"),
`Subject: Invoice {{INV_ID}} — status update
Body:
Hi {{NAME}},

Quick update for invoice {{INV_ID}}: current status is {{STATUS}}.
Amount due: {{AMOUNT}}. Due date: {{DUE_DATE}}.

If you've already paid, please ignore this message.
`);

// Seed OMS/OBARI minimal policies
W(P("data/oms/policies/policy.json"), J({ version:"1.0", sla_hours: 24, escalation_after_hours: 48 }));
W(P("data/obari/policies/policy.json"), J({ version:"1.0", price_lock_hours: 72, min_compete_sources: 3 }));

// Seed memory docs
W(P("memory/docs/OMS.md"), `# OMS — Office Management System
Tracks requests, workloads, SLAs, escalations. Feeds CIMS for comms and OBARI for offers/locks.
`);
W(P("memory/docs/OBARI.md"), `# OBARI — Offer-Bid-Analyse-Reconcile-Implement
Central competitive engine: gathers market options, generates offers, locks best price, reconciles delivery.
`);
W(P("memory/index/README.json"), J({
  docs: [
    { id: "oms", file: "memory/docs/OMS.md" },
    { id: "obari", file: "memory/docs/OBARI.md" }
  ]
}));

// --- 2) Services/Daemons ------------------------------------------------------
// CIMS daemon: move drafts -> outbox|sent based on risk policy
W(P("services/cims/daemon.mjs"), `#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const root = process.cwd();
const D = (...p)=>path.join(root, "data", "cims", ...p);
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

function readJSON(p){ return JSON.parse(fs.readFileSync(p,"utf-8")); }
function writeJSON(p,o){ fs.writeFileSync(p, JSON.stringify(o,null,2)); }

function scoreRisk(draft){
  // toy score: whatsapp lower risk than email, big amounts higher risk
  let s = 20;
  if(draft.channel==="email") s += 20;
  if(/\\d{4,}/.test(draft.body||"")) s += 20;
  return Math.min(99, s);
}

function applyRedactions(text, rules){
  let out = text;
  for(const r of rules||[]){
    if(r.action==="mask") out = out.replace(new RegExp(r.match,"ig"), "████");
    if(r.action==="drop-line"){
      out = out.split("\\n").filter(line=>!new RegExp(r.match,"i").test(line)).join("\\n");
    }
  }
  return out;
}

function ensureDirs(){
  ["drafts","outbox","sent","logs"].forEach(d=>fs.mkdirSync(D(d),{recursive:true}));
}

function log(line){
  const f = D("logs","daemon.log");
  fs.appendFileSync(f, new Date().toISOString()+" "+line+"\\n");
  console.log(line);
}

async function tick(){
  ensureDirs();
  const policy = readJSON(D("policies","policy.json"));
  const drafts = fs.readdirSync(D("drafts")).filter(f=>f.endsWith(".json"));
  for(const f of drafts){
    const p = D("drafts", f);
    const draft = readJSON(p);
    draft.body = applyRedactions(draft.body||"", policy.redact_rules);
    const risk = scoreRisk(draft);
    draft._risk = risk;

    if(risk <= policy.auto_send_threshold){
      // auto-send: simulate send by moving to sent
      fs.renameSync(p, D("sent", f));
      log("AUTO-SENT "+f+" risk="+risk);
    } else {
      // needs overseer: move to outbox for approval
      fs.renameSync(p, D("outbox", f));
      log("REQUIRES-APPROVAL "+f+" risk="+risk);
    }
  }

  // if outbox contains "approved-*.json", move to sent
  const out = fs.readdirSync(D("outbox")).filter(f=>f.startsWith("approved-") && f.endsWith(".json"));
  for(const f of out){
    fs.renameSync(D("outbox",f), D("sent", f.replace(/^approved-/,"")));
    log("APPROVED-SENT "+f);
  }
}

(async ()=>{
  console.log("CIMS daemon ready. Drafts in /data/cims/drafts. Policies in /data/cims/policies/policy.json");
  while(true){ await tick(); await sleep(1500); }
})();
`);

// Seeder used by API and by you manually
W(P("services/cims/seed.mjs"), `#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const root = process.cwd(); const D=(...p)=>path.join(root,"data","cims",...p);
fs.mkdirSync(D("drafts"),{recursive:true});
const id = "cims_"+Math.random().toString(36).slice(2,9);
const draft = {
  id, template_id: "invoice-reminder", channel:"whatsapp", to:"+971500000000",
  subject: \`Invoice \${Math.floor(Math.random()*9000)+1000} — status update\`,
  body: "Finance update: queued for payment, bank account on file."
};
fs.writeFileSync(D("drafts", id+".json"), JSON.stringify(draft,null,2));
console.log("Seeded:", id);
`);

// OMS + OBARI simple daemons (stubs you can extend)
W(P("services/oms/daemon.mjs"), `#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const root=process.cwd(), D=(...p)=>path.join(root,"data","oms",...p);
fs.mkdirSync(D("logs"),{recursive:true});
setInterval(()=>{ fs.appendFileSync(D("logs","oms.log"), new Date().toISOString()+" heartbeat\\n"); }, 4000);
console.log("OMS daemon: heartbeat logging to data/oms/logs/oms.log");
`);
W(P("services/obari/daemon.mjs"), `#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const root=process.cwd(), D=(...p)=>path.join(root,"data","obari",...p);
fs.mkdirSync(D("logs"),{recursive:true});
setInterval(()=>{ fs.appendFileSync(D("logs","obari.log"), new Date().toISOString()+" heartbeat\\n"); }, 5000);
console.log("OBARI daemon: heartbeat logging to data/obari/logs/obari.log");
`);

// --- 3) Studio pages + APIs (Next.js App Router) -----------------------------
const app = (...p)=>P("apps","studio","app",...p);

// Shared helper in Studio to resolve repo-root data
W(app("lib","paths.ts"), `
import path from "node:path";
export function DATA_ROOT(){ return path.join(process.cwd(), "..", "..", "data"); }
`);

// CIMS PAGE
W(app("cims","page.tsx"), `'use client';
import React from 'react';
type Item = { id:string; subject?:string; channel?:string; to?:string; _risk?:number };
function useLoad<T>(url:string, deps:any[]=[]){
  const [data,setData]=React.useState<T|null>(null);
  React.useEffect(()=>{ fetch(url).then(r=>r.json()).then(setData as any); }, deps);
  return data;
}
export default function CIMS(){
  const state = useLoad<any>('/cims/api/queue', []);
  async function seed(){ await fetch('/cims/api/seed',{method:'POST'}); location.reload(); }
  async function approve(id:string){ await fetch('/cims/api/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); location.reload(); }
  return (<main className="mx-auto max-w-5xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">CIMS — Auto-Comms (AI-first, Overseer-gated)</h1>
    <p>All comms are AI-drafted; high-risk items require overseer approval. Low-risk auto-send permitted by policy.</p>
    <button onClick={seed} className="px-3 py-2 rounded bg-black text-white">Generate Sample Draft</button>

    {!state && <div className="text-sm text-zinc-500">Loading…</div>}
    {state && (<div className="grid md:grid-cols-3 gap-4">
      {['drafts','outbox','sent'].map((lane)=>(
        <div key={lane} className="border rounded-xl p-4">
          <div className="font-semibold capitalize">{lane}</div>
          <div className="mt-2 space-y-2">
            {state[lane].length===0 && <div className="text-xs text-zinc-500">Empty</div>}
            {state[lane].map((it:Item)=>(
              <div key={it.id} className="text-sm border rounded p-2">
                <div className="font-medium">{it.subject||it.id}</div>
                <div className="text-xs text-zinc-500">{it.channel} → {it.to} {it._risk!=null && <span>• risk {it._risk}</span>}</div>
                {lane==='outbox' && <button onClick={()=>approve(it.id)} className="mt-2 text-xs px-2 py-1 rounded bg-emerald-600 text-white">Approve & Send</button>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>)}
  </main>);
}
`);

// CIMS APIs
W(app("cims","api","queue","route.ts"), `
import { NextResponse } from 'next/server';
import fs from 'node:fs'; import path from 'node:path';
import { DATA_ROOT } from '@/app/lib/paths';
function R(dir:string){ const p=path.join(DATA_ROOT(), 'cims', dir); if(!fs.existsSync(p)) return []; return fs.readdirSync(p).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(p,f),'utf-8'))); }
export async function GET(){ return NextResponse.json({ drafts:R('drafts'), outbox:R('outbox'), sent:R('sent') }); }
`);
W(app("cims","api","seed","route.ts"), `
import { NextResponse } from 'next/server';
import fs from 'node:fs'; import path from 'node:path';
import { DATA_ROOT } from '@/app/lib/paths';
export async function POST(){
  const id = 'cims_'+Math.random().toString(36).slice(2,9);
  const draft = { id, template_id:'invoice-reminder', channel:'whatsapp', to:'+971500000000', subject:'Invoice '+(Math.floor(Math.random()*9000)+1000)+' — status update', body:'Finance update: queued for payment, bank account on file.'};
  const p = path.join(DATA_ROOT(), 'cims', 'drafts', id+'.json');
  fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, JSON.stringify(draft,null,2));
  return NextResponse.json({ok:true, id});
}
`);
W(app("cims","api","approve","route.ts"), `
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs'; import path from 'node:path';
import { DATA_ROOT } from '@/app/lib/paths';
export async function POST(req:NextRequest){
  const {id} = await req.json();
  const out = path.join(DATA_ROOT(), 'cims', 'outbox', id+'.json');
  const approved = path.join(DATA_ROOT(),'cims','outbox','approved-'+id+'.json');
  if(!fs.existsSync(out)) return NextResponse.json({ok:false}, {status:404});
  fs.renameSync(out, approved);
  return NextResponse.json({ok:true});
}
`);

// OMS page + API
W(app("oms","page.tsx"), `export default function OMS(){
  return (<main className="mx-auto max-w-5xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">OMS — Office Management System</h1>
    <p>Requests, workloads, SLA timers, escalations. (Daemon heartbeat writing to <code>data/oms/logs/oms.log</code>.)</p>
  </main>);
}
`);

// OBARI page
W(app("obari","page.tsx"), `export default function OBARI(){
  return (<main className="mx-auto max-w-5xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">OBARI — Offer • Bid • Analyse • Reconcile • Implement</h1>
    <p>Central competitive engine. (Daemon heartbeat writing to <code>data/obari/logs/obari.log</code>.)</p>
  </main>);
}
`);

// ProofEngine page (reads current cims/oms/obari summaries)
W(app("proofengine","page.tsx"), `export default function ProofEngine(){
  return (<main className="mx-auto max-w-5xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">ProofEngine™ Snapshot</h1>
    <p>Light stub. Next pass will compute KPIs from data folders and rank against SAP/Salesforce/Workday.</p>
  </main>);
}
`);

// Dockyard (health)
W(app("dockyard","page.tsx"), `import fs from 'node:fs'; import path from 'node:path';
import { DATA_ROOT } from '@/app/lib/paths';
export default function Dockyard(){
  const root = DATA_ROOT(); const d = (p:string)=>path.join(root,p);
  const cimsDrafts = fs.existsSync(d('cims/drafts')) ? fs.readdirSync(d('cims/drafts')).length : 0;
  const cimsOut = fs.existsSync(d('cims/outbox')) ? fs.readdirSync(d('cims/outbox')).length : 0;
  const cimsSent = fs.existsSync(d('cims/sent')) ? fs.readdirSync(d('cims/sent')).length : 0;
  return (<main className="mx-auto max-w-5xl p-6 space-y-4">
    <h1 className="text-2xl font-bold">Dockyard — System Health</h1>
    <ul className="list-disc ml-6">
      <li>CIMS drafts: {cimsDrafts}, outbox: {cimsOut}, sent: {cimsSent}</li>
      <li>OMS log file: {fs.existsSync(d('oms/logs/oms.log')) ? '✅' : '—'}</li>
      <li>OBARI log file: {fs.existsSync(d('obari/logs/obari.log')) ? '✅' : '—'}</li>
    </ul>
  </main>);
}
`);

// --- 4) Package.json convenience scripts (optional hint only) -----------------
const pkgPath = P("apps","studio","package.json");
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts.dev) pkg.scripts.dev = "next dev";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,2));
} catch {}

// --- 5) Done ------------------------------------------------------------------
console.log("✅ corAe bootstrap complete.");
console.log("Next:");
console.log("  1) node services/cims/daemon.mjs");
console.log("  2) npm -C apps/studio run dev");
console.log("  3) Open http://localhost:3000/cims and click “Generate Sample Draft”.");