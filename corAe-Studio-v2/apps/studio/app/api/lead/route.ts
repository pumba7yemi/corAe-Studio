import { NextResponse } from "next/server";

// Minimal stub to ensure this route is treated as a module by Next's typegen.
export async function GET() {
	return NextResponse.json({ ok: true, message: "lead route stub" });
}
