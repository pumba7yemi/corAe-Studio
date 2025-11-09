// @ts-nocheck
import { PrismaClient, BarcodeSymbology } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Generates the next SKU from a scheme, creates ItemVariant atomically,
 * and returns the created variant (optionally with a primary barcode).
 *
 * - schemeKey: SkuScheme.name (or pass schemeId via options)
 * - itemId: parent Item.id
 * - attributes: e.g. { SIZE: "M", COLOR: "RED" }
 * - options.scopeKey: sequence scope (e.g., category code) to keep counters separate
 * - options.altCode: optional extra code
 * - options.primaryBarcode: if provided, creates ItemBarcode (symbology+code)
 */
export async function createVariantWithSku(args: {
  schemeKey: string;
  itemId: string;
  attributes: Record<string, string>;
  options?: {
    schemeId?: string;
    scopeKey?: string | null;
    altCode?: string | null;
    primaryBarcode?: { symbology?: BarcodeSymbology; code: string };
  };
}) {
  const { schemeKey, itemId, attributes, options } = args;

  return await prisma.$transaction(async (tx) => {
    // 1) Resolve scheme
    const scheme =
      options?.schemeId
        ? await tx.skuScheme.findUnique({
            where: { id: options.schemeId },
            include: { components: { orderBy: { position: "asc" } } },
          })
        : await tx.skuScheme.findUnique({
            where: { name: schemeKey },
            include: { components: { orderBy: { position: "asc" } } },
          });

    if (!scheme || !scheme.isActive) {
      throw new Error(`SkuScheme not found or inactive: ${schemeKey}`);
    }

    // 2) Pull item & optional category code for {CAT} and default scopeKey
    const item = await tx.item.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    if (!item) throw new Error(`Item not found: ${itemId}`);

    const categoryCode =
      item.category?.name?.toUpperCase().replace(/\s+/g, "").slice(0, 6) ?? "GEN";

    const scopeKey = options?.scopeKey ?? categoryCode;

    // 3) Get or init sequence row for this (schemeId, scopeKey), then atomically increment
    const seq = await getOrInitSequence(tx, scheme.id, scopeKey);
    const nextSeqVal = await bumpSequence(tx, seq.id);

    // 4) Render SKU from pattern
    const sku = renderSku({
      pattern: scheme.pattern,
      components: scheme.components,
      fixedPrefix: scheme.prefix ?? "",
      separator: scheme.separator ?? "-",
      attributes,
      categoryCode,
      seqValue: nextSeqVal,
    });

    // 5) Create variant (ensure uniqueness; retry minimally on rare collisions)
    let variant;
    try {
      variant = await tx.itemVariant.create({
        data: {
          itemId,
          attributes,
          sku,
          altCode: options?.altCode ?? null,
          schemeId: scheme.id,
        },
      });
    } catch (e: any) {
      // handle unique collision by advancing sequence once and retrying
      const nextSeqVal2 = await bumpSequence(tx, seq.id);
      const sku2 = renderSku({
        pattern: scheme.pattern,
        components: scheme.components,
        fixedPrefix: scheme.prefix ?? "",
        separator: scheme.separator ?? "-",
        attributes,
        categoryCode,
        seqValue: nextSeqVal2,
      });

      variant = await tx.itemVariant.create({
        data: {
          itemId,
          attributes,
          sku: sku2,
          altCode: options?.altCode ?? null,
          schemeId: scheme.id,
        },
      });
    }

    // 6) Optional primary barcode
    if (options?.primaryBarcode?.code) {
      await tx.itemBarcode.create({
        data: {
          variantId: variant.id,
          symbology: options.primaryBarcode.symbology ?? "EAN13",
          code: options.primaryBarcode.code,
          isPrimary: true,
        },
      });
    }

    return variant;
  });
}

/* ------------------------ helpers ------------------------ */

async function getOrInitSequence(
  tx: PrismaClient,
  schemeId: string,
  scopeKey: string | null
) {
  // try find first
  const existing = await (tx as any).skuSequence.findUnique({
    where: { schemeId_scopeKey: { schemeId, scopeKey } },
  }).catch(() => null);

  if (existing) return existing;

  // if composite unique not set in Prisma, fallback to findFirst+create
  const found = await tx.skuSequence.findFirst({
    where: { schemeId, scopeKey },
  });
  if (found) return found;

  return await tx.skuSequence.create({
    data: { schemeId, scopeKey, nextValue: 1 },
  });
}

async function bumpSequence(tx: PrismaClient, seqId: string) {
  const updated = await tx.skuSequence.update({
    where: { id: seqId },
    data: { nextValue: { increment: 1 } },
  });
  // return the value just assigned (increment happened post-read)
  return updated.nextValue - 1;
}

function renderSku(args: {
  pattern: string; // e.g. "{PREFIX}-{CAT}-{ATTR:SIZE}-{ATTR:COLOR}-{SEQ:4}"
  components: Array<{ key: string; type: string; value: string | null }>;
  fixedPrefix: string;
  separator: string;
  attributes: Record<string, string>;
  categoryCode: string;
  seqValue: number;
}) {
  const { pattern, components, fixedPrefix, separator, attributes, categoryCode, seqValue } = args;

  // quick access for CONST entries
  const constMap: Record<string, string> = {};
  for (const c of components) {
    if (c.type === "CONST" && c.value) constMap[c.key] = sanitize(c.value);
  }

  // token replacer
  const out = pattern.replace(/\{([^}]+)\}/g, (m, token) => {
    // token forms: PREFIX | CAT | CONST:KEY | ATTR:NAME | SEQ | SEQ:n | DATE:YYYYMM
    const [head, arg] = String(token).split(":");

    switch (head) {
      case "PREFIX":
        return sanitize(fixedPrefix || constMap["PREFIX"] || "");
      case "CAT":
        return sanitize(categoryCode);
      case "CONST":
        return sanitize(constMap[arg] ?? "");
      case "ATTR": {
        const val = attributes[arg] ?? "";
        return sanitize(val);
      }
      case "SEQ": {
        const width = arg ? parseInt(arg, 10) : 1;
        return pad(seqValue, width);
      }
      case "DATE": {
        // supports YYYY, YYYYMM, YYYYMMDD
        return formatDatePart(arg);
      }
      default:
        // allow custom keys to map via CONST or ATTR
        if (constMap[head]) return sanitize(constMap[head]);
        if (attributes[head]) return sanitize(attributes[head]);
        return "";
    }
  });

  // cleanup multiple separators / stray dashes
  return out
    .split(separator)
    .filter(Boolean)
    .join(separator)
    .toUpperCase();
}

function pad(num: number, width: number) {
  const s = String(num);
  if (s.length >= width) return s;
  return "0".repeat(width - s.length) + s;
}

function sanitize(s: string) {
  return String(s).trim().replace(/[^A-Za-z0-9]+/g, "");
}

function formatDatePart(fmt?: string) {
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = pad(d.getMonth() + 1, 2);
  const dd = pad(d.getDate(), 2);
  if (!fmt || fmt === "YYYY") return yyyy;
  if (fmt === "YYYYMM") return `${yyyy}${mm}`;
  if (fmt === "YYYYMMDD") return `${yyyy}${mm}${dd}`;
  return yyyy; // fallback
}