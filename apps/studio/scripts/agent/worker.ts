import { config } from "dotenv";
config({ path: ".env", override: true });

import { llm } from "./tools/openai";
import { CAPABILITIES, callTool } from "./router";
import { SYSTEM_PROMPT, TASK_FRAME } from "./prompts";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const MODEL = process.env.CORAE_AGENT_MODEL || "gpt-4.1-mini";
const DEBUG = !!process.env.CORAE_AGENT_DEBUG;

// More permissive: allow ```diff, ```patch, or bare triple backticks inside <PATCHES>
const PATCH_BLOCK_RE =
  /<PATCHES>[\s\S]*?```(?:diff|patch)?([\s\S]*?)```[\s\S]*?<\/PATCHES>/i;

function logDebug(...args: any[]) {
  if (DEBUG) console.log("[agent:debug]", ...args);
}

async function runTask(task: string, hints: string) {
  const openai = llm();

  // NOTE: must be a mutable array – no `as const`
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: TASK_FRAME(task, hints) },
  ];

  logDebug("model:", MODEL);
  logDebug("task:", task);
  logDebug("hints:", hints);

  const resp = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages,
  });

  const out = resp.choices[0]?.message?.content ?? "";
  console.log(out);

  const match = out.match(PATCH_BLOCK_RE);
  if (!match) {
    console.log("[agent] No <PATCHES> block found; manual review required.");
    return;
  }

  const patch = match[1].trim();
  if (!patch) {
    console.log("[agent] Empty patch block; manual review required.");
    return;
  }

  console.log("\n[agent] Applying patch...");
  try {
    const result = await callTool("gitApply", patch);
    if (result?.trim()) console.log(result.trim());
    await callTool("gitCommit", `agent: ${task}`);
    console.log("[agent] Committed.");
  } catch (e: any) {
    console.error("[agent] Patch apply/commit failed:", e?.message || e);
  }
}

async function main() {
  const mode = process.argv[2] || "run";

  if (mode === "run") {
    const runTaskText =
      process.argv.slice(3).join(" ") ||
      "Tidy CAIA page and wire MorningExec fetch.";
    const hints =
      "Next.js app in apps/studio; Prisma at apps/studio/prisma/schema.prisma.";
    await runTask(runTaskText, hints);
    return;
  }

  if (mode === "tools") {
    console.table(Object.keys(CAPABILITIES).map((tool) => ({ tool })));
    return;
  }

  const rl = readline.createInterface({ input, output });
  const interactiveTask =
    (await rl.question("Task: ")).trim() ||
    "Tidy CAIA page and wire MorningExec fetch.";
  rl.close();

  const hints =
    "Next.js app in apps/studio; Prisma at apps/studio/prisma/schema.prisma.";
  await runTask(interactiveTask, hints);
}

main().catch((e) => {
  console.error("[agent] fatal:", e?.message || e);
  if ((e?.message || "").includes("OPENAI_API_KEY")) {
    console.error(
      "Tip: add OPENAI_API_KEY to apps/studio/.env or repo root .env"
    );
  }
  process.exit(1);
});
