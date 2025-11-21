export type ItemStatus = 'DONE' | 'PENDING' | 'SKIPPED';

export type TaskSheet = {
  id: string;
  title: string;
  frequency: string;
  status: 'ACTIVE' | 'INACTIVE';
  items: {
    id: string;
    title: string;
    status: ItemStatus;
    required?: boolean;
    notes?: string;
  }[];
};

type EnsureResult = { sheets: TaskSheet[] };

// Simple in-memory store used by the stubbed functions below
const _store: EnsureResult = {
  sheets: [
    {
      id: 'sheet-1',
      title: 'Demo Sheet',
      frequency: 'Daily',
      status: 'ACTIVE',
      items: [
        { id: 'item-1', title: 'Do something', status: 'PENDING', required: true },
        { id: 'item-2', title: 'Do another', status: 'PENDING' },
      ],
    },
  ],
};

export function ensureSeededSheets(scope: string, orgId: string, userId: string): EnsureResult {
  // In a real implementation this would load/seed persistent sheets; here we return an in-memory store
  return _store;
}

export function setItemStatus(opts: { scope: string; orgId: string; userId: string; sheetId: string; itemId: string; status: ItemStatus; }) {
  const { sheetId, itemId, status } = opts;
  const sheet = _store.sheets.find(s => s.id === sheetId);
  const item = sheet?.items.find(i => i.id === itemId);
  if (item) item.status = status;
}

export function syncSheetToDiary(_opts: { scope: string; orgId: string; userId: string; sheetId: string; }) {
  // no-op stub for diary sync
}
