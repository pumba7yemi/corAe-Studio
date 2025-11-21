// Generic adapter interface + registry (provider-agnostic)

export type ModelMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "tool"; content: string; name: string };

export type AdapterResponse = {
  ok: boolean;
  output?: string;
  tokens?: { input?: number; output?: number };
  error?: string;
};

export interface CAIAAdapter {
  name: string;
  chat(messages: ModelMessage[], opts?: Record<string, any>): Promise<AdapterResponse>;
}

const registry = new Map<string, CAIAAdapter>();

export function registerAdapter(a: CAIAAdapter) {
  registry.set(a.name, a);
}

export function getAdapter(name?: string): CAIAAdapter {
  const key = name || process.env.CAIA_ADAPTER || "local";
  const a = registry.get(key);
  if (!a) throw new Error(`CAIA adapter '${key}' not registered`);
  return a;
}
