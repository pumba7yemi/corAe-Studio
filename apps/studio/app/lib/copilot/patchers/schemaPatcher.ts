// apps/studio/app/lib/copilot/patchers/schemaPatcher.ts
import fs from "node:fs/promises";
import path from "node:path";

type Blueprint = Record<string, any>;

/**
 * Safe additive patcher for Prisma schema.
 * - Appends new model blocks if missing
 * - Adds missing field lines into existing models
 * - Never deletes/edits existing fields
 */
export async function applySchemaPatch(blueprint: Blueprint): Promise<string[]> {
  const schemaPath = path.join(process.cwd(), "apps", "studio", "prisma", "schema.prisma");
  const touched: string[] = [];
  const raw = await fs.readFile(schemaPath, "utf8");
  let schema = raw;

  const models = blueprint?.models && typeof blueprint.models === "object" ? blueprint.models : null;
  if (!models) return touched;

  for (const [modelName, def] of Object.entries<any>(models)) {
    const exists = hasModel(schema, modelName);
    if (!exists) {
      const block = def?.raw
        ? def.raw
        : buildModelBlock(modelName, def?.fields ?? "");
      schema += `\n\n${block}\n`;
      touched.push(schemaPath);
      continue;
    }

    // Incrementally add missing fields if 'fields' provided
    if (def?.fields && typeof def.fields === "string") {
      const currentBlock = getModelBlock(schema, modelName) ?? "";
      const currentFields = new Set(
        currentBlock
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => !!l && !l.startsWith("model ") && !l.startsWith("}"))
          .map((l) => l.split(/[ \t]/)[0]) // field name
      );

    const toAdd: string[] = (def.fields as string)
      .split("\n")
      .map((l: string) => l.replace(/\r/g, ""))
      .filter((l: string) => !!l.trim());

      if (toAdd.length > 0) {
        let newBlock = currentBlock;
        for (const line of toAdd) {
          const name = line.trim().split(/[ \t]/)[0];
          if (!currentFields.has(name)) {
            newBlock = newBlock.replace(/\}\s*$/, `  ${line}\n}\n`);
            currentFields.add(name);
          }
        }
        schema = replaceModelBlock(schema, modelName, newBlock);
        touched.push(schemaPath);
      }
    }
  }

  if (touched.length > 0) {
    await fs.writeFile(schemaPath, schema, "utf8");
  }
  return touched;
}

function hasModel(schema: string, name: string) {
  const re = new RegExp(`model\\s+${escapeReg(name)}\\s*\\{[\\s\\S]*?\\}`, "m");
  return re.test(schema);
}
function getModelBlock(schema: string, name: string) {
  const re = new RegExp(`model\\s+${escapeReg(name)}\\s*\\{[\\s\\S]*?\\}`, "m");
  return schema.match(re)?.[0] ?? null;
}
function replaceModelBlock(schema: string, name: string, newBlock: string) {
  const re = new RegExp(`model\\s+${escapeReg(name)}\\s*\\{[\\s\\S]*?\\}`, "m");
  return schema.replace(re, newBlock);
}
function buildModelBlock(name: string, fields: string) {
  const lines = fields
    .split("\n")
    .map((l) => l.replace(/\r/g, ""))
    .filter(Boolean)
    .map((l) => `  ${l}`)
    .join("\n");
  return `model ${name} {\n${lines}\n}`;
}
function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}