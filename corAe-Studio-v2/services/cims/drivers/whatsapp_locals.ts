// services/cims/drivers/whatsapp_local.ts
// Local stub driver: writes a whatsapp message to .data/outbox/whatsapp-*.json

import fs from "node:fs/promises";
import path from "node:path";

export type SendWhatsInput = {
  id: string;
  to: string;
  body: string;
};

export async function sendWhats(input: SendWhatsInput): Promise<{ ok: true; file: string }> {
  const dir = path.join(process.cwd(), ".data", "outbox");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `whatsapp-${Date.now()}-${input.id}.json`);
  await fs.writeFile(file, JSON.stringify(input, null, 2), "utf8");
  return { ok: true, file };
}