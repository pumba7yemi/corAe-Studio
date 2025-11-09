
import { NextRequest, NextResponse } from 'next/server'; import fs from 'node:fs'; import path from 'node:path';
export async function POST(req:NextRequest){
  const b=await req.json(); const id=String(b?.id||''); const action=String(b?.action||'approve'); const edits=b?.edits||{};
  const dir=path.join(process.cwd(),'data','cims','drafts'); const fp=path.join(dir, id+'.json'); if(!fs.existsSync(fp)) return NextResponse.json({ok:false},{status:404});
  const d=JSON.parse(fs.readFileSync(fp,'utf-8')); if(edits.subject) d.subject=edits.subject; if(edits.body) d.body=edits.body;
  d.status = action==='reject'?'rejected':'approved'; fs.writeFileSync(fp, JSON.stringify(d,null,2)); return NextResponse.json({ok:true, status:d.status});
}
