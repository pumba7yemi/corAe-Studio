
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
