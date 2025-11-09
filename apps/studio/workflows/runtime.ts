// Local type to satisfy TypeScript when the external module isn't present at build time.
interface StartResult {
  ok: boolean;
  reason?: string;
  [key: string]: any;
}

export async function execute(flowName: string, input?: unknown) {
  try {
    // Use a non-literal specifier so the compiler doesn't attempt to resolve the external module at build time.
    const mod = await import("@corae/workflows-core" + "/server");
    if (typeof mod?.startWorkflow === "function") return mod.startWorkflow(flowName, input ?? {});
    return { ok: false, reason: "no-startWorkflow" } as any;
  } catch (e) {
    // If the external module isn't available at build time, fail gracefully.
    return { ok: false, reason: String(e) } as any;
  }
}
