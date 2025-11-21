import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Minimal POST handler to mark this file as a module for Next's typegen.
// This should be replaced by the real accept logic; kept intentionally simple to unblock build.
export async function POST(_req: NextRequest, ctx: { params: Promise<any> }) {
	const { surveyid } = (await ctx.params) as any;
	// no-op placeholder: acknowledge receipt
	return NextResponse.json({ ok: true, surveyId: surveyid });
}

export async function OPTIONS() {
	return NextResponse.json({ ok: true, methods: ["POST"] });
}

