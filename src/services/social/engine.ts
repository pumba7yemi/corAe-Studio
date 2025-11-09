import { getProvider } from "./providers";
import type { PostSpec, ProviderResult } from "./types";

type Listener = (evt: { type: "posted" | "scheduled"; spec: PostSpec; result: ProviderResult }) => void;

class SocialEngine {
  private listeners: Listener[] = [];

  register(listener: Listener) { this.listeners.push(listener); }
  private emit(type: "posted" | "scheduled", spec: PostSpec, result: ProviderResult) {
    for (const l of this.listeners) l({ type, spec, result });
  }

  async postNow(spec: PostSpec) {
    const prov = getProvider(spec.platform);
    const res = await prov.postNow(spec);
    this.emit("posted", spec, res);
    return res;
    }

  async schedule(spec: PostSpec) {
    // simple: if scheduledAt in future & provider has schedule, use it, else fallback to postNow
    const when = spec.scheduledAt ? new Date(spec.scheduledAt).getTime() : Date.now();
    const isFuture = when > Date.now() + 30_000;
    const prov = getProvider(spec.platform);
    const res = isFuture && prov.schedule ? await prov.schedule(spec) : await prov.postNow(spec);
    this.emit("scheduled", spec, res);
    return res;
  }

  start() {
    // hook into your Workflows marketing loop here if needed
    // e.g., workflows.on("marketing.post", (spec)=> this.postNow(spec))
  }
}

export const socialEngine = new SocialEngine();