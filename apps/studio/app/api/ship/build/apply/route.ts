// apps/studio/app/api/ship/build/apply/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

// Local fallback types for ship presets; if your project provides '@/ship/presets' exported types,
// move these to a .d.ts file or remove them so that the real module's types are used.
type ShipBuildConfig = {
  brandType?: "corae" | "white-label" | string;
  vertical?: string;
  brandName?: string;
  modules?: string[];
  ts?: string;
};
type Vertical = string;

// If your project provides '@/ship/presets', add that module or a declaration file (e.g. globals.d.ts)
// so the real PRESETS export is used. This local fallback prevents TypeScript/compile errors when
// the module is not available in the current environment.
const PRESETS: Record<Vertical, { modules: string[]; label: string }> = {} as Record<
  Vertical,
  { modules: string[]; label: string }
>;

import appendEvent from "@/build/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "build", ".data", "ship");
const ACTIVE_FILE = path.join(DATA_DIR, "build.json");

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function GET() {
  await ensure();
  const raw = await fs.readFile(ACTIVE_FILE, "utf8").catch(() => "");
  const cfg = raw ? (JSON.parse(raw) as ShipBuildConfig) : null;
  return NextResponse.json({ ok: true, config: cfg });
}

export async function POST(req: NextRequest) {
  try {
    await ensure();
    const body = await req.json().catch(() => ({}));
    const brandType = (String(body.brandType || "").toLowerCase() as "corae" | "white-label") || "corae";
    const vertical = String(body.vertical || "").toLowerCase() as Vertical;
    const brandName = typeof body.brandName === "string" ? body.brandName : undefined;

    if (!vertical || !(vertical in PRESETS)) {
      return NextResponse.json({ ok: false, error: "Invalid or missing vertical" }, { status: 400 });
    }

    const preset = PRESETS[vertical];
    const config: ShipBuildConfig = {
      brandType,
      vertical,
      brandName,
      modules: [...preset.modules],
      ts: new Date().toISOString(),
    };

    await fs.writeFile(ACTIVE_FILE, JSON.stringify(config, null, 2), "utf8");

    // Build log event
    appendEvent.info({
      ts: new Date().toISOString(),
      level: "INFO",
      scope: "ship.build",
      action: "APPLY_PRESET",
      notes: `${brandType} → ${preset.label}${brandName ? ` (${brandName})` : ""}`,
      meta: { vertical, modules: config.modules }
    });

    return NextResponse.json({ ok: true, config });
  } catch (e: any) {
    appendEvent.error({
      ts: new Date().toISOString(),
      level: "ERROR",
      scope: "ship.build",
      action: "APPLY_ERROR",
      notes: e?.message || String(e),
    });
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
