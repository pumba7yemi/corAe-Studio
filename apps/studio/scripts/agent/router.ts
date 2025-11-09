// apps/studio/scripts/agent/router.ts
import { exec as childExec } from "node:child_process";
import { promisify } from "node:util";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

const exec = promisify(childExec);

export const CAPABILITIES = {
  gitApply: "Apply unified diff to working tree",
  gitCommit: "Commit all staged & unstaged changes with a message",
} as const;

export type ToolName = keyof typeof CAPABILITIES;

export async function callTool(name: ToolName, input: string): Promise<string> {
  if (name === "gitApply") {
    const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-"));
    const file = path.join(tmpdir, "patch.diff");
    await fs.writeFile(file, input ?? "", "utf8");

    const { stdout, stderr } = await exec('git apply -p0 --whitespace=nowarn "' + file + '"');
    return (stdout || "") + (stderr || "");
  }

  if (name === "gitCommit") {
    const message = (input || "agent commit").trim();
    await exec("git add -A");
    const { stdout, stderr } = await exec(
      "git commit -m " + JSON.stringify(message) + ' || echo "nothing to commit"'
    );
    return (stdout || "") + (stderr || "");
  }

  throw new Error("Unknown tool: " + name);
}
