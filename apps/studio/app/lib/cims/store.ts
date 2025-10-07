// app/lib/cims/store.ts

// ---------- shared domain ----------
export type CIMSDomain =
  | "management"
  | "hr"
  | "finance"
  | "operations"
  | "marketing";

// ---------- item types ----------
export type InboxItem = {
  id: string;
  from: string;
  subject: string;
  time: string; // HH:MM
  hint?: string;
  type?: "automate" | "vendor" | "customer" | "system";
  status?: "new" | "approved" | "escalated" | "archived";
  domain?: CIMSDomain;
};

export type OutboxItem = {
  id: string;
  to: string;
  subject: string;
  status: "sent" | "queued" | "failed";
  time: string; // HH:MM
  domain?: CIMSDomain;
};

export type SignalItem = {
  id: string;
  source: string;
  text: string;
  level: "info" | "warn" | "critical";
  time: string; // HH:MM
  acknowledged?: boolean;
  domain?: CIMSDomain;
};

// ---------- utils ----------
const hhmm = () => new Date().toISOString().slice(11, 16);
const uid = () => {
  try {
    // @ts-expect-error randomUUID available at runtime
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {}
  return `id_${Date.now().toString(36)}`;
};

// ---------- demo seeds ----------
let INBOX: InboxItem[] = [
  {
    id: uid(),
    from: "System • Automate",
    subject: "Approval requested: PO #A102 (Vendor: Demo Partner)",
    time: hhmm(),
    hint: "Requires Owner or Admin",
    type: "automate",
    status: "new",
    domain: "operations",
  },
  {
    id: uid(),
    from: "Finance Bot",
    subject: "Cash runway warning (AED 6.2k needed today)",
    time: hhmm(),
    type: "system",
    status: "new",
    domain: "finance",
  },
];

let OUTBOX: OutboxItem[] = [
  {
    id: uid(),
    to: "Vendor: Demo Partner",
    subject: "Price confirmation request (Pricelock policy attached)",
    status: "sent",
    time: hhmm(),
    domain: "operations",
  },
  {
    id: uid(),
    to: "Team: Ops",
    subject: "Shelf price update reminder",
    status: "queued",
    time: hhmm(),
    domain: "operations",
  },
  {
    id: uid(),
    to: "Customer",
    subject: "Order confirmation & delivery window",
    status: "failed",
    time: hhmm(),
    domain: "marketing",
  },
];

let SIGNALS: SignalItem[] = [
  {
    id: uid(),
    source: "Automate • Market",
    text: "Competitor price drop detected on SKU-PEPSI-500",
    level: "warn",
    time: hhmm(),
    domain: "marketing",
  },
  {
    id: uid(),
    source: "Automate • Guard",
    text: "Guard `withinCeiling` blocked workflow run",
    level: "critical",
    time: hhmm(),
    domain: "operations",
  },
];

// ---------- helpers ----------
const byDomain = <T extends { domain?: CIMSDomain }>(
  items: T[],
  domain?: CIMSDomain | "all"
) => (domain && domain !== "all" ? items.filter((i) => i.domain === domain) : items);

// ---------- store API ----------
export const CIMSStore = {
  inbox: {
    list: async (domain?: CIMSDomain | "all") => byDomain(INBOX, domain),
    add: async (item: InboxItem) => (INBOX = [item, ...INBOX]),
    setStatus: async (id: string, status: InboxItem["status"]) => {
      INBOX = INBOX.map((m) => (m.id === id ? { ...m, status } : m));
    },
    remove: async (id: string) => (INBOX = INBOX.filter((m) => m.id !== id)),
  },
  outbox: {
    list: async (domain?: CIMSDomain | "all") => byDomain(OUTBOX, domain),
    add: async (item: OutboxItem) => (OUTBOX = [item, ...OUTBOX]),
    setStatus: async (id: string, status: OutboxItem["status"]) => {
      OUTBOX = OUTBOX.map((m) => (m.id === id ? { ...m, status } : m));
    },
  },
  signals: {
    list: async (domain?: CIMSDomain | "all") => byDomain(SIGNALS, domain),
    add: async (item: SignalItem) => (SIGNALS = [item, ...SIGNALS]),
    // primary method used by latest endpoints
    ack: async (id: string) => {
      SIGNALS = SIGNALS.map((s) =>
        s.id === id ? { ...s, acknowledged: true } : s
      );
    },
    // alias for backward compatibility with earlier route using "acknowledge"
    acknowledge: async (id: string) => {
      SIGNALS = SIGNALS.map((s) =>
        s.id === id ? { ...s, acknowledged: true } : s
      );
    },
  },
};

// ---------- push helpers (used by Automate later) ----------
export const pushInbox = (subject: string, opts?: Partial<InboxItem>) =>
  CIMSStore.inbox.add({
    id: uid(),
    from: opts?.from ?? "Automate",
    subject,
    time: hhmm(),
    type: opts?.type ?? "automate",
    status: "new",
    domain: opts?.domain ?? "operations",
    hint: opts?.hint,
  });

export const pushOutbox = (
  to: string,
  subject: string,
  opts?: Partial<OutboxItem>
) =>
  CIMSStore.outbox.add({
    id: uid(),
    to,
    subject,
    status: opts?.status ?? "sent",
    time: hhmm(),
    domain: opts?.domain ?? "operations",
  });

export const pushSignal = (text: string, opts?: Partial<SignalItem>) =>
  CIMSStore.signals.add({
    id: uid(),
    source: opts?.source ?? "Automate",
    text,
    level: opts?.level ?? "info",
    time: hhmm(),
    domain: opts?.domain ?? "operations",
  });