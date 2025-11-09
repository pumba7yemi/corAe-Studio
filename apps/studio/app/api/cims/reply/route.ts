import { NextRequest, NextResponse } from "next/server";

/**
 * corAe CIMS → AI Reply API (reconciled)
 * - Generates a mock reply
 * - Persists to /api/cims/messages (author: "system")
 * - Also writes to /api/memory as kind: "message"
 * - All persistence is best-effort, never crashes UI
 */

type ReplyRequest = {
  threadId: string;
  message: string;
  author?: string;
  tenant?: string;
};

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as ReplyRequest;
    const tenant = (data.tenant ?? "demo").toString();
    const { threadId, message } = data;

    if (!threadId || !message?.trim()) {
      return NextResponse.json(
        { ok: false, error: "threadId and message required" },
        { status: 400 }
      );
    }

    // Simulate “thinking” delay
    await new Promise((r) => setTimeout(r, 600));

    // Simple contextual mock
    const lower = message.toLowerCase();
    let reply = "I received your message.";

    if (lower.includes("hello") || lower.includes("hi")) {
      reply = "Hello there 👋 How can I help you today?";
    } else if (lower.includes("task") || lower.includes("work")) {
      reply = "Got it — I can log this as a task in your WorkFocus dashboard if you’d like.";
    } else if (lower.includes("memory") || lower.includes("remember")) {
      reply = "I'll store this in your corAe Memory so I can recall it next time we chat.";
    } else if (lower.includes("thanks") || lower.includes("thank you")) {
      reply = "You're very welcome. corAe is always learning.";
    }

    // Build the message we’ll return to the client regardless of persistence
    const aiMessage = {
      id: `ai_${Date.now().toString(36)}`,
      threadId,
      author: "system" as const,
      body: reply,
      createdAt: new Date().toISOString(),
    };

    // Best-effort persistence (do NOT fail the response if these error)
    const origin =
      req.nextUrl?.origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // 1) Persist to messages
    try {
      await fetch(`${origin}/api/cims/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          threadId,
          body: reply,
          author: "system",
          tenant,
        }),
      });
    } catch (e) {
      console.warn("Persist /api/cims/messages failed (non-fatal):", e);
    }

    // 2) Persist to memory (kind: message)
    try {
      await fetch(`${origin}/api/memory`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tenant,
          text: reply,
          kind: "message",
          threadId,
          tags: ["ai-reply"],
        }),
      });
    } catch (e) {
      console.warn("Persist /api/memory failed (non-fatal):", e);
    }

    // Return the AI message either way
    return NextResponse.json({ ok: true, message: aiMessage });
  } catch (err) {
    console.error("POST /api/cims/reply failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to generate reply" },
      { status: 200 }
    );
  }
}
