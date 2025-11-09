import "server-only";
import fs from "node:fs/promises";
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execCb);

export type GuardResult = { ok: boolean; out: string; err: string };

export async function runGuards(opts: {
  schemaPath: string;     // e.g. "prisma/schema.prisma"
  tscProject: string;     // e.g. "tsconfig.json"
  tryLint?: boolean;      // optionally run eslint
}): Promise<{
  prismaValidate: GuardResult;
  typecheck: GuardResult;
  lint?: GuardResult;
  pass: boolean;
}> {
  const prismaValidate: GuardResult = { ok: false, out: "", err: "" };
  try {
    await fs.access(opts.schemaPath);
    prismaValidate.ok = true;
    prismaValidate.out = "schema file present";
  } catch (e: any) {
    prismaValidate.err = String(e?.message ?? e);
  }

  const typecheck: GuardResult = { ok: false, out: "", err: "" };
  try {
    const cmd = `npx -y tsc -p "${opts.tscProject}" --noEmit`;
    const { stdout, stderr } = await exec(cmd, { timeout: 60_000 });
    typecheck.ok = true;
    typecheck.out = String(stdout || "").trim();
    typecheck.err = String(stderr || "").trim();
  } catch (e: any) {
    typecheck.err = String(e?.message ?? e);
    if (e?.stdout || e?.stderr) {
      typecheck.out = String(e.stdout ?? "") ?? "";
      typecheck.err = (String(e.stderr ?? "") || typecheck.err);
    }
  }

  let lint: GuardResult | undefined = undefined;
  if (opts.tryLint) {
    lint = { ok: false, out: "", err: "" };
    try {
      const cmd = `npx -y eslint . --ext .ts,.tsx`;
      const { stdout, stderr } = await exec(cmd, { timeout: 60_000 });
      lint.ok = true;
      lint.out = String(stdout || "").trim();
      lint.err = String(stderr || "").trim();
    } catch (e: any) {
      lint.err = String(e?.message ?? e);
      if (e?.stdout || e?.stderr) {
        lint.out = String(e.stdout ?? "") ?? "";
        lint.err = (String(e.stderr ?? "") || lint.err);
      }
    }
  }

  const pass = prismaValidate.ok && typecheck.ok && (lint ? lint.ok : true);
  return { prismaValidate, typecheck, lint, pass };
}