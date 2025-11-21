// apps/business/oms/obari/order/index.ts
// OBARI â€” Stage: ORDER (the â€œOâ€ in OBARI)
// Purpose:
//  - Register a lawful Order from a confirmed BDO outcome (post Prep + Schedule).
//  - Classify direction (inbound=PO, outbound=SO) and manage order numbers.
//  - Request/attach PO/SO numbers and mark the Order â€œready_for_bookingâ€.
//  - Persist an auditable event trail to hand off to Booking.
//
// Notes:
//  - Self-contained Stage API (no hard deps). Wire adapters from your app.
//  - Money stored in minor units (pence/cents). Dates are ISO strings.

export type Minor = number;
export type ISODate = string;

export type Direction = "inbound" | "outbound"; // inbound â‡’ Purchase (we buy); outbound â‡’ Sales (we sell)
export type TransportFlag = "CDIQ" | "CDC" | "CDN";

export type ScheduleKind =
  | { kind: "scheduled"; rule: "WEEKLY" | "FORTNIGHTLY" | "EVERY_3_WEEKS" | "EVERY_4_WEEKS" | "MONTHLY" | "QUARTERLY" | "BIANNUAL" | "ANNUAL"; day?: string; window?: string }
  | { kind: "ad_hoc" }
  | { kind: "rental"; rule: "MONTHLY" | "QUARTERLY" };

export interface Geo {
  country: string;
  region?: string;
  postcode?: string;
}

export interface OrderLine {
  sku: string;
  title: string;
  qty: number;
  uom?: string;
  unit_price: Minor; // snapshot from accepted quote/product
  sector_hint?: "pallets" | "recyclables" | "machinery" | "consumables" | "service" | "other";
}

export interface BdoOutcome {
  // Minimal payload passed from BDO stage after â€œPrep + Scheduleâ€
  bdo_id: string;
  direction: Direction;
  counterparty: { id: string; name: string; site_id?: string; site_name?: string };
  our_party: { id: string; name: string };
  schedule: ScheduleKind;
  transport: { in_quote: boolean; mode?: "vendor" | "third_party" | "client" | "n/a" };
  lines: OrderLine[];
  geography?: Geo;
  references?: { quote_id?: string; product_ids?: string[]; client_po?: string };
  notes?: string;
}

export type OrderStatus =
  | "created"            // persisted, awaiting numbers
  | "awaiting_numbers"   // request sent
  | "numbers_attached"   // PO/SO present (verified format)
  | "ready_for_booking"  // legal + commercial gates passed; can move to Booking
  | "invalid";           // failed validation

export interface OrderRecord {
  order_id: string;
  bdo_id: string;
  direction: Direction;
  counterparty: BdoOutcome["counterparty"];
  our_party: BdoOutcome["our_party"];
  schedule: ScheduleKind;
  transport: BdoOutcome["transport"];
  geography?: Geo;
  lines: OrderLine[];
  references: {
    quote_id?: string;
    product_ids?: string[];
    client_po?: string;   // inbound: we request PO from our side? (for vendors we hold SO) â€” retained for trace
    po_number?: string;   // inbound (we issue PO to vendor or receive PO from client if agreed model)
    so_number?: string;   // outbound (client SO to us) or our SO to client (depending on org convention)
    external?: Record<string, string>; // ERP/Sage refs etc.
  };
  totals: { sell: Minor };         // quick snapshot (ex VAT)
  transport_flag: TransportFlag;   // CDIQ/CDC/CDN
  created_at: ISODate;
  updated_at: ISODate;
  status: OrderStatus;
  audit: Array<AuditEvent>;
}

export interface AuditEvent {
  id: string;
  at: ISODate;
  kind:
    | "create"
    | "numbers_requested"
    | "numbers_attached"
    | "ready_flagged"
    | "contact_failure"
    | "mail_sent"
    | "validation_error";
  note?: string;
  meta?: Record<string, unknown>;
}

/* ------------------------------ Adapters ------------------------------ */

export interface OrderStageDeps {
  id: (prefix: string) => string; // e.g., ULID/UUID
  nowISO: () => ISODate;

  // Persistence
  saveOrder: (order: OrderRecord) => Promise<void>;
  patchOrder: (order_id: string, patch: Partial<OrderRecord>) => Promise<OrderRecord>;
  appendAudit: (order_id: string, ev: AuditEvent) => Promise<void>;

  // Formatting / validation for order numbers (org-specific)
  validatePONumber?: (value: string) => boolean;
  validateSONumber?: (value: string) => boolean;

  // Contacts + mail
  resolveContacts: (args: {
    direction: Direction;
    counterpartyId: string;
    siteId?: string;
  }) => Promise<{ to: string[]; cc?: string[] }>;

  sendEmail: (msg: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html: string;
  }) => Promise<{ ok: boolean; id?: string }>;
}

/* ------------------------------ Utilities ----------------------------- */

const defaultId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const defaultNow = () => new Date().toISOString();

function sumSell(lines: OrderLine[]): Minor {
  return lines.reduce((acc, l) => acc + l.unit_price * l.qty, 0);
}

function computeTransportFlag(t: BdoOutcome["transport"]): TransportFlag {
  if (t?.in_quote) return "CDIQ";
  return t?.mode ? "CDC" : "CDN";
}

function compact<T extends object>(obj: T): T {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

/* ------------------------ Email Templates (PO/SO) ---------------------- */

function emailSubject(order: OrderRecord): string {
  const tag = order.direction === "inbound" ? "PO Request" : "SO Request";
  const site = order.counterparty.site_name ? ` â€” ${order.counterparty.site_name}` : "";
  return `[OBARI Â· Order] ${tag}${site} â€¢ ${order.order_id}`;
}

function currency(minor: Minor, symbol = "Â£") {
  return `${symbol}${(minor / 100).toFixed(2)}`;
}

function emailHTML_RequestNumbers(order: OrderRecord): string {
  const isInbound = order.direction === "inbound";
  const want = isInbound ? "Purchase Order (PO)" : "Sales Order (SO)";
  const sched =
    order.schedule.kind === "scheduled"
      ? `<p><strong>Schedule:</strong> ${order.schedule.rule}${order.schedule.day ? ` â€¢ ${order.schedule.day}` : ""}${order.schedule.window ? ` â€¢ ${order.schedule.window}` : ""}</p>`
      : order.schedule.kind === "rental"
        ? `<p><strong>Schedule:</strong> Rental â€¢ ${order.schedule.rule}</p>`
        : `<p><strong>Schedule:</strong> Ad-hoc</p>`;

  const lines = order.lines
    .map(
      (ln) => `
      <tr>
        <td>${ln.sku}</td>
        <td>${ln.title}</td>
        <td align="right">${ln.qty}${ln.uom ? " " + ln.uom : ""}</td>
        <td align="right">${currency(ln.unit_price)}</td>
      </tr>`
    )
    .join("");

  const tf = order.transport_flag;
  const tfTxt =
    tf === "CDIQ"
      ? "Collection/Delivery is included in the quoted price."
      : tf === "CDC"
        ? "Transport will be billed separately."
        : "Collection/Delivery required â€” we will arrange and confirm price.";

  return `
  <div style="font-family: Inter, Arial, sans-serif; line-height:1.45">
    <p>Dear ${order.counterparty.name},</p>
    <p>We are setting up your order and require your ${want} reference to proceed to booking.</p>
    ${sched}
    <p><strong>Transport:</strong> ${tf} â€” ${tfTxt}</p>

    <table width="100%" cellspacing="0" cellpadding="6" style="border-collapse:collapse;border:1px solid #ddd;margin:8px 0">
      <thead>
        <tr style="background:#f6f7f9">
          <th align="left">SKU</th>
          <th align="left">Item</th>
          <th align="right">Qty</th>
          <th align="right">Unit</th>
        </tr>
      </thead>
      <tbody>${lines}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" align="right" style="border-top:1px solid #ddd"><strong>Total (ex VAT):</strong></td>
          <td align="right" style="border-top:1px solid #ddd"><strong>${currency(order.totals.sell)}</strong></td>
        </tr>
      </tfoot>
    </table>

    <p><strong>Action requested:</strong> Please reply with your ${want} number (and any delivery/collection access constraints).</p>
    <p>Kind regards,<br/>Operations</p>
  </div>`;
}

/* ---------------------------- Stage API ------------------------------- */

export interface CreateOrderInput {
  from: BdoOutcome;
}

export async function createOrderFromBdo(input: CreateOrderInput, deps: Partial<OrderStageDeps> = {}): Promise<OrderRecord> {
  const id = deps.id ?? defaultId;
  const now = deps.nowISO ?? defaultNow;

  // Minimal structural validation
  if (!input?.from?.bdo_id) throw new Error("BDO id is required");
  if (!input.from.lines || input.from.lines.length === 0) throw new Error("At least one line is required");

  const order: OrderRecord = {
    order_id: id("ORD"),
    bdo_id: input.from.bdo_id,
    direction: input.from.direction,
    counterparty: input.from.counterparty,
    our_party: input.from.our_party,
    schedule: input.from.schedule,
    transport: input.from.transport,
    geography: input.from.geography,
    lines: input.from.lines,
    references: compact({
      quote_id: input.from.references?.quote_id,
      product_ids: input.from.references?.product_ids,
      client_po: input.from.references?.client_po,
    }),
    totals: { sell: sumSell(input.from.lines) },
    transport_flag: computeTransportFlag(input.from.transport),
    created_at: now(),
    updated_at: now(),
    status: "created",
    audit: [
      {
        id: id("AE"),
        at: now(),
        kind: "create",
        note: "Order created from BDO outcome",
        meta: { bdo_id: input.from.bdo_id },
      },
    ],
  };

  if (!deps.saveOrder) throw new Error("saveOrder adapter not provided");
  await deps.saveOrder(order);
  return order;
}

export interface RequestNumbersInput {
  order: OrderRecord;
}

export async function requestOrderNumbers(args: RequestNumbersInput, deps: Partial<OrderStageDeps> = {}): Promise<OrderRecord> {
  if (!deps.resolveContacts || !deps.sendEmail || !deps.patchOrder || !deps.appendAudit) {
    throw new Error("resolveContacts, sendEmail, patchOrder, appendAudit adapters are required");
  }

  const { order } = args;
  const contacts = await deps.resolveContacts({
    direction: order.direction,
    counterpartyId: order.counterparty.id,
    siteId: order.counterparty.site_id,
  });

  if (!contacts.to || contacts.to.length === 0) {
    await deps.appendAudit!(order.order_id, {
      id: (deps.id ?? defaultId)("AE"),
      at: (deps.nowISO ?? defaultNow)(),
      kind: "contact_failure",
      note: "No recipients found for PO/SO request.",
    });
    throw new Error("No recipients resolved for PO/SO request");
  }

  const subject = emailSubject(order);
  const html = emailHTML_RequestNumbers(order);

  const mail = await deps.sendEmail({
    to: contacts.to,
    cc: contacts.cc,
    bcc: ["ops-archive@example.com"],
    subject,
    html,
  });

  await deps.appendAudit(order.order_id, {
    id: (deps.id ?? defaultId)("AE"),
    at: (deps.nowISO ?? defaultNow)(),
    kind: "mail_sent",
    note: "PO/SO request email sent",
    meta: { mail_id: mail.id, to: contacts.to, cc: contacts.cc },
  });

  const patched = await deps.patchOrder(order.order_id, {
    status: "awaiting_numbers",
    updated_at: (deps.nowISO ?? defaultNow)(),
  });

  await deps.appendAudit(order.order_id, {
    id: (deps.id ?? defaultId)("AE"),
    at: (deps.nowISO ?? defaultNow)(),
    kind: "numbers_requested",
  });

  return patched;
}

export interface AttachNumbersInput {
  order_id: string;
  po_number?: string;
  so_number?: string;
}

export async function attachOrderNumbers(args: AttachNumbersInput, deps: Partial<OrderStageDeps> = {}): Promise<OrderRecord> {
  if (!deps.patchOrder || !deps.appendAudit) throw new Error("patchOrder and appendAudit adapters are required");

  const { po_number, so_number } = args;

  // Optional format checks
  if (po_number && deps.validatePONumber && !deps.validatePONumber(po_number)) {
    throw new Error("Invalid PO number format");
  }
  if (so_number && deps.validateSONumber && !deps.validateSONumber(so_number)) {
    throw new Error("Invalid SO number format");
  }

  const patched = await deps.patchOrder(args.order_id, {
    references: compact({
      po_number,
      so_number,
    }) as any,
    status: "numbers_attached",
    updated_at: (deps.nowISO ?? defaultNow)(),
  });

  await deps.appendAudit(args.order_id, {
    id: (deps.id ?? defaultId)("AE"),
    at: (deps.nowISO ?? defaultNow)(),
    kind: "numbers_attached",
    meta: compact({ po_number, so_number }),
  });

  return patched;
}

export async function markReadyForBooking(order_id: string, deps: Partial<OrderStageDeps> = {}): Promise<OrderRecord> {
  if (!deps.patchOrder || !deps.appendAudit) throw new Error("patchOrder and appendAudit adapters are required");
  const patched = await deps.patchOrder(order_id, {
    status: "ready_for_booking",
    updated_at: (deps.nowISO ?? defaultNow)(),
  });
  await deps.appendAudit(order_id, {
    id: (deps.id ?? defaultId)("AE"),
    at: (deps.nowISO ?? defaultNow)(),
    kind: "ready_flagged",
    note: "Order ready to move to Booking stage",
  });
  return patched;
}

/* ----------------------------- Default API ----------------------------- */

export const OrderStage = {
  createOrderFromBdo,
  requestOrderNumbers,
  attachOrderNumbers,
  markReadyForBooking,
};

export default OrderStage;
