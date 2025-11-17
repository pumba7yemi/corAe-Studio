import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 20)));
  const skip = (page - 1) * pageSize;

  const where = q ? {
    OR: [
      { code: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { barcode: { contains: q, mode: "insensitive" } },
    ],
  } : {};

  try {
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where, orderBy: [{ name: "asc" }], skip, take: pageSize,
        select: { id: true, code: true, name: true, price: true, taxRate: true, barcode: true, imageUrl: true, stock: { select: { onHand: true } } },
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      ok: true, page, pageSize, total,
  items: items.map((it: any) => ({
        id: it.id, code: it.code, name: it.name,
        price: Number(it.price ?? 0), tax: Number(it.taxRate ?? 0),
        barcode: it.barcode, imageUrl: it.imageUrl, onHand: Number(it.stock?.onHand ?? 0),
      })),
    });
  } catch (err:any) {
    console.error("[POS Products Search]", err);
    return NextResponse.json({ ok:false, error: err.message }, { status:500 });
  }
}
