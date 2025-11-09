import { promises as fs } from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), ".");

export async function readFile(rel: string) {
  const abs = path.join(ROOT, rel);
  return fs.readFile(abs, "utf8");
}

export async function writeFile(rel: string, content: string) {
  const abs = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, "utf8");
  return abs;
}
