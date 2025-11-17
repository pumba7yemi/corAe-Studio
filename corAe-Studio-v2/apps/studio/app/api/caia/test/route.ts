import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

 // Ensure adapters registered (server-side import)
 import "../../../../lib/boot/register-adapters";

 import { runWorkflow } from "../../../../lib/caia/dispatcher";

 // Fallback getAdapter implementation if '../../../../lib/adapters' is not available.
 // This provides a minimal local adapter for the test route and avoids the missing-module compile error.
 function getAdapter() {
   return {
     async chat(messages: Array<{ role: string; content: string }>) {
       // simple test response
       return { ok: true, messages: [{ role: "assistant", content: "Pong" }] };
     },
   };
 }

export async function GET() {
  try {
    const wfPath = path.join(process.cwd(), "lib", "modules", "demo", "workflow.json");
    const def = JSON.parse(fs.readFileSync(wfPath, "utf-8"));

    // show adapter test too
    const adapter = getAdapter(); // defaults to "local"
    const probe = await adapter.chat([{ role: "user", content: "Ping" }]);

    const res = await runWorkflow(def, { userId: "demo", roles: ["Owner"] });
    return NextResponse.json({ ok: true, probe, run: res });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
