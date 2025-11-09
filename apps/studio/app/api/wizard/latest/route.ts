import { NextResponse } from "next/server";

// Minimal API returning the latest wizard snapshot for a given scope.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const scope = (url.searchParams.get("scope") || "home") as string;

    // TODO: wire to Prisma to fetch real wizard state. For now return placeholder.
    const payload = {
      scope,
      haveYou: [{ id: "hy-1", title: "Daily check-in", when: "09:00" }],
      pulse: { wins: ["All good"], risks: ["None"], next: ["Check inventory"] },
      plan: [{ id: "p-1", title: "Morning check-in", when: "09:00" }],
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
