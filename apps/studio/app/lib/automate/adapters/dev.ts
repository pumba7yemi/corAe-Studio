// app/lib/automate/adapters/dev.ts
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Adapters } from "../types";

const ROOT = path.join(process.cwd(), "build", ".data");
const CIMS_DIR = path.join(ROOT, "cims");
const CIMS_INBOX = path.join(CIMS_DIR, "inbox.json");
const SHEETS_DIR = path.join(ROOT, "sheets");

async function ensure() {
  await fs.mkdir(CIMS_DIR, { recursive: true });
  await fs.mkdir(SHEETS_DIR, { recursive: true });
  try {
    await fs.access(CIMS_INBOX);
  } catch {
    await fs.writeFile(CIMS_INBOX, "[]", "utf8");
  }
}

async function pushInbox(entry: any) {
  await ensure();
  const raw = await fs.readFile(CIMS_INBOX, "utf8").catch(() => "[]");
  const list = JSON.parse(raw) as any[];
  list.unshift(entry);
  await fs.writeFile(
    CIMS_INBOX,
    JSON.stringify(list.slice(0, 200), null, 2),
    "utf8"
  );
}

export function makeDevAdapters(): Adapters {
  return {
    messaging: {
      async send(payload: { channel: string; text: string }) {
        await pushInbox({
          id: randomUUID(),
          at: new Date().toISOString(),
          ...payload,
        });
        return { ok: true };
      },
    },

    sheets: {
      async appendRow(payload: { sheet: string; row: Record<string, any> }) {
        await ensure();
        const f = path.join(SHEETS_DIR, `${payload.sheet}.csv`);

        // If file is empty or missing, write header first
        let exists = "";
        try {
          exists = await fs.readFile(f, "utf8");
        } catch {
          // ignore
        }
        const rowKeys = Object.keys(payload.row);
        if (!exists) {
          await fs.writeFile(f, rowKeys.join(",") + "\n", "utf8");
        }

        // Serialize row values as JSON to preserve commas/quotes safely
        const line = rowKeys.map((k) => JSON.stringify(payload.row[k])).join(",");
        await fs.appendFile(f, line + "\n", "utf8");
        return { ok: true };
      },
    },

    commerce: {
      async adjustPrice(params: any) {
        // Dev stub: just log
        // eslint-disable-next-line no-console
        console.log("[dev.adapters] adjustPrice", params);
        return { ok: true };
      },
    },

    partners: {
      async requestConfirmation(params: any) {
        // eslint-disable-next-line no-console
        console.log("[dev.adapters] partner.confirm", params);
        return { ok: true };
      },
      async createOrder(params: any) {
        // eslint-disable-next-line no-console
        console.log("[dev.adapters] partner.order", params);
        return { ok: true };
      },
      async advanceProcess(params: any) {
        // eslint-disable-next-line no-console
        console.log("[dev.adapters] process.advance", params);
        return { ok: true };
      },
      async requestVisit(params: any) {
        // eslint-disable-next-line no-console
        console.log("[dev.adapters] process.visit", params);
        return { ok: true };
      },
    },
  };
}