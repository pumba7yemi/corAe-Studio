// packages/workfocus-core/tasksheets/engine.ts
// Task Sheets engine — org templates → user copies → diary sync.

/* Minimal in-file diary types and helpers to avoid depending on ../diary/engine during build */
export type Scope = 'WORK' | 'HOME';

export type DiaryEntry = {
  id: string;
  title: string;
  notes?: string;
  bucket?: 'INBOX' | 'ONGOING';
  status?: 'OPEN' | 'DONE';
  createdAt?: string;
  source?: string;
  orgId?: string;
  userId?: string;
  tags?: string[];
};

export type DiaryState = {
  entries: DiaryEntry[];
};

const diaryKey = (scope: Scope, orgId: string, userId?: string) =>
  `diary:${scope}:${orgId}:${userId ?? 'ORG'}`;

function ensureDiarySeeded(scope: Scope, orgId: string, userId?: string): DiaryState {
  if (typeof localStorage === 'undefined') return { entries: [] };
  try {
    const raw = localStorage.getItem(diaryKey(scope, orgId, userId));
    if (raw) return JSON.parse(raw) as DiaryState;
    const seeded: DiaryState = { entries: [] };
    localStorage.setItem(diaryKey(scope, orgId, userId), JSON.stringify(seeded));
    return seeded;
  } catch {
    return { entries: [] };
  }
}

function saveDiary(scope: Scope, orgId: string, userId: string | undefined, state: DiaryState) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(diaryKey(scope, orgId, userId), JSON.stringify(state));
  } catch {}
}

function chronoOrder(entries: DiaryEntry[]) {
  // newest first
  return entries.slice().sort((a, b) => {
    const ta = a.createdAt ?? '';
    const tb = b.createdAt ?? '';
    if (ta === tb) return 0;
    return ta < tb ? 1 : -1;
  });
}

export type SheetStatus = 'ACTIVE' | 'ARCHIVED';
export type ItemStatus  = 'PENDING' | 'DONE' | 'SKIPPED';
export type Frequency   = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONCE';

export type TaskItem = {
  id: string;
  title: string;
  notes?: string;
  required?: boolean;     // if true → gets mirrored to Diary when pending
  status: ItemStatus;
  lastDoneAt?: string;    // ISO
  nextDueAt?: string;     // ISO (optional MVP)
  link?: string;          // deep-link to workflow step
};

export type TaskSheet = {
  id: string;
  title: string;
  scope: Scope;           // 'WORK' | 'HOME'
  orgId: string;
  userId?: string;        // undefined → org template
  frequency: Frequency;
  status: SheetStatus;
  createdAt: string;
  updatedAt: string;
  source: 'ORG_TEMPLATE' | 'USER';
  items: TaskItem[];
  tags?: string[];
};

export type SheetsState = {
  sheets: TaskSheet[];
};

const SHEETS_KEY = (scope: Scope, orgId: string, userId?: string) =>
  `sheets:${scope}:${orgId}:${userId ?? 'ORG'}`;

// ---------- Storage (MVP: local) ----------
export function loadSheets(scope: Scope, orgId: string, userId?: string): SheetsState {
  if (typeof localStorage === 'undefined') return { sheets: [] };
  try {
    const raw = localStorage.getItem(SHEETS_KEY(scope, orgId, userId));
    return raw ? (JSON.parse(raw) as SheetsState) : { sheets: [] };
  } catch {
    return { sheets: [] };
  }
}

export function saveSheets(scope: Scope, orgId: string, userId: string | undefined, state: SheetsState) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SHEETS_KEY(scope, orgId, userId), JSON.stringify(state));
  } catch {}
}

// ---------- Seeding ----------
export function seedOrgSheets(orgId: string, scope: Scope): TaskSheet[] {
  const now = new Date().toISOString();
  return [
    {
      id: `sheet_${orgId}_opening`,
      title: 'Opening Checklist',
      scope,
      orgId,
      frequency: 'DAILY',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      source: 'ORG_TEMPLATE',
      items: [
        { id: 'unlock', title: 'Unlock & safety sweep', required: true, status: 'PENDING' },
        { id: 'systems', title: 'Power on systems (POS/Booking/CIMS)', required: true, status: 'PENDING' },
        { id: 'brief', title: 'Team brief / Top-3 sync', status: 'PENDING' },
      ],
    },
    {
      id: `sheet_${orgId}_midday`,
      title: 'Midday Pulse',
      scope,
      orgId,
      frequency: 'DAILY',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      source: 'ORG_TEMPLATE',
      items: [
        { id: 'service-check', title: 'Service quality check', required: true, status: 'PENDING' },
        { id: 'stock-scan', title: 'Quick stock / supplies scan', status: 'PENDING' },
      ],
    },
    {
      id: `sheet_${orgId}_closing`,
      title: 'Closing Checklist',
      scope,
      orgId,
      frequency: 'DAILY',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      source: 'ORG_TEMPLATE',
      items: [
        { id: 'cashup', title: 'Cash-up / end-of-day reconciliation', required: true, status: 'PENDING' },
        { id: 'lockdown', title: 'Shutdown & lockup', required: true, status: 'PENDING' },
      ],
    },
  ];
}

// Ensure org templates exist; then ensure user copy exists (idempotent).
export function ensureSeededSheets(scope: Scope, orgId: string, userId?: string): SheetsState {
  const org = loadSheets(scope, orgId, undefined);
  if (!org.sheets.length) {
    const seeded = seedOrgSheets(orgId, scope);
    saveSheets(scope, orgId, undefined, { sheets: seeded });
  }
  const user = loadSheets(scope, orgId, userId);
  if (!user.sheets.length) {
    // copy shallow; keep item ids stable so diary mirrors can key off them
    const base = loadSheets(scope, orgId, undefined).sheets;
    const copies: TaskSheet[] = base.map(s => ({
      ...s,
      userId,
      source: 'USER',
      id: `${s.id}__${userId}`, // stable per user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: s.items.map(it => ({ ...it })), // reset statuses independently
    }));
    const state = { sheets: copies };
    saveSheets(scope, orgId, userId, state);
    return state;
  }
  return user;
}

// ---------- Diary sync ----------
const diaryIdFor = (sheetId: string, itemId: string) => `sheet:${sheetId}#${itemId}`;

export function syncSheetToDiary(params: {
  scope: Scope; orgId: string; userId: string; sheetId: string;
  mirrorBucket?: 'INBOX' | 'ONGOING';
}) {
  const { scope, orgId, userId, sheetId, mirrorBucket = 'INBOX' } = params;
  // Load user sheet
  const userSheets = ensureSeededSheets(scope, orgId, userId).sheets;
  const sheet = userSheets.find(s => s.id === sheetId && s.status === 'ACTIVE');
  if (!sheet) return;

  // Ensure diary exists/merged
  const diary = ensureDiarySeeded(scope, orgId, userId);
  const had = new Map<string, number>(); // id → index
  diary.entries.forEach((e, i) => had.set(e.id, i));

  const now = new Date().toISOString();
  let changed = false;

  for (const item of sheet.items) {
    const needsMirror = item.required && item.status === 'PENDING';
    const dId = diaryIdFor(sheetId, item.id);
    const existsIdx = had.get(dId);

    if (needsMirror) {
      // create or update into Diary as INBOX/ONGOING OPEN
      const entry: DiaryEntry = {
        id: dId,
        title: `(${sheet.title}) ${item.title}`,
        notes: item.notes || '',
        bucket: mirrorBucket,
        status: 'OPEN',
        createdAt: now,
        source: 'ORG_SEED',
        orgId,
        userId,
        tags: ['tasksheet'],
      };
      if (existsIdx == null) {
        diary.entries.unshift(entry);
        changed = true;
      } else {
        // keep status OPEN if user hasn’t closed it
        const cur = diary.entries[existsIdx];
        if (cur.status !== 'DONE') {
          diary.entries[existsIdx] = { ...cur, bucket: mirrorBucket, notes: entry.notes };
          changed = true;
        }
      }
    } else {
      // If item no longer needs mirroring, mark diary entry done (if exists)
      if (existsIdx != null) {
        const cur = diary.entries[existsIdx];
        if (cur.status !== 'DONE') {
          diary.entries[existsIdx] = { ...cur, status: 'DONE' };
          changed = true;
        }
      }
    }
  }

  if (changed) {
    // Optional: keep diary ordered (not required)
    const ordered = chronoOrder(diary.entries);
    saveDiary(scope, orgId, userId, { entries: ordered as DiaryState['entries'] as any });
  }
}

// Update a single item status and re-sync diary.
export function setItemStatus(params: {
  scope: Scope; orgId: string; userId: string; sheetId: string; itemId: string; status: ItemStatus;
}) {
  const { scope, orgId, userId, sheetId, itemId, status } = params;
  const state = ensureSeededSheets(scope, orgId, userId);
  const sheet = state.sheets.find(s => s.id === sheetId);
  if (!sheet) return;
  const item = sheet.items.find(i => i.id === itemId);
  if (!item) return;

  item.status = status;
  const now = new Date().toISOString();
  sheet.updatedAt = now;
  if (status === 'DONE') item.lastDoneAt = now;

  saveSheets(scope, orgId, userId, state);
  syncSheetToDiary({ scope, orgId, userId, sheetId });
}