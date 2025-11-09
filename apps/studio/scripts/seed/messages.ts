// apps/studio/scripts/seed/messages.ts
/**
 * corAe OMS/Message Module Seeder
 * - Loads ALL JSON packs from apps/studio/seeds/message-packs
 * - Upserts MessagePack by `namespace` (falls back to name if missing)
 * - Replaces all templates for that pack (idempotent, safe to re-run)
 *
 * Usage:
 *   pnpm tsx apps/studio/scripts/seed/messages.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

type Audience = "vendor" | "client" | "staff" | "finance" | "ops";
type Channel = "cims" | "whatsapp" | "email" | "sms";
type Tone = "professional" | "friendly" | "urgent" | "neutral";

type MessageBlueprint = {
  module: string;
  stage: string;
  audience: Audience;
  channel: Channel;
  tone: Tone;
  subject?: string | null;
  body: string;
  requiresHumanApproval?: boolean;
  isActive?: boolean;
  tags?: string[];
  legacyCode?: string;
};

type MessagePackJson = {
  name: string;
  namespace?: string;
  description?: string;
  templates: MessageBlueprint[];
};

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "../../");
const PACKS_DIR = path.resolve(ROOT, "seeds/message-packs");

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    // allow JSON files that start with `// comment` lines
    const cleaned = raw
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    return JSON.parse(cleaned) as T;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${filePath}\n${(e as Error).message}`);
  }
}

async function seedPack(filePath: string) {
  const data = readJsonFile<MessagePackJson>(filePath);

  const name = data.name?.trim();
  if (!name) throw new Error(`Pack missing name: ${filePath}`);

  const namespace = (data.namespace || data.name).trim();
  const description = data.description?.trim() ?? null;
  const templates = Array.isArray(data.templates) ? data.templates : [];

  if (templates.length === 0) {
    console.warn(`⚠️  Pack has no templates, skipping: ${namespace}`);
    return;
  }

  // find existing pack by namespace (preferred) or by name
  const existing = await prisma.messagePack.findFirst({
    where: { OR: [{ namespace }, { name }] },
  });

  let packId: string;

  if (!existing) {
    const created = await prisma.messagePack.create({
      data: { name, namespace, description: description ?? undefined },
    });
    packId = created.id;
    console.log(`➕ Created pack: ${namespace} (${packId})`);
  } else {
    // update pack meta
    const updated = await prisma.messagePack.update({
      where: { id: existing.id },
      data: { name, namespace, description },
    });
    packId = updated.id;
    console.log(`♻️  Updating pack: ${namespace} (${packId})`);
  }

  // Replace templates for this pack (idempotent)
  await prisma.messageTemplate.deleteMany({ where: { packId } });

  // Prepare template rows
  const rows = templates.map((t) => ({
    packId,
    module: t.module,
    stage: t.stage,
    audience: t.audience,
    channel: t.channel,
    tone: t.tone,
    subject: t.subject ?? null,
    body: t.body,
    requiresHumanApproval: t.requiresHumanApproval ?? true,
    isActive: t.isActive ?? true,
    tags: t.tags ?? [],
    legacyCode: t.legacyCode ?? null,
  }));

  // Bulk create in chunks for safety (SQLite has variable limits)
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    await prisma.messageTemplate.createMany({ data: slice });
  }

  console.log(`✅ Seeded ${rows.length} templates for pack: ${namespace}`);
}

async function main() {
  if (!fs.existsSync(PACKS_DIR)) {
    throw new Error(`Packs directory not found: ${PACKS_DIR}`);
  }

  const files = fs
    .readdirSync(PACKS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .map((f) => path.join(PACKS_DIR, f));

  if (files.length === 0) {
    console.warn(`⚠️  No JSON packs found in: ${PACKS_DIR}`);
    return;
  }

  console.log(`🧩 Found ${files.length} pack(s):`);
  files.forEach((f) => console.log("   •", path.basename(f)));

  for (const file of files) {
    try {
      await seedPack(file);
    } catch (e) {
      console.error(`❌ Error seeding ${path.basename(file)}:\n`, e);
      // continue to next pack rather than hard fail
    }
  }
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
