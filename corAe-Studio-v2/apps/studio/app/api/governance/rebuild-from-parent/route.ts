import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { buildMergedPersonScripts } from '@/tools/person-script-builder.mts';

export async function POST() {
  try {
    const ROOT = path.resolve(process.cwd());
    const personsDir = path.join(ROOT, 'persons');
    if (!fs.existsSync(personsDir)) return NextResponse.json({ ok: true, rebuilt: 0 });
    const slugs = fs.readdirSync(personsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    const results: any[] = [];
    for (const s of slugs) {
      try {
        const core = { slug: s, fullName: s, spheres: ['home','work','business'], roles: [] };
        const out = await buildMergedPersonScripts(core as any);
        results.push({ slug: s, ok: true, out });
      } catch (e) {
        results.push({ slug: s, ok: false, error: String(e?.message || e) });
      }
    }
    return NextResponse.json({ ok: true, rebuilt: results.length, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
