// services/cims/drivers/email_local.ts
// Local stub driver: writes an email to .data/outbox/email-*.json

import fs from "node:fs/promises";
import path from "node:path";

export type SendEmailInput = {
  id: string;
  to: string;
  subject: string;
  body: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ ok: true; file: string }> {
  const dir = path.join(process.cwd(), ".data", "outbox");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `email-${Date.now()}-${input.id}.json`);
  await fs.writeFile(file, JSON.stringify(input, null, 2), "utf8");
  return { ok: true, file };
}