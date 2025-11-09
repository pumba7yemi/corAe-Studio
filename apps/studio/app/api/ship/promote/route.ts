// app/api/ship/promote/route.ts
import { NextRequest } from "next/server";
import { promoteZipToPrototype } from "@/lib/build/promote";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");
  if (!file) return new Response("Missing ?file=", { status: 400 });

  try {
    const result = await promoteZipToPrototype(file);
    return Response.json({ ok: true, result });
  } catch (e: any) {
    return new Response(String(e?.message || e), { status: 400 });
  }
}
