// apps/ship/app/api/update/check/route.ts
// GET /api/update/check?clientVersion=1.0.0
// Compares the provided clientVersion against the server's SHIP_VERSION and
// returns whether an update is available and its severity (major/minor/patch).

import { NextResponse } from "next/server";
import { z } from "zod";
import { SHIP_VERSION, parse as parseSemver, cmp } from "../../../version";

const Semver = z.string().regex(/^\d+\.\d+\.\d+$/, "Invalid semver (expected MAJ.MIN.PAT)");

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clientVersion = url.searchParams.get("clientVersion");

    if (!clientVersion) {
      return NextResponse.json({ ok: true, currentVersion: SHIP_VERSION });
    }

    const parsed = Semver.safeParse(clientVersion);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_version", details: parsed.error.flatten() }, { status: 400 });
    }

    // Determine if server version is newer than client
    const comparison = cmp(SHIP_VERSION as any, clientVersion as any); // cmp(a,b): -1 | 0 | 1
    const updateAvailable = comparison === 1;

    // If update available, compute level: major > minor > patch
    let level: "major" | "minor" | "patch" | null = null;
    if (updateAvailable) {
      const A = parseSemver(SHIP_VERSION as any);
      const B = parseSemver(clientVersion as any);
      if (A.maj !== B.maj) level = "major";
      else if (A.min !== B.min) level = "minor";
      else level = "patch";
    }

    return NextResponse.json({
      ok: true,
      currentVersion: SHIP_VERSION,
      clientVersion,
      updateAvailable,
      level,
    });
  } catch (err) {
    console.error("[ship/update/check] error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
