import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Expected shape: { id: string, time: string | null }
    // This stub accepts and acknowledges the override. Real persistence may be added later.
    console.log('chronological.update', body);
    return NextResponse.json({ ok: true, saved: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
