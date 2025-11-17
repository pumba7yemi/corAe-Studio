import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd(), 'apps/studio');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get('path') || '');
    const abs = resolve(ROOT, q);
    if (!abs.startsWith(ROOT))
      return NextResponse.json({ error: 'out_of_scope' }, { status: 403 });
    if (/([\\/]|^)\.env/i.test(q))
      return NextResponse.json({ error: 'denied' }, { status: 403 });

    const buf = readFileSync(abs);
    const text = buf.toString('utf8');
    return new NextResponse(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (e: any) {
    return NextResponse.json({ error: 'read_failed', detail: e?.message }, { status: 400 });
  }
}
