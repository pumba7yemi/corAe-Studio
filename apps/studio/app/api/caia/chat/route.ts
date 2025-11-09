import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Messages array of { role, content }
  const messages = (await req.json()) as Array<{ role: string; content: string }>;

  // TODO: wire to your LLM/provider here (OpenAI, etc.)
  // For now, simple echo with Work Focus reinforcement:
  const last = messages[messages.length - 1]?.content || "";
  const reply =
`✅ Noted.
Have you completed this? If not — do it now.
If yes — we move to the next Work Focus.

> ${last}`;

  return NextResponse.json({ reply });
}
