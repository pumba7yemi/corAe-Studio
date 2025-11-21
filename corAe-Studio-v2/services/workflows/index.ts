// services/workflows/index.ts
// Boots the workflow engine and registers all available workflow specs.
//
// Conventions (plugin-style):
// - Any package/file that exports `register(cb: (spec) => void)` will be loaded.
// - The callback receives each workflow `spec` (must contain `workflow_id`).
//
// Examples of compatible modules (optional, load-if-present):
//   "@/packages/workflows-core/register"
//   "@/packages/workflows-marketing/register"
//   "@/workflows/register"                  // local project-level register
//
// Usage elsewhere:
//   import { engine, startWorkflow } from "@/services/workflows";
//   await startWorkflow("marketing.loop.v1", { brand: "Choice Plus" });

import type { default as _unused } from "next"; // keeps TS in Next env happy
import { engine } from "./engine";

// ---------- boot-once guard (prevents double-registration in dev HMR)
declare global {
  // eslint-disable-next-line no-var
  var __corAeWorkflowsBooted__: boolean | undefined;
}
if (!global.__corAeWorkflowsBooted__) {
  global.__corAeWorkflowsBooted__ = true;
  void bootstrap().catch((e) =>
    console.error("❌ Workflows bootstrap failed:", e)
  );
}

// ---------- public re-exports
export { engine } from "./engine";
export async function startWorkflow(workflowId: string, data: any) {
  return engine.start(workflowId, data);
}

// ---------- bootstrap loader
async function bootstrap() {
  console.log("🧩 Booting workflows…");

  // Try each potential register module; ignore if missing.
  await tryLoadRegister("@/packages/workflows-core/register");
  await tryLoadRegister("@/packages/workflows-marketing/register");
  await tryLoadRegister("@/packages/workflows-sales/register");
  await tryLoadRegister("@/packages/workflows-content/register");
  await tryLoadRegister("@/workflows/register"); // local project-level

  // Fallback: try direct JSON specs in /workflows/*.json (optional)
  await tryLoadJsonSpecs();

  console.log("✅ Workflows boot complete. Registered:", engine.listWorkflows());
}

// ---------- helpers

type RegisterFn = (cb: (spec: any) => void) => void | Promise<void>;

/**
 * Dynamically import a module that exports `register(cb)`.
 * If the module doesn't exist, fail silently. Useful for optional packages.
 */
async function tryLoadRegister(modPath: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - dynamic path may not exist at build-time
    const mod = (await import(modPath)) as { register?: RegisterFn; default?: RegisterFn };

    const register: RegisterFn | undefined =
      (mod && (mod as any).register) || (mod && (mod as any).default);

    if (typeof register === "function") {
      await register((spec) => {
        try {
          engine.register(spec);
        } catch (e) {
          console.error(`⚠️ Failed registering spec from ${modPath}:`, e);
        }
      });
      console.log(`🔌 Loaded workflow package: ${modPath}`);
    } else {
      // no-op: module exists but doesn't expose register
    }
  } catch (err: any) {
    // Module not found → ignore quietly; log other errors
    if (!/Cannot find module|resolve/i.test(String(err?.message || err))) {
      console.warn(`⚠️ Error loading ${modPath}:`, err);
    }
  }
}

/**
 * Optional convenience: load raw JSON specs from /workflows/*.json
 * (server-only; requires Node runtime)
 */
async function tryLoadJsonSpecs() {
  try {
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const root = process.cwd();
    const dir = path.join(root, "workflows");

    // If folder doesn’t exist, exit quietly
    await fs
      .access(dir)
      .catch(() => Promise.reject(new Error("__NO_DIR__")))
      .catch((e) => {
        if ((e as Error).message === "__NO_DIR__") throw e;
      });

    const files = await fs.readdir(dir).catch(() => []);
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const full = path.join(dir, f);
      try {
        const raw = await fs.readFile(full, "utf-8");
        const spec = JSON.parse(raw);
        engine.register(spec);
        console.log(`📄 Loaded JSON workflow: ${f}`);
      } catch (e) {
        console.error(`⚠️ Failed to parse ${f}:`, e);
      }
    }
  } catch (e: any) {
    // No /workflows folder in this project or running on edge — ignore silently
    if ((e as Error).message !== "__NO_DIR__") {
      // Only surface non-missing-directory errors
      // (helps when running in Node vs Edge)
    }
  }
}