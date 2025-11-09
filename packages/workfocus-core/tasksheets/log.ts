// packages/workfocus-core/tasksheets/log.ts
// corAe™ Task Sheet Log — append-only, organization-wide tachograph.

import { chronoTick } from '../chrono/engine';
/*
 Local lightweight diary engine shim to avoid a missing-module compile error.
 This provides the minimal types and in-memory implementations used by the task log.
*/
export type Scope = 'WORK' | 'HOME';

export type DiaryEntry = {
  id: string;
  title: string;
  notes: string;
  bucket: 'INBOX' | 'ONGOING' | string;
  status: 'OPEN' | 'DONE' | string;
  createdAt: string;
  source?: string;
  orgId?: string;
  userId?: string;
  tags?: string[];
};

type DiaryStoreKey = string;
const _diaryStore: Record<DiaryStoreKey, { entries: DiaryEntry[] }> = {};

function _diaryKey(scope: Scope, orgId: string, userId?: string) {
  return `${scope}::${orgId}::${userId || 'anon'}`;
}

export function ensureSeeded(scope: Scope, orgId: string, userId?: string) {
  const k = _diaryKey(scope, orgId, userId);
  if (!_diaryStore[k]) _diaryStore[k] = { entries: [] };
  return _diaryStore[k];
}

export function saveDiary(scope: Scope, orgId: string, userId: string | undefined, diary: { entries: DiaryEntry[] }) {
  const k = _diaryKey(scope, orgId, userId);
  _diaryStore[k] = { entries: diary.entries.slice() };
}

export function chronoOrder(entries: DiaryEntry[]) {
  return entries.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// Local aliases to match the original import names used by this file
const ensureDiarySeeded = ensureSeeded;
const orderDiary = chronoOrder;
// Minimal in-file shim for the missing './engine' module to satisfy types and runtime usage.
// This mirrors the tiny in-memory behavior used by the log implementation.
export type TaskItem = {
  id: string;
  title: string;
  notes?: string;
  required?: boolean;
  status?: string;
  lastDoneAt?: string | undefined;
  nextDueAt?: string | undefined;
  link?: string | undefined;
};

export type TaskSheet = {
  id: string;
  title: string;
  scope: Scope;
  orgId: string;
  userId?: string | undefined;
  frequency?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  source?: string;
  items: TaskItem[];
  tags?: string[];
};

type SheetsKey = string;
const _sheetsStore: Record<SheetsKey, { sheets: TaskSheet[] }> = {};

function _sheetsKey(scope: Scope, orgId: string, userId?: string) {
  return `${scope}::${orgId}::${userId || 'anon'}`;
}

export function ensureSeededSheets(scope: Scope, orgId: string, userId?: string) {
  const k = _sheetsKey(scope, orgId, userId);
  if (!_sheetsStore[k]) _sheetsStore[k] = { sheets: [] };
  return _sheetsStore[k];
}

export function loadSheets(scope: Scope, orgId: string, userId?: string) {
  return ensureSeededSheets(scope, orgId, userId);
}

export function saveSheets(scope: Scope, orgId: string, userId: string | undefined, state: { sheets: TaskSheet[] }) {
  const k = _sheetsKey(scope, orgId, userId);
  _sheetsStore[k] = { sheets: state.sheets.slice() };
}

// ---------- Types ----------
export type EventKind =
  | 'WORKFLOW_ACTION'
  | 'FORM_SUBMIT'
  | 'FINANCE_TX'
  | 'HR_ACTION'
  | 'MESSAGE'
  | 'SYSTEM'
  | 'CHECKLIST_ITEM';

export type TaskEventInput = {
  scope: Scope;               // 'WORK' | 'HOME'
  orgId: string;
  userId?: string;
  deptId?: string | null;
  roleKey?: string | null;

  kind: EventKind;
  title: string;
  detail?: string;
  source: 'UI' | 'CAIA' | 'AUTOMATION' | 'INTEGRATION';
  sourceRef?: string;         // e.g. 'wizard:first-trade'
  payload?: Record<string, any>;

  mirror?: {                  // how this should appear to the user
    toDiary?: boolean;
    diaryBucket?: 'INBOX' | 'ONGOING';
  };
};

export type TaskEvent = TaskEventInput & {
  id: string;   // hash
  ts: string;   // ISO
};

// ---------- Master Sheet helpers (stored as a Sheet with special id) ----------
const MASTER_ID = (orgId: string) => `sheet_${orgId}_MASTER`;

function ensureMaster(scope: Scope, orgId: string): TaskSheet {
  const state = loadSheets(scope, orgId, undefined);
  let master = state.sheets.find(s => s.id === MASTER_ID(orgId));
  if (!master) {
    master = {
      id: MASTER_ID(orgId),
      title: 'Master Task Sheet (Tachograph)',
      scope,
      orgId,
      userId: undefined,
      frequency: 'DAILY',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'ORG_TEMPLATE',
      items: [],
      tags: ['master', 'tachograph'],
    };
    state.sheets.unshift(master);
    saveSheets(scope, orgId, undefined, state);
  }
  return master;
}

// ---------- Hash (stable-ish without crypto dep) ----------
function hashOf(obj: any): string {
  const s = JSON.stringify(obj);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'evt_' + (h >>> 0).toString(16) + '_' + Math.random().toString(36).slice(2, 8);
}

// ---------- Public: log event ----------
export function logTaskEvent(input: TaskEventInput): TaskEvent {
  const ts = new Date().toISOString();
  const event: TaskEvent = { ...input, id: hashOf({ input, ts }), ts };

  // 1) Append to Master (append-only)
  const masterState = loadSheets(event.scope, event.orgId, undefined);
  const master = ensureMaster(event.scope, event.orgId);
  const item: TaskItem = {
    id: event.id,
    title: `[${event.kind}] ${event.title}`,
    notes: event.detail,
    required: false,
    status: 'PENDING',
    lastDoneAt: undefined,
    nextDueAt: undefined,
    link: event.sourceRef,
  };
  master.items.unshift(item);
  master.updatedAt = ts;
  saveSheets(event.scope, event.orgId, undefined, masterState);

  // 2) Mirror to Department sheet (optional simple demo: deptId → its own sheet)
  if (event.deptId) {
    const deptKey = `sheet_${event.orgId}_DEPT_${event.deptId}`;
    const state = loadSheets(event.scope, event.orgId, undefined);
    let dept = state.sheets.find(s => s.id === deptKey);
    if (!dept) {
      dept = {
        id: deptKey,
        title: `Department ${event.deptId}`,
        scope: event.scope,
        orgId: event.orgId,
        frequency: 'DAILY',
        status: 'ACTIVE',
        createdAt: ts,
        updatedAt: ts,
        source: 'ORG_TEMPLATE',
        items: [],
      };
      state.sheets.unshift(dept);
    }
    dept.items.unshift({ ...item });
    dept.updatedAt = ts;
    saveSheets(event.scope, event.orgId, undefined, state);
  }

  // 3) Mirror to Diary (role-specific)
  if (event.mirror?.toDiary && event.userId) {
    const diary = ensureDiarySeeded(event.scope, event.orgId, event.userId);
    const entryId = `log:${event.id}`;
    const existsIdx = diary.entries.findIndex(d => d.id === entryId);
    const diaryEntry: DiaryEntry = {
      id: entryId,
      title: event.title,
      notes: event.detail || '',
      bucket: event.mirror.diaryBucket || 'INBOX',
      status: 'OPEN',
      createdAt: ts,
      source: 'ORG_SEED',
      orgId: event.orgId,
      userId: event.userId,
      tags: ['log', event.kind.toLowerCase()],
    };
    if (existsIdx === -1) diary.entries.unshift(diaryEntry);
    else diary.entries[existsIdx] = { ...diary.entries[existsIdx], ...diaryEntry };
    // keep tidy
    saveDiary(event.scope, event.orgId, event.userId, { entries: orderDiary(diary.entries) as any });
  }

  // 4) Chrono tick (global sequence)
  chronoTick({
    id: event.id,
    ts,
    orgId: event.orgId,
    userId: event.userId,
    kind: event.kind,
    sourceRef: event.sourceRef,
  });

  return event;
}