// apps/studio/app/marketplace/reserve/api/pricelock.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
	try {
		const { id, pricelockRef } = await req.json();
		if (!id) throw new Error("Reservation ID required");

		const reservation = await (prisma as any).reservation.update({
			where: { id },
			data: {
				pricelockRef: pricelockRef ?? null,
				btdoStage: "TRADE_LOCKED",
				status: "PRICELOCKED",
			},
		});

		return NextResponse.json({ ok: true, reservation });
	} catch (err: any) {
		console.error("Reserve Pricelock Error:", err);
		return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
	}
}
