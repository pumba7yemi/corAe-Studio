// lib/build/ship.ts
// Creates a ZIP bundle of the app ("One-Build") for download or CLI use.

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";
import { listEvents } from "./log";

export type OneBuildOptions = {
  brand?: { name?: string; slug?: string };
  modules?: string[];                 // e.g. ["Business","Work","Home","Studio","Shared"]
  includePublic?: boolean;            // bundle ./public
  includeServices?: boolean;          // bundle ./services (if present)
  includeScripts?: boolean;           // bundle ./scripts
  extraAppDirs?: string[];            // additional folders to include (relative or absolute)
};

const DEFAULT_MODULES = ["Business", "Work", "Home", "Studio", "Shared"];

function ensureDir(absPath: string) {
  if (!fs.existsSync(absPath)) fs.mkdirSync(absPath, { recursive: true });
}

function addDirIfExists(archive: archiver.Archiver, absPath: string, dest: string) {
  try {
    if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
      archive.directory(absPath, dest);
    }
  } catch {
    // ignore
  }
}

function safeJSONStringify(val: unknown) {
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return JSON.stringify({ note: "non-serializable value skipped" });
  }
}

/**
 * Build a ship ZIP on disk and return its absolute path.
 */
export async function createShipBundle(opts: OneBuildOptions = {}): Promise<string> {
  const cwd = process.cwd();

  const appDir = path.join(cwd, "app");
  const libDir = path.join(cwd, "lib");
  const stylesDir = path.join(cwd, "styles");
  const publicDir = path.join(cwd, "public");
  const servicesDir = path.join(cwd, "services");
  const scriptsDir = path.join(cwd, "scripts");

  const now = new Date();
  const stamp = now.toISOString().replace(/[:]/g, "-");
  const brandSlug = (opts.brand?.slug || "corae").toLowerCase();

  const distDir = path.join(cwd, "dist");
  ensureDir(distDir);

  const fileBase = `ship-${brandSlug}-${stamp}`;
  const outPath = path.join(distDir, `${fileBase}.zip`);

  // Prepare archiver
  const output = fs.createWriteStream(outPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  const finalized = new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    archive.on("warning", (err) => {
      // keep non-fatal warnings visible but don’t fail the build
      console.warn("[onebuild] warning:", (err as Error).message);
    });
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
  });

  // Manifest
  const manifest = {
    name: opts.brand?.name || "corAe Ship",
    slug: brandSlug,
    version: "1.0.0",
    createdAt: now.toISOString(),
    modules: opts.modules?.length ? opts.modules : DEFAULT_MODULES,
    builder: "corAe One-Build"
  };
  archive.append(JSON.stringify(manifest, null, 2), { name: "onebuild.json" });

  // Build log (best effort)
  try {
    const events = await listEvents(300);
    archive.append(safeJSONStringify(events ?? []), { name: "build-log.json" });
  } catch (e) {
    archive.append(
      JSON.stringify({ error: (e as Error).message }, null, 2),
      { name: "build-log.error.json" }
    );
  }

  // Core project trees
  addDirIfExists(archive, appDir, "app");
  addDirIfExists(archive, libDir, "lib");
  addDirIfExists(archive, stylesDir, "styles");

  // Optional trees
  if (opts.includePublic) addDirIfExists(archive, publicDir, "public");
  if (opts.includeServices) addDirIfExists(archive, servicesDir, "services");
  if (opts.includeScripts) addDirIfExists(archive, scriptsDir, "scripts");

  // Extra folders
  for (const rel of opts.extraAppDirs || []) {
    const abs = path.isAbsolute(rel) ? rel : path.join(cwd, rel);
    const dest = path.join("extra", path.basename(abs));
    addDirIfExists(archive, abs, dest);
  }

  // Finalize
  await archive.finalize();
  await finalized;

  // Safety: verify file exists and is non-empty
  try {
    const stat = await fsp.stat(outPath);
    if (!stat.size) throw new Error("created zip is empty");
  } catch (e) {
    throw new Error(`Ship build failed: ${(e as Error).message}`);
  }

  return outPath;
}

/**
 * Helper for API route usage — returns a readable stream for Response().
 */
export async function createShipArchiveStream(opts: OneBuildOptions = {}) {
  const zipPath = await createShipBundle(opts);
  return fs.createReadStream(zipPath);
}
