import type { Provider, PostSpec, ProviderResult } from "../types";

async function postNow(spec: PostSpec): Promise<ProviderResult> {
  console.log("[DEBUG-PROVIDER] posting", JSON.stringify(spec, null, 2));
  return { ok: true, externalId: `dbg_${Date.now()}`, url: "https://example.com/debug/post" };
}

export const debugProvider: Provider = {
  name: "debug",
  postNow,
};