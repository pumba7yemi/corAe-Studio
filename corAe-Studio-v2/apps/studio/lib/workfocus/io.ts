import { promises as fs } from "fs";
import path from "path";
import type { WorkFocusBundle } from "./types";

const ROOT = path.join(process.cwd(), "data", "workfocus");

export async function saveBundle(bundle: WorkFocusBundle) {
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(path.join(ROOT, `${bundle.id}.json`), JSON.stringify(bundle, null, 2), "utf8");
  return bundle.id;
}
export async function loadBundle(id: string): Promise<WorkFocusBundle> {
  const raw = await fs.readFile(path.join(ROOT, `${id}.json`), "utf8");
  return JSON.parse(raw);
}
export async function listBundles(): Promise<string[]> {
  await fs.mkdir(ROOT, { recursive: true });
  const files = await fs.readdir(ROOT);
  return files.filter(f => f.endsWith(".json")).map(f => f.replace(/\.json$/, ""));
}
