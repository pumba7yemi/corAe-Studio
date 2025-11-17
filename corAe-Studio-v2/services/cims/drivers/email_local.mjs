// Local email driver — dev stub
import fs from "node:fs/promises";
import path from "node:path";

export async function sendEmail({ id, to, subject, body }) {
  const ts = new Date().toISOString();
  const outDir = path.join(process.cwd(), "build", ".data", "outbox", "email");
  await fs.mkdir(outDir, { recursive: true });
  const line = JSON.stringify({ ts, id, to, subject, body, provider: "local" }) + "\n";
  await fs.appendFile(path.join(outDir, `${ts.slice(0, 10)}.jsonl`), line, "utf8");

  return { ok: true, id: id ?? `mail-${Date.now()}`, to, subject, messageId: `local-${Date.now()}` };
}