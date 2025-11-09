import { NextResponse } from "next/server";
import { searchMemory } from "../../../lib/caia";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const results = await searchMemory(q, 50);
  return NextResponse.json({ ok:true, q, results });
}
