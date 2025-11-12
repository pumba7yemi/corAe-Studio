import { withDemoGuard } from "../../_demo";

// Local reset implementation to avoid relying on the '@/lib/demo/memory' path alias.
// Replace the body with the real reset logic as needed.
function reset() {
  // Example: clear in-memory demo state or perform whatever reset is required.
  // This is a no-op placeholder to avoid the "Cannot find module" error.
}

export const runtime = "nodejs";
export const POST = withDemoGuard(async () => { reset(); return Response.json({ ok: true, demo: true }); });
