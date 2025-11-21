import { promises as fs } from "fs";
import path from "path";
import { WantItem, WantList } from "./schemas";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "iwant.json");
const SHARE_DIR = path.join(DATA_DIR, "wishshares");
const CLICKS = path.join(DATA_DIR, "clicks.log");

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(SHARE_DIR, { recursive: true });
  try { await fs.access(FILE); } catch { await fs.writeFile(FILE, "[]", "utf8"); }
}
export async function readAll(): Promise<WantItem[]> {
  await ensure();
  const j = JSON.parse(await fs.readFile(FILE, "utf8") || "[]");
  const parsed = WantList.safeParse(j);
  return parsed.success ? parsed.data : [];
}
export async function writeAll(items: WantItem[]) {
  await ensure();
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}
export async function upsert(item: Omit<WantItem,"id"|"createdAt"|"updatedAt"> & Partial<Pick<WantItem,"id">>) {
  const list = await readAll();
  const now = new Date().toISOString();
  let id = item.id as string | undefined;
  if (!id) id = `srv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
  const found = list.findIndex(i => i.id === id);
  const record: WantItem = {
    id,
    title: item.title,
    category: item.category,
    estimate: item.estimate,
    priority: item.priority ?? "MEDIUM",
    targetDate: item.targetDate,
    link: item.link,
    notes: item.notes,
    tags: item.tags ?? [],
    status: item.status ?? "WISHLIST",
    createdAt: found >= 0 ? list[found].createdAt : now,
    updatedAt: now,
  };
  if (found >= 0) list[found] = record; else list.unshift(record);
  await writeAll(list);
  return record;
}
export async function createShare(slug: string, itemIds: string[], title="My Wishlist") {
  await ensure();
  const list = await readAll();
  const items = list.filter(i => itemIds.includes(i.id));
  const payload = { slug, title, createdAt: new Date().toISOString(), items };
  await fs.writeFile(path.join(SHARE_DIR, `${slug}.json`), JSON.stringify(payload, null, 2), "utf8");
  return payload;
}
export async function readShare(slug: string) {
  await ensure();
  const p = path.join(SHARE_DIR, `${slug}.json`);
  const txt = await fs.readFile(p, "utf8");
  return JSON.parse(txt);
}
export async function logClick(line: string) {
  await ensure();
  await fs.appendFile(CLICKS, line + "\n", "utf8");
}
