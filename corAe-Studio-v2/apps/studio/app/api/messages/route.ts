import { NextResponse } from "next/server";

// Minimal GET handler stub so Next's type generation treats this as a module.
export async function GET() {
	return NextResponse.json({ ok: true, items: [] });
}
