import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/**
 * CIMS VERSION ENDPOINT
 *
 * GET /api/cims/version
 * → Returns version metadata for corAe CIMS and any linked core packages.
 *
 * Helps CAIA, Automate, and Studio ensure schema compatibility.
 */

export async function GET() {
  try {
    // dynamically attempt to read package info if present
    let coreVersion = "not-detected";
    let studioVersion = "not-detected";

    try {
      const p = path.join(process.cwd(), "packages", "cims-core", "package.json");
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        const corePkg = JSON.parse(raw);
        coreVersion = corePkg?.version ?? "unknown";
      }
    } catch {}

    try {
      const p2 = path.join(process.cwd(), "package.json");
      if (fs.existsSync(p2)) {
        const raw2 = fs.readFileSync(p2, "utf8");
        const studio = JSON.parse(raw2);
        studioVersion = studio?.version ?? "unknown";
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      service: "corAe CIMS Layer",
      coreVersion,
      studioVersion,
      env: process.env.NODE_ENV ?? "development",
      platform: process.platform,
      node: process.version,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("CIMS Version endpoint failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to load version info" },
      { status: 500 },
    );
  }
}
