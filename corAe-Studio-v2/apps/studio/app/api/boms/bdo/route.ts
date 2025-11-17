import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/biz";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { id, name = "New Deal", tenantId = "demo" } = await req.json();
    if (!id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }

    const bdo = await prisma.bDO.upsert({
      where: { id },
      create: { id, name, tenantId },
      update: {},
    });

    return NextResponse.json({ ok: true, bdo });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}
