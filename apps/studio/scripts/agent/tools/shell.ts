import { exec as _exec } from "child_process";
import { promisify } from "util";
const exec = promisify(_exec);

export async function sh(cmd: string, cwd = process.cwd()) {
  const { stdout, stderr } = await exec(cmd, { cwd });
  return stdout || stderr;
}
