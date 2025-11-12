import { NextRequest } from "next/server";
// TEMP: expose in-memory list via symbol access on module (safe for dev)
import * as store from "../../../../../../packages/core-threads/src/threadStore";
const dbSym = (store as any).__DB__ as Map<string, any> | undefined;

export async function GET(_: NextRequest) {
  try {
    const arr =
      dbSym
        ? Array.from((dbSym as Map<string, any>).values())
        : []; // if not exposed, return empty; UI handles gracefully
    return Response.json({ ok: true, threads: arr });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
