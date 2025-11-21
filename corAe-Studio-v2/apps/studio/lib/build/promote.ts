// lib/build/promote.ts
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { logEvent } from "./log";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");

// Shipyard lives in apps/shipyard
const SHIPYARD_ROOT = path.join(ROOT, "apps", "shipyard");
const PROMOTE_DIR = path.join(SHIPYARD_ROOT, ".ship");
const PAYLOAD_DIR = path.join(PROMOTE_DIR, "payload");
const MANIFEST = path.join(PROMOTE_DIR, "manifest.json");

async function ensureDir(p: string) {
  await fsp.mkdir(p, { recursive: true });
}

export async function promoteZipToPrototype(fileName: string) {
  const abs = path.join(DIST_DIR, fileName);
  const rel = path.relative(DIST_DIR, abs);
  if (rel.startsWith("..") || !fileName.endsWith(".zip")) {
    throw new Error("Forbidden path");
  }
  if (!fs.existsSync(abs)) {
    throw new Error("File not found");
  }

  await ensureDir(PROMOTE_DIR);

  if (fs.existsSync(PAYLOAD_DIR)) {
    await fsp.rm(PAYLOAD_DIR, { recursive: true, force: true });
  }
  await ensureDir(PAYLOAD_DIR);

  // unzip
  const zip = new AdmZip(abs);
  zip.extractAllTo(PAYLOAD_DIR, true);

  const manifest = {
    sourceFile: fileName,
    promotedAt: new Date().toISOString(),
    payloadDir: "payload"
  };
  await fsp.writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");

  await logEvent({
    ts: new Date().toISOString(),
    level: "INFO",
    scope: "ship.promote",
    action: "PROMOTED",
    file: fileName,
    notes: "ZIP promoted to Shipyard prototype",
    meta: { dest: PROMOTE_DIR }
  });

  return manifest;
}
