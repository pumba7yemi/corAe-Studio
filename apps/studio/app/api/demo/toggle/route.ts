// File: apps/studio/app/api/demo/toggle/route.ts
// Purpose: API to toggle demo mode (on/off). Uses Zod for validation and setDemoState from demo mode helper.
// Monkey steps: Save file to the path above. Commit only if desired. After saving, POST to /api/demo/toggle with JSON { state: 'on' } to enable demo.

import { NextResponse } from "next/server";
import { z } from "zod";
import { setDemoState } from "../../../lib/demo/mode";

const BodySchema = z.object({ state: z.enum(["on", "off"]) });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.format() }, { status: 400 });
    }

    const state = parsed.data.state;
    // setDemoState expects boolean (true=on)
    await Promise.resolve(setDemoState(state === "on"));

    return NextResponse.json({ ok: true, state });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
