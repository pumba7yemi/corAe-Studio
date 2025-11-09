import { exec as _exec, spawn } from "child_process";
import { promisify } from "util";

const exec = promisify(_exec);

function runGit(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const ps = spawn("git", ["-c", "core.quotepath=false", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    let out = "";
    let err = "";

    ps.stdout.on("data", (d) => (out += d.toString()));
    ps.stderr.on("data", (d) => (err += d.toString()));
    ps.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || `git ${args.join(" ")} exited ${code}`));
    });
  });
}

/** Show working tree diff (no color so we can parse/log). */
export async function diff(): Promise<string> {
  return runGit(["diff", "--no-color"]);
}

/** Apply a unified diff by piping it to `git apply -`. */
export async function applyPatch(patch: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ps = spawn("git", ["apply", "-p0", "--reject", "--whitespace=fix", "-"], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
    });

    let out = "";
    let err = "";

    ps.stdout.on("data", (d) => (out += d.toString()));
    ps.stderr.on("data", (d) => (err += d.toString()));

    ps.on("error", reject);
    ps.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || `git apply failed with ${code}`));
    });

    // feed the patch on stdin
    ps.stdin.write(patch);
    ps.stdin.end();
  });
}

/** Stage everything and commit safely (no shell quoting issues). */
export async function commit(message: string): Promise<void> {
  await runGit(["add", "-A"]);
  try {
    await runGit(["commit", "-m", message]);
  } catch (e: any) {
    // Allow "nothing to commit" to pass silently
    if (!/nothing to commit/i.test(String(e?.message || ""))) throw e;
  }
}
