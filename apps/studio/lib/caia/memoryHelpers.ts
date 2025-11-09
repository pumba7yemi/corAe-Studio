import fs from "fs/promises";
import path from "path";

const BASE_DIR = path.resolve(process.cwd(), "runtime", "caia-memory");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonFile(file: string): Promise<any> {
  try {
    const txt = await fs.readFile(file, "utf8");
    return JSON.parse(txt || "{}");
  } catch (err: any) {
    if (err?.code === "ENOENT") return {};
    throw err;
  }
}

async function writeJsonFile(file: string, data: any) {
  await ensureDir(path.dirname(file));
  const tmp = `${file}.tmp-${Date.now()}`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function readDockyardMemory(scope: string, key?: string) {
  const file = path.join(BASE_DIR, "dockyard", `${scope}.json`);
  const data = await readJsonFile(file);
  if (typeof key === "string") return data?.[key];
  return data;
}

export async function appendDockyardMemory(scope: string, entry: Record<string, string>) {
  const file = path.join(BASE_DIR, "dockyard", `${scope}.json`);
  const current = (await readJsonFile(file)) || {};
  const merged = { ...current, ...entry };
  await writeJsonFile(file, merged);
  return merged;
}

export async function readShipMemory(scope: string) {
  const file = path.join(BASE_DIR, "ship", `${scope}.json`);
  return await readJsonFile(file);
}

export async function appendShipMemory(scope: string, data: any) {
  const file = path.join(BASE_DIR, "ship", `${scope}.json`);
  const current = (await readJsonFile(file)) || {};
  const merged = { ...current, ...data };
  await writeJsonFile(file, merged);
  return merged;
}

export async function writeDockyardMemory(scope: string, key: string, value: string) {
  return appendDockyardMemory(scope, { [key]: value });
}

export async function writeShipMemory(scope: string, data: any) {
  return appendShipMemory(scope, data);
}
