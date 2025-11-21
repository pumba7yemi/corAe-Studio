#!/usr/bin/env node
// Victor Mode™ import rewriter
// Rewrites every "@/lib/<...>" import to real domain paths.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply"); // dry-run by default

// Folders to scan
const GLOB_DIRS = [
  "app",
  "api",
  "brand",
  "caia",
  "cims",
  "memory-cube",
  "agent",
  "bbb",
  "hr",
  "obari",
  "report",
  "components",
  "lib" // catch any files still importing from "@/lib/*"
];

// Map "@/lib/<path>" ➜ "@/<REAL path>"
function mapLibPath(libSubpath) {
  // Specific redirects
  if (libSubpath.startsWith("theme/brandStore")) {
    return "brand/apply/brandStore" + libSubpath.slice("theme/brandStore".length);
  }
  if (libSubpath.startsWith("caia/"))  {
    return "caia/" + libSubpath.slice("caia/".length);
  }
  if (libSubpath.startsWith("cims/"))  {
    return "cims/" + libSubpath.slice("cims/".length);
  }
  if (libSubpath.startsWith("brand/")) {
    return "brand/" + libSubpath.slice("brand/".length);
  }
  if (libSubpath.startsWith("obariStore")) {
    // "@/lib/obariStore" -> "@/obari/store"
    return "obari/store" + libSubpath.slice("obariStore".length);
  }

  // Generic rule: drop "lib/" facade
  const parts = libSubpath.split("/");
  if (parts.length > 1) {
    return parts.join("/");
  }

  // Unresolved; report later
  return null;
}

// ---- utils ----
function listFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (["node_modules", ".next", "dist", "coverage", ".data", ".git"].includes(e.name)) continue;
        stack.push(p);
      } else if (/\.(tsx?|mjs|cjs|jsx?)$/.test(e.name)) {
        out.push(p);
      }
    }
  }
  return out;
}

const files = GLOB_DIRS.flatMap((d) => listFiles(path.join(ROOT, d))).filter(Boolean);
const importRe = /(['"])@\/lib\/([^'"]+)\1/g;

let changed = 0;
const unresolved = new Set();

for (const file of files) {
  let src = "";
  try { src = fs.readFileSync(file, "utf8"); } catch { continue; }
  if (!importRe.test(src)) continue;
  importRe.lastIndex = 0;

  const out = src.replace(importRe, (m, quote, sub) => {
    const mapped = mapLibPath(sub);
    if (!mapped) {
      unresolved.add(sub.split("/")[0]);
      return m; // keep original; ESLint rule can catch later
    }
    return `${quote}@/${mapped}${quote}`;
  });

  if (out !== src) {
    changed++;
    if (APPLY) {
      fs.writeFileSync(file, out, "utf8");
      console.log("✔ rewrote:", path.relative(ROOT, file));
    } else {
      console.log("ℹ would rewrite:", path.relative(ROOT, file));
    }
  }
}

console.log(`\n${APPLY ? "Applied" : "Dry-run"}: ${changed} file(s) ${APPLY ? "updated" : "would be updated"}.`);
if (unresolved.size) {
  console.log("\nUnresolved lib segments (add to mapLibPath if needed):");
  for (const seg of unresolved) console.log(" -", seg);
}