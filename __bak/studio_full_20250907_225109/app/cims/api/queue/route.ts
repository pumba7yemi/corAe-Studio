
import { NextResponse } from 'next/server';
import fs from 'node:fs'; import path from 'node:path';
import { DATA_ROOT } from '@/app/lib/paths';
function R(dir:string){ const p=path.join(DATA_ROOT(), 'cims', dir); if(!fs.existsSync(p)) return []; return fs.readdirSync(p).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(p,f),'utf-8'))); }
export async function GET(){ return NextResponse.json({ drafts:R('drafts'), outbox:R('outbox'), sent:R('sent') }); }
