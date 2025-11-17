class NextResponse {
  static json(body: any, init?: any) {
    const headers = { "Content-Type": "application/json", ...(init?.headers || {}) };
    const responseInit = { ...init, headers };
    return new Response(JSON.stringify(body), responseInit);
  }
}
import { prisma } from "../../../../../../../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ ok: false, error: "Missing ?code query" }, { status: 400 });

  try {
    const item = await prisma.item.findFirst({
      where: { OR: [{ barcode: code }, { code }] },
      select: { id: true, code: true, name: true, price: true, taxRate: true, barcode: true, imageUrl: true },
    });
    if (!item) return NextResponse.json({ ok: false, error: "Product not found", product: null });
    return NextResponse.json({
      ok: true,
      product: {
        id: item.id, code: item.code, name: item.name,
        price: Number(item.price ?? 0), tax: Number(item.taxRate ?? 0),
        barcode: item.barcode, imageUrl: item.imageUrl ?? null,
      },
    });
  } catch (err:any) {
    console.error("[POS Product Lookup]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code ?? "").trim();
    const name = String(body.name ?? "").trim();
    const priceNum = Number(body.price ?? 0);
    const taxNum = body.taxRate !== undefined ? Number(body.taxRate) : undefined;
    const barcode = body.barcode ? String(body.barcode).trim() : undefined;
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : undefined;

    if (code.length < 3) return NextResponse.json({ ok:false, error:"Code must be at least 3 characters." }, { status:400 });
    if (name.length < 2) return NextResponse.json({ ok:false, error:"Name must be at least 2 characters." }, { status:400 });
    if (Number.isNaN(priceNum) || priceNum < 0) return NextResponse.json({ ok:false, error:"Price must be non-negative." }, { status:400 });
    if (taxNum !== undefined && (Number.isNaN(taxNum) || taxNum < 0 || taxNum > 100))
      return NextResponse.json({ ok:false, error:"Tax must be 0..100." }, { status:400 });

  const created = await prisma.$transaction(async (tx: any) => {
      const item = await tx.item.create({
        data: {
          code, name, price: new Decimal(priceNum),
          taxRate: taxNum !== undefined ? new Decimal(taxNum) : null,
          barcode: barcode || null, imageUrl: imageUrl || null,
        },
      });
      await tx.stockState.create({ data: { itemId: item.id, onHand: new Decimal(0) } });
      return item;
    });

    return NextResponse.json({
      ok: true,
      item: {
        id: created.id, code: created.code, name: created.name,
        price: Number(created.price), taxRate: created.taxRate ? Number(created.taxRate) : 0,
        barcode: created.barcode, imageUrl: created.imageUrl,
      },
    });
  } catch (err:any) {
    const msg = String(err?.message || "");
    if (msg.includes("Unique") && msg.includes("barcode"))
      return NextResponse.json({ ok:false, error:"Item with this barcode exists." }, { status:409 });
    if (msg.includes("Unique") && msg.includes("code"))
      return NextResponse.json({ ok:false, error:"Item with this code exists." }, { status:409 });
    console.error("[POS Product Create]", err);
    return NextResponse.json({ ok:false, error: err.message ?? "Unknown error" }, { status:500 });
  }
}
