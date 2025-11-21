import { NextResponse } from 'next/server';
import { buildMergedPersonScripts } from '@/tools/person-script-builder.mts';
import path from 'node:path';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const body = await request.json().catch(() => ({}));
    const core = {
      slug,
      fullName: body.fullName || slug,
      roleTitle: body.roleTitle,
      employerName: body.employerName,
      spheres: Array.isArray(body.spheres) ? body.spheres : ['home'],
      roles: Array.isArray(body.roles) ? body.roles : []
    };
    const res = await buildMergedPersonScripts(core as any);
    return NextResponse.json({ ok: true, res });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
