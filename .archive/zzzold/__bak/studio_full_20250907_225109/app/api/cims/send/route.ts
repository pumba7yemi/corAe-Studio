
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
}