import { CAIAAdapter, AdapterResponse, ModelMessage } from "..";

function tinyReasoner(messages: ModelMessage[]): string {
  // super minimal: echo the last user message with a tag
  const last = [...messages].reverse().find(m => m.role === "user") as any;
  const content = last?.content ?? "No input.";
  return `LOCAL-ADAPTER: processed -> ${content}`;
}

export const LocalAdapter = {
  name: "local",
  async chat(messages: ModelMessage[]): Promise<AdapterResponse> {
    const output = tinyReasoner(messages);
    return { ok: true, output, tokens: { input: Array.isArray(messages) ? messages.length : 0, output: output.length } };
  }
} satisfies CAIAAdapter;
