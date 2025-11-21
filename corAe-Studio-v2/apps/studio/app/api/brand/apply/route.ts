import { NextRequest, NextResponse } from 'next/server';
import { BrandPreset, savePreset, setActive } from '../../../../lib/theme/brandStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Simple guard
    const preset: BrandPreset = {
      name: String(body?.name || 'custom'),
      primary: String(body?.primary || '#7c5cff'),
      secondary: String(body?.secondary || '#22c55e'),
      background: String(body?.background || '#0b0c10'),
      surface: String(body?.surface || '#111217'),
      text: String(body?.text || '#eaeaf0'),
      muted: String(body?.muted || '#9aa0aa'),
      radius: Number(body?.radius ?? 14),
      fontFamily: String(body?.fontFamily || "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'")
    };

    await savePreset(preset);
    await setActive(preset);

    return NextResponse.json({ ok: true, applied: preset.name });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
