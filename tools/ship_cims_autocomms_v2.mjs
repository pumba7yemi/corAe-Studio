#!/usr/bin/env node
// corAe CIMS — Auto-Comms with Overseer Mode
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const P=(...a)=>path.join(process.cwd(),...a);
const W=(p,c)=>{ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,c); };
const J=o=>JSON.stringify(o,null,2);
const H=s=>crypto.createHash("sha256").update(s).digest("hex");

// --- Data dirs
for (const d of ["data/cims/drafts","data/cims/outbox","data/cims/sent","data/cims/logs","data/cims/templates","data/cims/policies"]) {
  fs.mkdirSync(P(d),{recursive:true});
}
// --- Templates (seed)
W(P("data/cims/templates/base.json"), J({
  version:"1.0",
  templates:[
    {
      id:"price-lock-confirm",
      channel:["email","whatsapp"],
      subject:"corAe Confirmed: Pricelock for {{item}} at {{price}}",
      body:[
        "Dear {{vendor_name}},",
        "We confirm Pricelock for {{item}} @ {{price}} (valid through {{valid_to}}).",
        "Deal ID: {{deal_id}} | Week: {{week_id}}.",
        "Regards, corAe / OBARI."
      ].join("\n"),
      tags:["pricing","contract","obari"],
      risk: 70
    },
    {
      id:"po-ack",
      channel:["email"],
      subject:"PO {{po_number}} acknowledged",
      body:[
        "Hi {{vendor_name}},",
        "Your PO {{po_number}} is acknowledged. Delivery {{delivery_date}}.",
        "OBARI link: {{obari_link}}"
      ].join("\n"),
      tags:["ops","po","delivery"],
      risk: 25
    },
    {
      id:"invoice-reminder",
      channel:["email","whatsapp"],
      subject:"Invoice {{inv_number}} — status update",
      body:[
        "Finance update for {{inv_number}}: {{status}}.",
        "Pricelock ref: {{deal_id}} | OBARI: {{obari_link}}"
      ].join("\n"),
      tags:["finance","invoice"],
      risk: 40
    }
  ]
}));
// --- Policy (AI-first; overseer on high risk)
W(P("data/cims/policies/policy.json"), J({
  version:"1.0",
  auto_send_threshold: 49,            // <=49 auto-send; else overseer required
  always_overseer_tags: ["legal","termination","hr-sensitive","discount>20","bank-details-change"],
  channel_allow: ["email","whatsapp","note"],
  redact_rules: [
    {"match": "bank account", "action":"mask"},
    {"match": "password", "action":"drop-line"}
  ],
  overseer_contacts: [{"name":"Owner","route":"note"}]
}));

// --- Minimal drivers (stub)
W(P("services/cims/drivers/email_local.mjs"), `export async function sendEmail(msg){
  const fs = await import('node:fs'); const path = await import('node:path');
  const out = path.join(process.cwd(),'data','cims','outbox', msg.id+'.eml');
  const raw = ["To: "+msg.to, "Subject: "+msg.subject, "", msg.body].join("\\n");
  fs.writeFileSync(out, raw); return {ok:true, path:out};
}`);
W(P("services/cims/drivers/whatsapp_local.mjs"), `export async function sendWhats(msg){
  const fs = await import('node:fs'); const path = await import('node:path');
  const out = path.join(process.cwd(),'data','cims','outbox', msg.id+'.txt');
  const raw = ["WA to "+msg.to, msg.body].join("\\n");
  fs.writeFileSync(out, raw); return {ok:true, path:out};
}`);

// --- Daemon: generate from events (mock: sample + OBARI scan hook)
W(P("services/cims/daemon.mjs"), `#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=process.cwd(); const drafts=path.join(root,'data','cims','drafts');
const tPath=path.join(root,'data','cims','templates','base.json'); const pPath=path.join(root,'data','cims','policies','policy.json');
const logP=path.join(root,'data','cims','logs','daemon.log');
function log(x){ fs.appendFileSync(logP, new Date().toISOString()+" "+x+"\\n"); }
function h(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function fill(tpl,vars){ return tpl.replace(/{{\\s*([^}]+)\\s*}}/g,(_,k)=>String(vars[k]??'')); }

function riskDecision(tpl, policy, tags=[]){
  let r = tpl.risk||50;
  if ((tags||[]).some(t=>policy.always_overseer_tags.includes(t))) r = Math.max(r, 90);
  const requires = r>policy.auto_send_threshold;
  return {score:r, requires_overseer: requires};
}

function writeDraft(d){
  const id = d.id; const fp=path.join(drafts, id+'.json');
  fs.writeFileSync(fp, JSON.stringify(d,null,2));
}

async function generateSamples(){
  const templates = JSON.parse(fs.readFileSync(tPath,'utf-8')).templates;
  const policy = JSON.parse(fs.readFileSync(pPath,'utf-8'));
  const week_id = "2025-W36";
  const base = [
    {tpl:'po-ack', vars:{vendor_name:'PepsiCo', po_number:'PO-1234', delivery_date:'2025-09-06', obari_link:'/obari/ledger'}},
    {tpl:'price-lock-confirm', vars:{vendor_name:'Nestlé', item:'Dove Soap 4x90g', price:'AED 11.00', valid_to:'2025-09-15', deal_id:'D-7782', week_id}},
    {tpl:'invoice-reminder', vars:{inv_number:'INV-9982', status:'queued for payment 09/10', deal_id:'D-5541', obari_link:'/obari/ledger'}}
  ];
  for(const b of base){
    const tpl = templates.find(t=>t.id===b.tpl);
    for(const ch of tpl.channel){
      const body = fill(tpl.body, b.vars);
      const subject = fill(tpl.subject, b.vars);
      const draft = {
        id: 'cims_'+Math.random().toString(36).slice(2,10),
        template_id: tpl.id, channel: ch,
        to: ch==='whatsapp'? '+971500000000' : 'vendor@example.com',
        subject, body, created_at: new Date().toISOString(),
        tags: tpl.tags, policy:{}, status:'draft', evidence: {obari_link:b.vars.obari_link||'', week_id: b.vars.week_id||''}
      };
      const dec = riskDecision(tpl, policy, tpl.tags); draft.policy = {risk_score:dec.score, requires_overseer: dec.requires_overseer};
      draft._integrity = h(JSON.stringify({template_id:draft.template_id, subject:draft.subject, body:draft.body}));
      writeDraft(draft);
    }
  }
}

(async function main(){
  if (!fs.existsSync(drafts) || fs.readdirSync(drafts).length===0){ await generateSamples(); log("seeded sample drafts"); }
  console.log("CIMS daemon ready. Drafts in /data/cims/drafts. Policies in /data/cims/policies/policy.json");
  // In real mode, you would watch OBARI week files and create drafts on events.
})();`);

// --- API: list/approve/send
W(P("apps/studio/app/api/cims/list/route.ts"), `
import { NextResponse } from 'next/server'; import fs from 'node:fs'; import path from 'node:path';
export async function GET(){ const dir=path.join(process.cwd(),'data','cims','drafts'); const files=(fs.existsSync(dir)?fs.readdirSync(dir):[]).filter(f=>f.endsWith('.json'));
  const items=files.map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf-8'))); return NextResponse.json(items); }`);

W(P("apps/studio/app/api/cims/approve/route.ts"), `
import { NextRequest, NextResponse } from 'next/server'; import fs from 'node:fs'; import path from 'node:path';
export async function POST(req:NextRequest){
  const b=await req.json(); const id=String(b?.id||''); const action=String(b?.action||'approve'); const edits=b?.edits||{};
  const dir=path.join(process.cwd(),'data','cims','drafts'); const fp=path.join(dir, id+'.json'); if(!fs.existsSync(fp)) return NextResponse.json({ok:false},{status:404});
  const d=JSON.parse(fs.readFileSync(fp,'utf-8')); if(edits.subject) d.subject=edits.subject; if(edits.body) d.body=edits.body;
  d.status = action==='reject'?'rejected':'approved'; fs.writeFileSync(fp, JSON.stringify(d,null,2)); return NextResponse.json({ok:true, status:d.status});
}`);

W(P("apps/studio/app/api/cims/send/route.ts"), `
import { NextRequest, NextResponse } from 'next/server'; import fs from 'node:fs'; import path from 'node:path';
export async function POST(req:NextRequest){
  const b=await req.json(); const id=String(b?.id||'');
  const dir=path.join(process.cwd(),'data','cims','drafts'); const fp=path.join(dir, id+'.json'); if(!fs.existsSync(fp)) return NextResponse.json({ok:false},{status:404});
  const d=JSON.parse(fs.readFileSync(fp,'utf-8'));
  // policy gate
  const pol=JSON.parse(fs.readFileSync(path.join(process.cwd(),'data','cims','policies','policy.json'),'utf-8'));
  const require = (d.policy?.requires_overseer===true);
  if(require && d.status!=='approved'){ return NextResponse.json({ok:false, error:'overseer required'},{status:403}); }
  // driver
  let resp={ok:false}; if(d.channel==='email'){ const {sendEmail}=await import('../../../../../services/cims/drivers/email_local.mjs'); resp=await sendEmail({id:d.id,to:d.to,subject:d.subject,body:d.body}); }
  else if(d.channel==='whatsapp'){ const {sendWhats}=await import('../../../../../services/cims/drivers/whatsapp_local.mjs'); resp=await sendWhats({id:d.id,to:d.to,body:d.body}); }
  if(resp.ok){ const outDir=path.join(process.cwd(),'data','cims','sent'); fs.writeFileSync(path.join(outDir, d.id+'.json'), JSON.stringify({...d, sent_at:new Date().toISOString()},null,2)); fs.rmSync(fp); }
  return NextResponse.json({ok:resp.ok});
}`);

// --- UI: /cims (Queue + Templates + Policies)
W(P("apps/studio/app/cims/page.tsx"), `
'use client';
import React,{useEffect,useState} from 'react';
function Row({d, onApprove, onReject, onSend}:{d:any;onApprove:(id:string)=>void;onReject:(id:string)=>void;onSend:(id:string)=>void}){
  return (<div className="border rounded-xl p-3 bg-white dark:bg-zinc-900 shadow">
    <div className="text-xs text-zinc-500">{d.id} · {d.channel} · risk {d.policy?.risk_score} {d.policy?.requires_overseer?"· overseer":""}</div>
    <div className="mt-1 font-medium">{d.subject||"(no subject)"}</div>
    <pre className="mt-2 whitespace-pre-wrap text-sm">{d.body}</pre>
    <div className="mt-2 flex gap-2">
      <button onClick={()=>onApprove(d.id)} className="px-2 py-1 rounded bg-emerald-600 text-white text-xs">Approve</button>
      <button onClick={()=>onReject(d.id)} className="px-2 py-1 rounded bg-rose-600 text-white text-xs">Reject</button>
      <button onClick={()=>onSend(d.id)} className="px-2 py-1 rounded bg-black text-white text-xs">Send</button>
    </div>
  </div>);
}
export default function CIMS(){
  const [items,setItems]=useState<any[]>([]); const [busy,setBusy]=useState(false); const [note,setNote]=useState('');
  async function load(){ const r=await fetch('/api/cims/list'); setItems(await r.json()); }
  async function approve(id:string){ setBusy(true); await fetch('/api/cims/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action:'approve'})}); await load(); setBusy(false); }
  async function reject(id:string){ setBusy(true); await fetch('/api/cims/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action:'reject'})}); await load(); setBusy(false); }
  async function send(id:string){ setBusy(true); const r=await fetch('/api/cims/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); if(r.status===403){ alert('Overseer approval required.'); } await load(); setBusy(false); }
  useEffect(()=>{ load(); },[]);
  return (<main className="mx-auto max-w-6xl p-6 space-y-4">
    <h1 className="text-2xl font-semibold">CIMS — Auto-Comms (AI-first, Overseer-gated)</h1>
    <div className="text-sm text-zinc-600">All comms are AI-drafted; high-risk items require overseer approval. Low-risk auto-send permitted by policy.</div>
    <div className="mt-4 grid md:grid-cols-2 gap-3">{items.map(d=><Row key={d.id} d={d} onApprove={approve} onReject={reject} onSend={send}/>)}
      {items.length===0 && <div className="text-sm text-zinc-500">Queue empty. Use the daemon to generate from events.</div>}
    </div>
  </main>);
}
`);

console.log("✅ CIMS Auto-Comms installed. Start: node services/cims/daemon.mjs → open /cims");