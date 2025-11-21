import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const base = path.join(process.cwd(), 'persons', slug, 'scripts');
    if (!fs.existsSync(base)) return NextResponse.json({ ok: false, output: 'no scripts found' });

    const spheres = fs.readdirSync(base).filter((n) => fs.statSync(path.join(base, n)).isDirectory());
    const out = {};
    for (const s of spheres) {
      const dir = path.join(base, s);
      const dailyPath = path.join(dir, 'daily.md');
      const haveYouPath = path.join(dir, 'have-you.json');
      const alignmentPath = path.join(dir, 'alignment.json');
      out[s] = {
        daily: fs.existsSync(dailyPath) ? fs.readFileSync(dailyPath, 'utf-8') : null,
        haveYou: fs.existsSync(haveYouPath) ? JSON.parse(fs.readFileSync(haveYouPath, 'utf-8')) : null,
        alignment: fs.existsSync(alignmentPath) ? JSON.parse(fs.readFileSync(alignmentPath, 'utf-8')) : null,
      };
    }

    return NextResponse.json({ ok: true, scripts: out });
  } catch (e: any) {
    return NextResponse.json({ ok: false, output: String(e.message || e) });
  }
}
