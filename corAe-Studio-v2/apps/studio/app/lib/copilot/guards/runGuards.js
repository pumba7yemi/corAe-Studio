// apps/studio/app/lib/copilot/guards/runGuards.js
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execCb);

/**
 * cfg = { schemaPath: string, tscProject: string, tryLint?: boolean }
 */
export async function runGuards(cfg) {
  const prismaValidate = await safeExec(`npx prisma validate --schema="${cfg.schemaPath}"`);
  const typecheck = await safeExec(`npx tsc -p "${cfg.tscProject}"`);
  let lint = undefined;
  if (cfg.tryLint) {
    lint = await safeExec(`npx eslint . --max-warnings=0`);
  }
  const pass = prismaValidate.ok && typecheck.ok && (lint ? lint.ok : true);
  return { prismaValidate, typecheck, ...(lint ? { lint } : {}), pass };
}

async function safeExec(cmd) {
  try {
    const { stdout, stderr } = await exec(cmd, { windowsHide: true });
    return { ok: true, out: stdout ?? "", err: stderr ?? "" };
  } catch (e) {
    return { ok: false, out: e?.stdout ?? "", err: e?.stderr ?? (e?.message ?? String(e)) };
  }
}