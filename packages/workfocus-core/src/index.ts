// packages/workfocus-core/src/index.ts
/**
 * @corae/workfocus-core — minimal, type-safe Work Focus API for CAIA.
 * Buckets: inbox | priority3 | ongoing
 * Status:  todo | doing | done | blocked
 */

export type WFStatus = "todo" | "doing" | "done" | "blocked";
export type WFBucket = "inbox" | "priority3" | "ongoing";

export interface WFItem {
  id: string;
  title: string;
  bucket: WFBucket;
  status: WFStatus;
  dueISO?: string;
  tags?: string[];
  notes?: string;
}

export interface WFState {
  inbox: WFItem[];
  priority3: WFItem[];
  ongoing: WFItem[];
}

/* ---------------- Constants (no widening) ---------------- */

export const STATUS = {
  TODO: "todo",
  DOING: "doing",
  DONE: "done",
  BLOCKED: "blocked",
} as const;
export type STATUS = typeof STATUS[keyof typeof STATUS]; // = WFStatus

export const BUCKET = {
  INBOX: "inbox",
  P3: "priority3",
  ONGOING: "ongoing",
} as const;
export type BUCKET = typeof BUCKET[keyof typeof BUCKET]; // = WFBucket

/* ---------------- Helpers ---------------- */

export function isWFStatus(s: unknown): s is WFStatus {
  return s === "todo" || s === "doing" || s === "done" || s === "blocked";
}

export function isWFBucket(s: unknown): s is WFBucket {
  return s === "inbox" || s === "priority3" || s === "ongoing";
}

/** Create a WFItem with literal-safe status/bucket (prevents widening). */
export function createItem(
  id: string,
  title: string,
  bucket: WFBucket,
  status: WFStatus,
  extra?: Omit<WFItem, "id" | "title" | "bucket" | "status">
): WFItem {
  return { id, title, bucket, status, ...(extra ?? {}) };
}

/* ---------------- Engine ---------------- */

export const PROMPTS = {
  HAVE_YOU: "Have you completed the task?",
  UNDERTAKE: "Undertake the task now.",
  NEXT: "Move to the next Work Focus.",
} as const;

export type WFPhrase = typeof PROMPTS[keyof typeof PROMPTS];

export interface WFAdvice {
  prompt: WFPhrase;
  suggestion?: string;
  targetBucket?: WFBucket;
  targetId?: string;
}

/** Choose first actionable: priority3 → ongoing → inbox */
export function pickNextActionable(state: WFState): { bucket: WFBucket; item?: WFItem } {
  const p = state.priority3.find((i) => i.status !== STATUS.DONE && i.status !== STATUS.BLOCKED);
  if (p) return { bucket: BUCKET.P3, item: p };
  const o = state.ongoing.find((i) => i.status !== STATUS.DONE && i.status !== STATUS.BLOCKED);
  if (o) return { bucket: BUCKET.ONGOING, item: o };
  const i = state.inbox.find((it) => it.status !== STATUS.DONE && it.status !== STATUS.BLOCKED);
  if (i) return { bucket: BUCKET.INBOX, item: i };
  return { bucket: BUCKET.P3, item: undefined };
}

/** Core advice engine (returns stable literal prompts) */
export function advise(state: WFState): WFAdvice {
  const sel = pickNextActionable(state);
  if (!sel.item) {
    return {
      prompt: PROMPTS.NEXT,
      suggestion: "No open items. Add or review today’s Priority 3.",
      targetBucket: BUCKET.P3,
    };
    // note: even here we keep literal values so types don't widen
  }
  if (sel.item.status === STATUS.DONE) {
    return {
      prompt: PROMPTS.NEXT,
      suggestion: `Complete review and pick next after "${sel.item.title}".`,
      targetBucket: sel.bucket,
      targetId: sel.item.id,
    };
  }
  return {
    prompt: PROMPTS.HAVE_YOU,
    suggestion:
      sel.item.status === STATUS.BLOCKED ? `Unblock: ${sel.item.title}` : `Focus: ${sel.item.title}`,
    targetBucket: sel.bucket,
    targetId: sel.item.id,
  };
}

/** Pure mutations */
export function complete(state: WFState, id: string): WFState {
  const map = (arr: WFItem[]) => arr.map((it) => (it.id === id ? { ...it, status: STATUS.DONE } : it));
  return { inbox: map(state.inbox), priority3: map(state.priority3), ongoing: map(state.ongoing) };
}

export function move(state: WFState, id: string, to: WFBucket): WFState {
  const all = [...state.inbox, ...state.priority3, ...state.ongoing];
  const hit = all.find((it) => it.id === id);
  if (!hit) return state;

  const updated: WFItem = { ...hit, bucket: to };
  const rm = (arr: WFItem[]) => arr.filter((it) => it.id !== id);
  const addTo = (arr: WFItem[], b: WFBucket) => (b === to ? [updated, ...arr] : arr);

  let next: WFState = {
    inbox: rm(state.inbox),
    priority3: rm(state.priority3),
    ongoing: rm(state.ongoing),
  };
  next = {
    ...next,
    inbox: addTo(next.inbox, BUCKET.INBOX),
    priority3: addTo(next.priority3, BUCKET.P3),
    ongoing: addTo(next.ongoing, BUCKET.ONGOING),
  };
  return next;
}

export function add(state: WFState, item: WFItem): WFState {
  if (item.bucket === BUCKET.INBOX) return { ...state, inbox: [item, ...state.inbox] };
  if (item.bucket === BUCKET.P3) return { ...state, priority3: [item, ...state.priority3] };
  return { ...state, ongoing: [item, ...state.ongoing] };
}

export function emptyState(): WFState {
  return { inbox: [], priority3: [], ongoing: [] };
}

/* ---------------- Demo/seed (locked; no widening) ---------------- */

function id(prefix: string, n: number) {
  return `${prefix}-${n.toString(16)}${Math.random().toString(36).slice(2, 6)}`;
}

// Lock each bucket array explicitly; use STATUS/BUCKET constants (as const)
const inbox: WFItem[] = [
  createItem(id("in", 1), "File invoices", BUCKET.INBOX, STATUS.TODO),
  createItem(id("in", 2), "Draft vendor email", BUCKET.INBOX, STATUS.DOING),
];

const priority3: WFItem[] = [
  createItem(id("p3", 1), "Price update run", BUCKET.P3, STATUS.TODO),
  createItem(id("p3", 2), "Book depot slot", BUCKET.P3, STATUS.BLOCKED, {
    notes: "Waiting on confirmation",
  }),
];

const ongoing: WFItem[] = [
  createItem(id("og", 1), "Shelf reset plan", BUCKET.ONGOING, STATUS.DOING),
];

// Assembling the state explicitly avoids any inference leak
export const demoState: WFState = { inbox, priority3, ongoing };