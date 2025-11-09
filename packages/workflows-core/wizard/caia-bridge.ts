// packages/workfocus-core/wizard/caia-bridge.ts
// Schema-driven CAIA bridge for First-Trade
// - Consumes a lightweight inline zod schema (no external file)
// - Produces/Parses a CAIA text doc in sync with the schema
//
// Exports:
// - FirstTradeState (TS type)
// - FirstTradeStateSchema (zod schema)
// - stateToDocFromSchema(state)
// - docToStateFromSchema(doc, prev?)

import { z } from "zod";

/* ──────────────────────────────────────────────────────────────────────
 * Minimal inline schema (kept generic so it can sit atop a Prisma model)
 * Adjust fields anytime; the bridge maps by names, not positions.
 * ──────────────────────────────────────────────────────────────────── */

export interface FirstTradeState {
  id?: string;
  companyMode?: "BUY" | "SELL" | "sales" | "procurement";
  counterparty?: {
    id?: string;
    name?: string;
    siteId?: string;
    siteName?: string;
  };
  ourParty?: {
    id?: string;
    name?: string;
  };
  schedule?: {
    kind?: "scheduled" | "ad_hoc";
    rule?: string;
    day?: string;
    window?: string;
  };
  transport?: {
    mode?: "vendor" | "third_party" | "client";
    inQuote?: boolean;
  };
  geography?: {
    country?: string;
    region?: string;
    postcode?: string;
  };
  references?: {
    clientPO?: string;
    quoteId?: string;
  };
  notes?: string;
  lines?: Array<{
    sku?: string;
    title?: string;
    uom?: string;
    qty?: number;
    sector?: string;
    /** major-unit price for human editing (e.g., 1.23 means 1.23 GBP/USD/etc.) */
    unitPriceMajor?: number;
    /** minor units (optional; ignored on render but tolerated on parse) */
    unitPrice?: number;
  }>;
}

export const FirstTradeStateSchema = z.object({
  companyMode: z.enum(["BUY", "SELL", "sales", "procurement"]).optional(),
  counterparty: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      siteId: z.string().optional(),
      siteName: z.string().optional(),
    })
    .optional(),
  ourParty: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  schedule: z
    .object({
      kind: z.enum(["scheduled", "ad_hoc"]).optional(),
      rule: z.string().optional(),
      day: z.string().optional(),
      window: z.string().optional(),
    })
    .optional(),
  transport: z
    .object({
      mode: z.enum(["vendor", "third_party", "client"]).optional(),
      inQuote: z.boolean().optional(),
    })
    .optional(),
  geography: z
    .object({
      country: z.string().optional(),
      region: z.string().optional(),
      postcode: z.string().optional(),
    })
    .optional(),
  references: z
    .object({
      clientPO: z.string().optional(),
      quoteId: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        sku: z.string().optional(),
        title: z.string().optional(),
        uom: z.string().optional(),
        qty: z.number().optional(),
        sector: z.string().optional(),
        unitPriceMajor: z.number().optional(),
        unitPrice: z.number().optional(),
      })
    )
    .optional(),
});

/* ──────────────────────────────────────────────────────────────────────
 * Mapping table: CAIA key ↔ path in FirstTradeState
 * Use dot-paths for objects and special "line{n}_field" for arrays.
 * Extend any time without touching the editor page.
 * ──────────────────────────────────────────────────────────────────── */

const fieldMap = [
  // company / parties
  ["companyMode", "companyMode"],
  ["counterparty_name", "counterparty.name"],
  ["counterparty_id", "counterparty.id"],
  ["site_id", "counterparty.siteId"],
  ["site_name", "counterparty.siteName"],
  ["our_name", "ourParty.name"],
  ["our_id", "ourParty.id"],

  // schedule
  ["schedule_kind", "schedule.kind"],
  ["schedule_rule", "schedule.rule"],
  ["schedule_day", "schedule.day"],
  ["schedule_window", "schedule.window"],

  // transport
  ["transport_mode", "transport.mode"],
  ["transport_in_quote", "transport.inQuote"],

  // geography
  ["geo_country", "geography.country"],
  ["geo_region", "geography.region"],
  ["geo_postcode", "geography.postcode"],

  // refs / notes
  ["ref_client_po", "references.clientPO"],
  ["ref_quote_id", "references.quoteId"],
  ["notes", "notes"],
] as const;

/** Array mapping (lines): we render as `line{n}_{field}` */
const lineFields = [
  "sku",
  "title",
  "uom",
  "qty",
  "sector",
  // human-friendly edit field; not persisted as minor by this bridge
  "price_major",
] as const;

/* ──────────────────────────────────────────────────────────────────────
 * Utils
 * ──────────────────────────────────────────────────────────────────── */

type AnyObj = Record<string, any>;

function get(obj: AnyObj, path: string) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}
function set(obj: AnyObj, path: string, value: any) {
  const parts = path.split(".");
  const last = parts.pop()!;
  let cur = obj as AnyObj;
  for (const p of parts) {
    if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[last] = value;
}

const boolToStr = (v: any) => (v ? "true" : "false");
const strToBool = (v?: string) =>
  ["1", "true", "yes", "y", "on"].includes(String(v ?? "").trim().toLowerCase());

/* ──────────────────────────────────────────────────────────────────────
 * state → CAIA doc
 * ──────────────────────────────────────────────────────────────────── */

export function stateToDocFromSchema(state: FirstTradeState): string {
  // Validate & coerce via schema first (safety)
  const s = FirstTradeStateSchema.parse(state);

  const lines: string[] = [];
  lines.push("# corAe First-Trade (schema-driven)");

  // primitives via fieldMap
  for (const [key, path] of fieldMap) {
    const v = get(s as AnyObj, path);
    // skip undefined or null
    if (v === undefined || v === null) continue;
    // skip empty strings (only valid to compare when v is a string)
    if (typeof v === "string" && v === "") continue;
    if (typeof v === "boolean") {
      lines.push(`${key}: ${boolToStr(v)}`);
    } else {
      lines.push(`${key}: ${v}`);
    }
  }

  // lines[]
  const items = (s as AnyObj).lines ?? [];
  items.forEach((l: AnyObj, i: number) => {
    const idx = i + 1;
    const priceMajor =
      typeof l.unitPriceMajor === "number"
        ? l.unitPriceMajor
        : typeof l.unitPrice === "number"
        ? Number(l.unitPrice) / 100
        : 0;

    const row: Record<string, any> = {
      sku: l.sku ?? "",
      title: l.title ?? "",
      uom: l.uom ?? "EA",
      qty: l.qty ?? 1,
      sector: l.sector ?? "other",
      price_major: Number(priceMajor).toFixed(2),
    };

    for (const f of lineFields) {
      const val = row[f];
      if (val !== undefined && val !== "") {
        lines.push(`line${idx}_${f}: ${val}`);
      }
    }
  });

  return lines.join("\n");
}

/* ──────────────────────────────────────────────────────────────────────
 * CAIA doc → state
 * ──────────────────────────────────────────────────────────────────── */

export function docToStateFromSchema(
  doc: string,
  prev?: FirstTradeState
): { state?: FirstTradeState; error?: string } {
  try {
    // parse doc into key/value dictionary
    const kv = Object.fromEntries(
      doc
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
        .map((l) => {
          const i = l.indexOf(":");
          if (i < 0) return ["", ""];
          const k = l.slice(0, i).trim();
          const v = l.slice(i + 1).trim();
          return [k, v] as const;
        })
    ) as Record<string, string>;

    // start from prev or schema default
    const base: AnyObj = prev ? { ...prev } : ({} as AnyObj);

    // apply simple fields
    for (const [key, path] of fieldMap) {
      const raw = kv[key];
      if (raw === undefined) continue;

      // booleans
      if (path.endsWith("inQuote")) {
        set(base, path, strToBool(raw));
        continue;
      }
      // keep strings; enums validated by schema parse below
      set(base, path, raw);
    }

    // collect line blocks by index
    const lineBuckets = new Map<
      number,
      Partial<Record<(typeof lineFields)[number], string>>
    >();

    for (const k of Object.keys(kv)) {
      const m = /^line(\d+)_(\w+)$/.exec(k);
      if (!m) continue;
      const idx = Number(m[1]);
      const field = m[2] as (typeof lineFields)[number];
      if (!lineFields.includes(field)) continue;
      const bucket = lineBuckets.get(idx) ?? {};
      (bucket as AnyObj)[field] = kv[k];
      lineBuckets.set(idx, bucket);
    }

    // turn buckets into state.lines[]
    const lines: AnyObj[] = [];
    const sortedIdx = Array.from(lineBuckets.keys()).sort((a, b) => a - b);
    for (const idx of sortedIdx) {
      const b = lineBuckets.get(idx)!;
      // consider a row "present" if any key exists
      const present = Object.keys(b).length > 0;
      if (!present) continue;

      const qty = Number(b.qty ?? "1");
      const priceMajor = Number(b.price_major ?? "0");

      lines.push({
        sku: b.sku ?? `Product${String(idx).padStart(4, "0")}`,
        title: b.title ?? b.sku ?? "Product",
        uom: b.uom ?? "EA",
        qty: Number.isFinite(qty) ? qty : 1,
        sector: (b.sector as any) ?? "other",
        unitPriceMajor: Number.isFinite(priceMajor) ? priceMajor : 0,
      });
    }

    if (lines.length) {
      base.lines = lines;
    }

    // final validation/coercion
    const parsed = FirstTradeStateSchema.parse(base) as FirstTradeState;
    return { state: parsed };
  } catch (e: any) {
    return { error: e?.message || "Failed to parse/validate document" };
  }
}

export const VERSION = 1;