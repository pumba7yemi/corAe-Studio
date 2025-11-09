// app/api/ship/export/route.ts
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { createShipBundle } from "@/lib/build/ship";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Optional flags via query (?include-public&include-services&include-scripts&extra=foo,bar&brand=corae)
    const url = new URL(req.url);
    const includePublic   = url.searchParams.has("include-public");
    const includeServices = url.searchParams.has("include-services");
    const includeScripts  = url.searchParams.has("include-scripts");
    const brand           = (url.searchParams.get("brand") || "corae").toLowerCase();
    const extraAppDirs    = (url.searchParams.get("extra") || "")
      .split(",").map(s => s.trim()).filter(Boolean);

    const zipPath = await createShipBundle({
      brand: { slug: brand, name: brand },
      includePublic,
      includeServices,
      includeScripts,
      extraAppDirs
    });

    if (!fs.existsSync(zipPath)) {
      return new Response("Build not found after creation", { status: 500 });
    }

    const stream = fs.createReadStream(zipPath);
    return new Response(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${path.basename(zipPath)}"`
      }
    });
  } catch (err) {
    console.error("ship/export error:", err);
    return new Response("Export failed", { status: 500 });
  }
}
