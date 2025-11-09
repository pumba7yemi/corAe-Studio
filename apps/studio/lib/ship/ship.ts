// lib/build/ship.ts
// One-Build: create a ZIP under ./dist and return its absolute path.

import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";

// Adjust these two imports if your files live elsewhere under lib/
import { listEvents } from "@/lib/build/log";
import * as Tokens from "@/lib/theme/tokens";

export type OneBuildOptions = {
  brand?: { name?: string; slug?: string };
  modules?: string[];                // e.g., ["Business","Work","Home","Studio","Shared"]
  includePublic?: boolean;           // include ./public
  includeServices?: boolean;         // include ./services
  includeScripts?: boolean;          // include ./scripts
  extraAppDirs?: string[];           // additional folders to bundle (relative to repo root)
};

const DEFAULT_MODULES = ["Business", "Work", "Home", "Studio", "Shared"];

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function addDirIfExists(archive: archiver.Archiver, absPath: string, dest: string) {
  try {
    if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
      archive.directory(absPath, dest);
    }
  } catch { /* ignore */ }
}

/**
 * Creates a ZIP file in ./dist and returns its absolute path.
 */
export async function createShipBundle(opts: OneBuildOptions = {}) {
  const cwd = process.cwd();

  // Your project is using **root app** and **root lib**
  const appDir      = path.join(cwd, "app");
  const libDir      = path.join(cwd, "lib");
  const stylesDir   = path.join(cwd, "styles");     // optional if present
  const publicDir   = path.join(cwd, "public");
  const servicesDir = path.join(cwd, "services");
  const scriptsDir  = path.join(cwd, "scripts");

  const now = new Date();
  const stamp = now.toISOString().replace(/[:]/g, "-");
  const brandSlug = opts.brand?.slug || "corae";
  const fileBase = `ship-${brandSlug}-${stamp}`;
  const distDir = path.join(cwd, "dist");
  ensureDir(distDir);

  const outPath = path.join(distDir, `${fileBase}.zip`);
  const output = fs.createWriteStream(outPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  // plumb
  const finalize = new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    archive.on("warning", (err) => { console.warn("[One-Build] warning:", err); });
    archive.on("error", reject);
    archive.pipe(output);
  });

  // manifests
  const manifest = {
    name: opts.brand?.name || "corAe Ship",
    slug: brandSlug,
    version: "1.0.0",
    createdAt: now.toISOString(),
    modules: opts.modules?.length ? opts.modules : DEFAULT_MODULES,
    builder: "corAe One-Build (CLI)",
  };
  archive.append(JSON.stringify(manifest, null, 2), { name: "onebuild.json" });

  try {
    const events = await listEvents();
    archive.append(JSON.stringify(events ?? [], null, 2), { name: "build-log.json" });
  } catch (e) {
    archive.append(JSON.stringify({ error: String(e) }, null, 2), { name: "build-log.error.json" });
  }

  try {
    const tokens: Record<string, unknown> = { ...(Tokens as any) };
    archive.append(JSON.stringify(tokens, null, 2), { name: "theme-tokens.json" });
  } catch (e) {
    archive.append(JSON.stringify({ error: String(e) }, null, 2), { name: "theme-tokens.error.json" });
  }

  // core source trees
  addDirIfExists(archive, appDir, "app");
  addDirIfExists(archive, libDir, "lib");
  addDirIfExists(archive, stylesDir, "styles");

  // optional trees
  if (opts.includePublic)   addDirIfExists(archive, publicDir,   "public");
  if (opts.includeServices) addDirIfExists(archive, servicesDir, "services");
  if (opts.includeScripts)  addDirIfExists(archive, scriptsDir,  "scripts");

  // extras (relative to repo root)
  for (const rel of opts.extraAppDirs || []) {
    const abs = path.isAbsolute(rel) ? rel : path.join(cwd, rel);
    const dest = path.join("extra", path.basename(abs));
    addDirIfExists(archive, abs, dest);
  }

  // finalize
  await archive.finalize();
  await finalize;

  return outPath;
}
