import fs from "node:fs/promises";
import path from "node:path";

const UPDATES = path.join(
  process.cwd(),
  "corAe-Studio-v2",
  "GOVERNANCE",
  "subject1",
  "UPDATES.md"
);

export async function appendSubject1Update(text: string) {
  const stamp = new Date().toISOString();
  const block = `\n## ${stamp}\n${text.trim()}\n\n---\n`;
  await fs.appendFile(UPDATES, block, "utf8");
}
