import { NextResponse, NextRequest } from "next/server";
import { randomUUID } from "crypto";

/**
 * GET  /api/cims/threads/list
 * POST /api/cims/threads/list
 *
 * Thread listing and creation handler.
 * Mirrors logic of /api/cims/threads but kept as explicit /list alias for
 * backward compatibility and external integrations.
 */

type Thread = {
  id: string;
  subject: string;
  createdAt: string;
};

let THREADS: Thread[] = [
  { id: "demo-001", subject: "Demo Thread – System Check", createdAt: new Date().toISOString() },
];

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */
function uid(prefix = "t") {
  try {
    return randomUUID();
  } catch {
    return `${prefix}_${Date.now().toString(36)}`;
  }
}

/* -----------------------------------------------------------
   Handlers
----------------------------------------------------------- */
export async function GET() {
  try {
    return NextResponse.json({ ok: true, threads: THREADS });
  } catch (err) {
    console.error("GET /api/cims/threads/list failed:", err);
    return NextResponse.json({ ok: false, error: "Unable to load threads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const subject = (body?.subject ?? "Untitled Thread").toString().trim();

    const thread: Thread = {
      id: uid(),
      subject: subject || "Untitled Thread",
      createdAt: new Date().toISOString(),
    };

    THREADS = [thread, ...THREADS];

    // auto seed a welcome message if possible
    try {
      const mod = await import("@/app/lib/cims/messages");
      if ((mod as any)?.store?.add) {
        await (mod as any).store.add(thread.id, `Welcome to thread: ${subject}`, "system");
      }
    } catch {
      /* ignore if messages store missing */
    }

    return NextResponse.json({ ok: true, thread });
  } catch (err) {
    console.error("POST /api/cims/threads/list failed:", err);
    return NextResponse.json({ ok: false, error: "Unable to create thread" }, { status: 500 });
  }
}
