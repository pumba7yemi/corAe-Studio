#!/usr/bin/env node
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
  if(/\d{4,}/.test(draft.body||"")) s += 20;
  return Math.min(99, s);
}

function applyRedactions(text, rules){
  let out = text;
  for(const r of rules||[]){
    if(r.action==="mask") out = out.replace(new RegExp(r.match,"ig"), "████");
    if(r.action==="drop-line"){
      out = out.split("\n").filter(line=>!new RegExp(r.match,"i").test(line)).join("\n");
    }
  }
  return out;
}

function ensureDirs(){
  ["drafts","outbox","sent","logs"].forEach(d=>fs.mkdirSync(D(d),{recursive:true}));
}

function log(line){
  const f = D("logs","daemon.log");
  fs.appendFileSync(f, new Date().toISOString()+" "+line+"\n");
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
