// Local WhatsApp driver — dev stub
import fs from "node:fs/promises";
import path from "node:path";

export async function sendWhats({ id, to, body }) {
  const ts = new Date().toISOString();
  const outDir = path.join(process.cwd(), "build", ".data", "outbox", "whatsapp");
  await fs.mkdir(outDir, { recursive: true });
  const line = JSON.stringify({ ts, id, to, body, provider: "local" }) + "\n";
  await fs.appendFile(path.join(outDir, `${ts.slice(0, 10)}.jsonl`), line, "utf8");

  return { ok: true, id: id ?? `wa-${Date.now()}`, to };
}