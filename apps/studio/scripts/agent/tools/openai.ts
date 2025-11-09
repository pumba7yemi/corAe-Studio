// apps/studio/scripts/agent/tools/openai.ts
import OpenAI from "openai";
import path from "node:path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env") });

export function llm() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing in .env");
  return new OpenAI({ apiKey: key });
}
