import { NextRequest, NextResponse } from 'next/server';
import {
  readDockyardMemory,
  readShipMemory,
  readShipSeed,
  appendDockyardMemory,
  type MemoryItem,
} from '@/caia/memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/caia/memory
 *  - ?scope=dockyard|ship (optional)
 *  - ?limit=NUMBER (optional, default 200)
 *  - ?seed=1 to include ship seed (system/facts)
 *
 * Examples:
 *  /api/caia/memory                       -> { dockyard, ship }
 *  /api/caia/memory?scope=dockyard        -> { dockyard }
 *  /api/caia/memory?scope=ship&seed=1     -> { ship, seed }
 *  /api/caia/memory?limit=50              -> { dockyard, ship }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope'); // 'dockyard' | 'ship' | null
    const limit = Math.max(1, Math.min(1000, Number(searchParams.get('limit')) || 200));
    const wantSeed = searchParams.get('seed') === '1';

    const out: Record<string, unknown> = {};

    if (!scope || scope === 'dockyard') {
      out.dockyard = await readDockyardMemory(limit);
    }
    if (!scope || scope === 'ship') {
      out.ship = await readShipMemory(limit);
    }
    if (wantSeed) {
      out.seed = await readShipSeed();
    }

    return NextResponse.json({ ok: true, ...out });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Failed to read memory' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/caia/memory
 * Body:
 *  {
 *    "role": "user" | "assistant" | "system" | "note",
 *    "text": "string",
 *    "user": "optional who",
 *    "scope": "dockyard" | "ship"   // only 'dockyard' is appendable here
 *  }
 *
 * Notes:
 *  - We **only append to dockyard** memory from Studio.
 *  - Ship memory is read-only here (comes from seed or promotions).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<MemoryItem> & { scope?: 'dockyard' | 'ship' };

    if (!body?.text || !body?.role) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: role, text' },
        { status: 400 }
      );
    }

    if (body.scope && body.scope !== 'dockyard') {
      return NextResponse.json(
        { ok: false, error: 'Only dockyard memory is appendable from Studio' },
        { status: 400 }
      );
    }

    await appendDockyardMemory({
      ts: new Date().toISOString(),
      role: body.role,
      text: String(body.text),
      user: body.user,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Failed to append memory' },
      { status: 500 }
    );
  }
}