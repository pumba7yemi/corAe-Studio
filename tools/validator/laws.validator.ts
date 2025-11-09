// /tools/validator/laws.validator.ts
// corAe — Constitutional & OBARI Law Validator (stub v1)
// Goal: Read constitutional laws (FileLogic + OBARI) and audit the repo for:
// - hierarchy sanity
// - presence of constitutional laws
// - naming rules for /laws
// - write-once store existence + filename hash patterns
// - OBARI '=' baton filename chain sanity (BASE -> REPORT_ADJUSTED -> FINAL)
//
// Design notes:
// - Pure TS + Node built-ins only. No path aliases.
// - Keep this as a callable library function; a separate CLI wrapper can invoke it.
//
// Usage (programmatic):
//   import { runLawAudit } from "../../tools/validator/laws.validator";
//   const report = await runLawAudit(process.cwd());
//   console.log(report);

import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";

// Import constitutional laws (side-by-side, no aliases)
import FILELOGIC_LAW_DEFAULT, { FILELOGIC_LAW } from "../../laws/filelogic.law";
import OBARI_LAW_DEFAULT, { OBARI_Law } from "../../laws/obari.law";

// ───────────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────────

type Finding = {
  level: "PASS" | "WARN" | "FAIL";
  code: string;
  message: string;
  where?: string; // relative path or contextual hint
};

export type AuditReport = {
  root: string;
  summary: {
    pass: number;
    warn: number;
    fail: number;
    total: number;
  };
  findings: Finding[];
};

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

function rel(root: string, p: string) {
  return path.relative(root, p) || ".";
}

async function pathExists(p: string) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield full;
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function isLowerKebab(name: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*\.law\.ts$/.test(name);
}

function hasSha256Fragment(filename: string) {
  // Very loose 64-hex check anywhere in name
  return /[a-f0-9]{64}/i.test(filename);
}

function matchesBasePattern(name: string) {
  // {dealId}-{sha256}.json
  return /^[\w.-]+-[a-f0-9]{64}\.json$/i.test(name);
}

function matchesAdjustedPattern(name: string) {
  // {dealId}-{baseSha256}-{sha256}-rpt.json
  return /^[\w.-]+-[a-f0-9]{64}-[a-f0-9]{64}-rpt\.json$/i.test(name);
}

function matchesFinalPattern(name: string) {
  // {dealId}-{adjustSha256}-{sha256}-final.json
  return /^[\w.-]+-[a-f0-9]{64}-[a-f0-9]{64}-final\.json$/i.test(name);
}

// ───────────────────────────────────────────────────────────────────────────────
// Auditors (mapped to FILELOGIC_LAW.audit.validators)
// ───────────────────────────────────────────────────────────────────────────────

async function validateHierarchy(root: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const reqDirs = FILELOGIC_LAW.hierarchy.map((d) => path.join(root, d));

  // required dirs presence (WARN if missing, not hard-fail for early repos)
  for (const d of reqDirs) {
    const exists = await pathExists(d);
    findings.push({
      level: exists ? "PASS" : "WARN",
      code: "HIERARCHY_DIR",
      message: `${exists ? "Found" : "Missing"} directory ${rel(root, d)}`,
      where: rel(root, d),
    });
  }

  // forbids "FileLogic" directory anywhere
  for await (const p of walk(root)) {
    const b = path.basename(p);
    if (b.toLowerCase() === "filelogic" && fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      findings.push({
        level: "FAIL",
        code: "HIERARCHY_NO_FILELOGIC_DIR",
        message: "Forbidden '/FileLogic' directory detected. FileLogic is a law, not a folder.",
        where: rel(root, p),
      });
    }
  }

  return findings;
}

async function validateLawsPresence(root: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const filelogic = path.join(root, "laws", "filelogic.law.ts");
  const anyDomainLaw = await (async () => {
    const dir = path.join(root, "laws");
    if (!(await pathExists(dir))) return false;
    const files = await fsp.readdir(dir);
    return files.some((f) => f.endsWith(".law.ts") && f !== "filelogic.law.ts");
  })();

  const flExists = await pathExists(filelogic);
  findings.push({
    level: flExists ? "PASS" : "FAIL",
    code: "LAWS_FILELOGIC_PRESENT",
    message: flExists
      ? "Found constitutional meta-law: /laws/filelogic.law.ts"
      : "Missing /laws/filelogic.law.ts (required).",
    where: rel(root, filelogic),
  });

  findings.push({
    level: anyDomainLaw ? "PASS" : "WARN",
    code: "LAWS_DOMAIN_PRESENT",
    message: anyDomainLaw
      ? "At least one domain law present in /laws."
      : "No domain laws found alongside filelogic.law.ts.",
    where: "laws/",
  });

  return findings;
}

async function validateNaming(root: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const dir = path.join(root, "laws");
  if (!(await pathExists(dir))) {
    findings.push({
      level: "WARN",
      code: "NAMING_LAWS_DIR_MISSING",
      message: "No /laws directory yet; skipping naming audit.",
      where: "laws/",
    });
    return findings;
  }

  const files = await fsp.readdir(dir);
  for (const f of files) {
    if (!f.endsWith(".ts")) continue;
    const ok = isLowerKebab(f);
    findings.push({
      level: ok ? "PASS" : "FAIL",
      code: "NAMING_LAW_FILE",
      message: ok
        ? `Law filename OK: ${f}`
        : `Law filename violates lower-kebab + .law.ts: ${f}`,
      where: rel(root, path.join(dir, f)),
    });
  }

  return findings;
}

async function validateWriteOnceStores(root: string): Promise<Finding[]> {
  const findings: Finding[] = [];

  for (const store of FILELOGIC_LAW.writeOnceStores) {
    const dir = path.join(root, store.path);
    const exists = await pathExists(dir);
    findings.push({
      level: exists ? "PASS" : "WARN",
      code: "WOS_DIR",
      message: `${exists ? "Found" : "Missing"} write-once store: ${store.path}`,
      where: rel(root, dir),
    });

    if (!exists) continue;

    // filename hash presence
    const files = await fsp.readdir(dir).catch(() => []);
    for (const f of files) {
      const hasHash = hasSha256Fragment(f);
      findings.push({
        level: hasHash ? "PASS" : "FAIL",
        code: "WOS_HASH_IN_NAME",
        message: hasHash
          ? `Hash fragment present in filename: ${f}`
          : `Hash fragment missing from filename: ${f}`,
        where: rel(root, path.join(dir, f)),
      });

      // Pattern-specific checks per OBARI stores
      if (store.path.endsWith("/equals")) {
        findings.push({
          level: matchesBasePattern(f) ? "PASS" : "WARN",
          code: "OBARI_BASE_PATTERN",
          message: matchesBasePattern(f)
            ? `BASE pattern OK: ${f}`
            : `Filename not matching BASE pattern: ${f}`,
          where: rel(root, path.join(dir, f)),
        });
      } else if (store.path.endsWith("/equals-adjusted")) {
        findings.push({
          level: matchesAdjustedPattern(f) ? "PASS" : "WARN",
          code: "OBARI_ADJUSTED_PATTERN",
          message: matchesAdjustedPattern(f)
            ? `ADJUSTED pattern OK: ${f}`
            : `Filename not matching ADJUSTED pattern: ${f}`,
          where: rel(root, path.join(dir, f)),
        });
      } else if (store.path.endsWith("/equals-final")) {
        findings.push({
          level: matchesFinalPattern(f) ? "PASS" : "WARN",
          code: "OBARI_FINAL_PATTERN",
          message: matchesFinalPattern(f)
            ? `FINAL pattern OK: ${f}`
            : `Filename not matching FINAL pattern: ${f}`,
          where: rel(root, path.join(dir, f)),
        });
      }
    }
  }

  return findings;
}

// Light-weight chain sanity using filenames only (deep JSON/hash validation can be v2)
async function validateObariBatonChain(root: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const baseDir = path.join(root, ".data/equals");
  const adjDir = path.join(root, ".data/equals-adjusted");
  const finDir = path.join(root, ".data/equals-final");

  if (!(await pathExists(baseDir)) || !(await pathExists(adjDir)) || !(await pathExists(finDir))) {
    findings.push({
      level: "WARN",
      code: "OBARI_CHAIN_SKIPPED",
      message: "One or more OBARI stores missing; skipping chain linkage audit.",
    });
    return findings;
  }

  const bases = await fsp.readdir(baseDir);
  const adjusted = await fsp.readdir(adjDir);
  const finals = await fsp.readdir(finDir);

  // index by hashes for quick lookups
  const baseHashes = new Set<string>();
  for (const f of bases) {
    const m = f.match(/-([a-f0-9]{64})\.json$/i);
    if (m) baseHashes.add(m[1]);
  }

  const adjustedPairs = new Map<string, string>(); // adjustSha -> baseSha
  for (const f of adjusted) {
    const m = f.match(/-([a-f0-9]{64})-([a-f0-9]{64})-rpt\.json$/i);
    if (m) adjustedPairs.set(m[2], m[1]); // adjustedSha -> baseSha
  }

  const finalPairs = new Map<string, string>(); // finalSha -> adjustedSha
  for (const f of finals) {
    const m = f.match(/-([a-f0-9]{64})-([a-f0-9]{64})-final\.json$/i);
    if (m) finalPairs.set(m[2], m[1]); // finalSha -> adjustedSha
  }

  // Validate adjusted->base references exist
  for (const [adjustSha, baseSha] of adjustedPairs.entries()) {
    const ok = baseHashes.has(baseSha);
    findings.push({
      level: ok ? "PASS" : "FAIL",
      code: "OBARI_ADJUST_REF_BASE",
      message: ok
        ? `Adjusted references existing BASE (${baseSha.slice(0, 8)}…)`
        : `Adjusted references missing BASE (${baseSha.slice(0, 8)}…)`,
    });
  }

  // Validate final->adjusted references exist
  const adjustedShas = new Set<string>(Array.from(adjustedPairs.keys()));
  for (const [finalSha, adjSha] of finalPairs.entries()) {
    const ok = adjustedShas.has(adjSha);
    findings.push({
      level: ok ? "PASS" : "FAIL",
      code: "OBARI_FINAL_REF_ADJUST",
      message: ok
        ? `Final references existing ADJUSTED (${adjSha.slice(0, 8)}…)`
        : `Final references missing ADJUSTED (${adjSha.slice(0, 8)}…)`,
    });
  }

  return findings;
}

// ───────────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────────

export async function runLawAudit(rootDir?: string): Promise<AuditReport> {
  const root = rootDir ? path.resolve(rootDir) : process.cwd();

  // Touch imported laws so unused-import checkers stay happy
  void FILELOGIC_LAW_DEFAULT;
  void OBARI_LAW_DEFAULT;
  // (The constants are used implicitly to parameterize expected stores & rules.)

  const results: Finding[] = [];

  results.push(
    ...(await validateHierarchy(root)),
    ...(await validateLawsPresence(root)),
    ...(await validateNaming(root)),
    ...(await validateWriteOnceStores(root)),
    ...(await validateObariBatonChain(root))
  );

  const summary = results.reduce(
    (acc, f) => {
      acc.total++;
      if (f.level === "PASS") acc.pass++;
      else if (f.level === "WARN") acc.warn++;
      else acc.fail++;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0, total: 0 }
  );

  return { root, summary, findings: results };
}

export default runLawAudit;