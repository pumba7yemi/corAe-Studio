
import { NextResponse } from 'next/server'; import fs from 'node:fs'; import path from 'node:path';
export async function GET(){ const dir=path.join(process.cwd(),'data','cims','drafts'); const files=(fs.existsSync(dir)?fs.readdirSync(dir):[]).filter(f=>f.endsWith('.json'));
  const items=files.map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf-8'))); return NextResponse.json(items); }