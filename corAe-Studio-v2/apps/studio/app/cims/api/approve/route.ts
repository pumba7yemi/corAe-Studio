
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
