#!/usr/bin/env node
// corAe Ship Dev Launcher
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";

const ROOT = process.cwd();
const SHIP_DIR = path.join(ROOT, "corAe-Studio-v2", "apps", "ship");
const DEFAULT_PORT = process.env.PORT || "3012";

function launchShipDev() {
  const isWin = os.platform() === "win32";

  const child = spawn(
    isWin ? "pnpm.cmd" : "pnpm",
    ["dev"],
    {
      cwd: SHIP_DIR,
      stdio: "inherit",
      env: {
        ...process.env,
        PORT: DEFAULT_PORT,
      },
    }
  );

  child.on("exit", (code) => {
    console.log(`[dev-ship-launcher] Ship dev exited with code ${code}`);
    process.exit(code ?? 0);
  });

  // best effort: open browser
  const url = `http://localhost:${DEFAULT_PORT}/`;

  try {
    if (isWin) {
      spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true });
    } else if (os.platform() === "darwin") {
      spawn("open", [url], { stdio: "ignore", detached: true });
    } else {
      spawn("xdg-open", [url], { stdio: "ignore", detached: true });
    }
  } catch (err) {
    console.warn("[dev-ship-launcher] Failed to auto-open browser:", err?.message || err);
  }
}

launchShipDev();
