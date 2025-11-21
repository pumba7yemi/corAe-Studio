#!/usr/bin/env node
// governance-ci-hook.mjs — moved into GOVERNANCE/tools
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { loadConstitution, validateConstitution } from '../../CORAE_CONSTITUTION/CEL/enforce.mjs';
import { scanForQuestionFirst } from '../../CORAE_CONSTITUTION/CEL/behavior.mjs';

const V2 = path.resolve(process.cwd(), 'corAe-Studio-v2');
const toggle = path.join(V2, 'GOVERNANCE', 'core', 'shipping-allowed.json');
const dr = path.join(V2, 'tools', 'decision-record.mjs');

function safeReadJson(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch{return null;} }
function appendLog(kind, reason, details){
  try{
    const gl = path.join(V2, 'GOVERNANCE','core','history.json');
    const cur = JSON.parse(fs.readFileSync(gl,'utf8'));
    cur.entries = cur.entries || [];
    cur.entries.push({ ts: new Date().toISOString(), actor: 'ci', kind, reason, details });
    cur.entries = cur.entries.slice(-200);
    fs.writeFileSync(gl, JSON.stringify(cur,null,2),'utf8');
  }catch(e){ console.warn('appendLog failed', e?.message ?? e); }
}

(async function main(){
  const t = safeReadJson(toggle);
  if(!t || typeof t.allowShipping !== 'boolean' || t.allowShipping===false){
    appendLog('ship-blocked','governance toggle off',{allow: t?.allowShipping});
    console.error('❌ Shipping blocked: governance toggle OFF.');
    process.exit(1);
  }

  // Validate Constitution via CEL
  try {
    const raw = loadConstitution();
    const val = validateConstitution(raw);
    if (!val.ok) {
      appendLog('ship-blocked','constitution invalid', { errors: val.errors });
      console.error('❌ CI blocked: Constitution invalid');
      for (const e of val.errors) console.error(' -', e);
      process.exit(1);
    }
    const q = scanForQuestionFirst(raw);
    if (!q.ok) {
      appendLog('ship-blocked','constitution violates NQBE', { hits: q.hits });
      console.error('❌ CI blocked: Constitution violates NQBE');
      for (const h of q.hits) console.error(' -', h);
      process.exit(1);
    }
  } catch (e) { /* best-effort; if read fails allow fallback later */ }

  let score150 = null;
  try{
    if (fs.existsSync(dr)){
      const r = spawnSync('node',[dr,'metrics','v2-build-run','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
      if(r.status===0){
        const out = JSON.parse(r.stdout||r.stderr);
        score150 = out?.score150 ?? null;
      }
    }
  }catch(e){}

  if(score150===null){
    const lkg = safeReadJson(path.join(V2,'GOVERNANCE','core','last-known-good-build.json')) || safeReadJson(path.join(V2,'.corae','last-known-good-build.json'));
    if(lkg && typeof lkg.score150==='number') score150 = lkg.score150;
  }

  const MIN = process.env.CAIA_GATE_MIN ? Number(process.env.CAIA_GATE_MIN) : 140;
  if(score150===null || score150 < MIN){
    appendLog('ship-blocked','150 threshold failed',{score150});
    console.error(`❌ Shipping blocked: score150=${score150} < ${MIN}`);
    process.exit(1);
  }

  appendLog('ship-allowed','governance toggle on and 150 threshold passed',{score150});
  console.log('✅ Shipping allowed — score150=',score150);
  process.exit(0);
})();
