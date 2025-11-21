import { NextResponse } from 'next/server';
import { join, resolve } from 'path';
import { readdirSync, statSync } from 'fs';

const ROOT = resolve(process.cwd(), 'apps/studio');
const DENY = ['node_modules', '.git', '.next', '.pnpm', 'dist', 'build'];
const DENY_FILES = [/^\.env/i];

function isDenied(p: string) {
  return DENY.some((d) => p.split(/[\\/]/).includes(d));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get('path') || '');
    const abs = resolve(ROOT, q);
    if (!abs.startsWith(ROOT))
      return NextResponse.json({ error: 'out_of_scope' }, { status: 403 });

    const rel = abs.replace(ROOT, '').replace(/^[\\/]/, '');
    if (isDenied(rel))
      return NextResponse.json({ error: 'denied' }, { status: 403 });

    const items = readdirSync(abs)
      .filter((n) => !DENY_FILES.some((rx) => rx.test(n)))
      .map((name) => {
        const s = statSync(join(abs, name));
        return { name, type: s.isDirectory() ? 'dir' : 'file' };
      });

    return NextResponse.json({ root: 'apps/studio', path: rel, items });
  } catch (e: any) {
    return NextResponse.json({ error: 'list_failed', detail: e?.message }, { status: 400 });
  }
}
