import { NextResponse } from "next/server";

// Minimal POST handler stub so Next's typegen treats this as a module.
export async function POST() {
	return NextResponse.json({ ok: true });
}
