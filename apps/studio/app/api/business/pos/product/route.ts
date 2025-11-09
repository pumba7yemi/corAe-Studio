// app/api/business/pos/product/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * GET /api/business/pos/product?code=BARCODE_OR_CODE
 * Lookup by barcode or Item.code for POS Till.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing ?code query" },
      { status: 400 }
    );
  }

  try {
    const item = await (prisma as any).item.findFirst({
      where: { OR: [{ barcode: code }, { code }] },
      select: {
        id: true,
        code: true,
        name: true,
        price: true,
        taxRate: true,
        barcode: true,
        imageUrl: true,
      },
    });

    if (!item) {
      return NextResponse.json({
        ok: false,
        error: "Product not found",
        product: null,
      });
    }

    return NextResponse.json({
      ok: true,
      product: {
        id: item.id,
        code: item.code,
        name: item.name,
        price: Number(item.price ?? 0),
        tax: Number(item.taxRate ?? 0),
        barcode: item.barcode,
        imageUrl: item.imageUrl ?? null,
      },
    });
  } catch (err: any) {
    console.error("[POS Product Lookup]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/business/pos/product
 * Create a new Item (and ensure a StockState exists).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code: string = String(body.code ?? "").trim();
    const name: string = String(body.name ?? "").trim();
    const priceNum = Number(body.price ?? 0);
    const taxNum = body.taxRate !== undefined ? Number(body.taxRate) : undefined;
    const barcode: string | undefined = body.barcode ? String(body.barcode).trim() : undefined;
    const imageUrl: string | undefined = body.imageUrl ? String(body.imageUrl).trim() : undefined;

    // Basic validation
    if (code.length < 3) {
      return NextResponse.json({ ok: false, error: "Code must be at least 3 characters." }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ ok: false, error: "Price must be a non-negative number." }, { status: 400 });
    }
    if (taxNum !== undefined && (Number.isNaN(taxNum) || taxNum < 0 || taxNum > 100)) {
      return NextResponse.json({ ok: false, error: "Tax must be between 0 and 100." }, { status: 400 });
    }

    // Create item + bootstrap stock state (transactional)
    const created = await prisma.$transaction(async (tx: any) => {
      const item = await tx.item.create({
        data: {
          code,
          name,
          price: new Decimal(priceNum),
          taxRate: taxNum !== undefined ? new Decimal(taxNum) : null,
          barcode: barcode || null,
          imageUrl: imageUrl || null,
        },
      });

      // Ensure StockState exists for this item (onHand starts at 0)
      await tx.stockState.create({
        data: { itemId: item.id, onHand: new Decimal(0) },
      });

      return item;
    });

    return NextResponse.json({
      ok: true,
      item: {
        id: created.id,
        code: created.code,
        name: created.name,
        price: Number(created.price),
        taxRate: created.taxRate ? Number(created.taxRate) : 0,
        barcode: created.barcode,
        imageUrl: created.imageUrl,
      },
    });
  } catch (err: any) {
    // Unique constraint handling (code or barcode)
    const msg = String(err?.message || "");
    if (msg.includes("Unique constraint") || msg.includes("Unique constraint failed")) {
      return NextResponse.json(
        { ok: false, error: "Item with this code or barcode already exists." },
        { status: 409 }
      );
    }
    console.error("[POS Product Create]", err);
    return NextResponse.json({ ok: false, error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
