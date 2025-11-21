import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body?.slug;
    if (!slug) return NextResponse.json({ ok: false, output: 'missing slug' });
    const V2 = path.join(process.cwd(), 'corAe-Studio-v2');
    const gen = path.join(V2, 'tools', 'generate-user-scripts.mjs');
    if (!fs.existsSync(gen)) return NextResponse.json({ ok: false, output: 'generator not found' });
    const { stdout, stderr } = spawnSync(process.execPath, [gen, slug], { cwd: V2, encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 });
    return NextResponse.json({ ok: true, output: (stdout || '') + (stderr || '') });
  } catch (e: any) {
    return NextResponse.json({ ok: false, output: String(e.message || e) });
  }
}
