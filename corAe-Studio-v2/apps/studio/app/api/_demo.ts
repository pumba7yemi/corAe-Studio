import { NextRequest } from "next/server";
import { DemoFlags } from "../../src/config/demo";

export function withDemoGuard(
  fn: (req: NextRequest) => Promise<Response> | Response
) {
  return async (req: NextRequest) => {
    if (!(DemoFlags.DEMO_MODE && DemoFlags.DEMO_SANDBOX)) {
      return new Response(JSON.stringify({ error: "Demo only" }), { status: 403 });
    }
    return fn(req);
  };
}
