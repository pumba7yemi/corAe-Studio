import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pillar = process.env.CAIA_PILLAR || null;
    const track = process.env.CAIA_TRACK || null;
    return NextResponse.json({ pillar, track });
  } catch (err: any) {
    return NextResponse.json({ pillar: null, track: null, error: String(err) }, { status: 500 });
  }
}
