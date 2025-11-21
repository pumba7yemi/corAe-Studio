import fs from "node:fs";
import path from "node:path";

const V2_ROOT = process.cwd();
const H_PATH = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "core", "history.json");

export function handleHistory(limit = 100) {
  try {
    const raw = fs.readFileSync(H_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed.entries) ? parsed.entries.slice(-limit).reverse() : [];
    return { entries };
  } catch {
    return { entries: [] };
  }
}
