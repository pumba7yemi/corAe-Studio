import { CAIAAdapter, AdapterResponse, ModelMessage } from "..";

export const OpenAIAdapter = {
  name: "openai",
  async chat(messages: ModelMessage[], opts?: Record<string, any>): Promise<AdapterResponse> {
    // Stub: swap with real OpenAI call later
    const model = opts?.model || "gpt-4o-mini";
    const lastUser = [...messages].reverse().find(m => m.role === "user") as any;
    const content = lastUser?.content ?? "No input.";
    return {
      ok: true,
      output: `[SIM-OPENAI:${model}] ${content}`,
      tokens: { input: 0, output: content.length }
    };
  }
} satisfies CAIAAdapter;
