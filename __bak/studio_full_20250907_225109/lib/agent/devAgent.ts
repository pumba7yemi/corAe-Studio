// apps/studio/lib/agent/devAgent.ts
import fs from 'node:fs/promises';
import path from 'node:path';

import { addNavItem } from '../navStore';

// OBARI stores
import {
  ensureStores,
  createOrder,
  bookOrder,
  markActive,
  reportOrder,
  finalInvoice,
  listOrders,
  listBookings,
  listActive,
  listReport,
  listInvoices,
} from '../obariStore';

import { getDealById } from '../dealStore';

// THEME engine
import { applyBrandTokens, type BrandTokens } from '../theme/themeEngine';

type Payload = Record<string, any>;

export async function runDevAgent(task: string, payload: Payload) {
  switch (task) {
    // -----------------------------------------------------------------------
    // Utilities
    case 'ping':
      return { message: 'pong', ts: new Date().toISOString() };

    case 'scaffold-page':
      return await scaffoldPage(payload as {
        name: string;
        title: string;
        subtitle?: string;
      });

    // -----------------------------------------------------------------------
    // Theme / Branding
    case 'apply-brand': {
      const tokens: Partial<BrandTokens> = {
        primary:    payload.primary,
        secondary:  payload.secondary,
        background: payload.background,
        surface:    payload.surface,
        text:       payload.text,
        muted:      payload.muted,
        border:     payload.border,
        radius:     payload.radius,
        font:       payload.fontFamily ?? payload.font,
      };
      await applyBrandTokens(tokens);
      return { ok: true, applied: tokens };
    }

    // -----------------------------------------------------------------------
    // OBARI one-click UI scaffold
    case 'scaffold-obari-ui': {
      const out = await scaffoldObariUI();
      return { ok: true, ...out };
    }

    // -----------------------------------------------------------------------
    // OBARI core actions
    case 'create-order': {
      await ensureStores();
      if (payload.dealId) {
        const deal = await getDealById(String(payload.dealId));
        if (!deal) throw new Error(`Deal not found: ${payload.dealId}`);
      }
      const order = await createOrder({
        vendor: String(payload.vendor || 'Unknown Vendor'),
        items: Array.isArray(payload.items) ? payload.items : [],
        dealId: payload.dealId ? String(payload.dealId) : undefined,
        notes: payload.notes ? String(payload.notes) : undefined,
      });
      await addNavItem({ href: '/orders', label: 'Orders' });
      return { ok: true, order };
    }

    case 'book-order': {
      await ensureStores();
      const booking = await bookOrder({
        orderId: String(payload.orderId),
        week: Number(payload.week ?? 1),
        day: Number(payload.day ?? 1),
        slot: String(payload.slot ?? 'AM'),
      });
      await addNavItem({ href: '/bookings', label: 'Bookings' });
      return { ok: true, booking };
    }

    case 'mark-active': {
      await ensureStores();
      const active = await markActive({
        orderId: String(payload.orderId),
        eta: payload.eta ? String(payload.eta) : undefined,
      });
      await addNavItem({ href: '/active', label: 'Active' });
      return { ok: true, active };
    }

    case 'report-order': {
      await ensureStores();
      const rep = await reportOrder({
        orderId: String(payload.orderId),
        grvRef: String(payload.grvRef ?? ''),
        expiry: payload.expiry ? String(payload.expiry) : undefined,
        adjustments: Array.isArray(payload.adjustments) ? payload.adjustments : [],
        notes: payload.notes ? String(payload.notes) : undefined,
      });
      await addNavItem({ href: '/report', label: 'Report' });
      return { ok: true, report: rep };
    }

    case 'final-invoice': {
      await ensureStores();
      const inv = await finalInvoice({
        orderId: String(payload.orderId),
        invoiceRef: String(payload.invoiceRef ?? ''),
        total: Number(payload.total ?? 0),
        currency: String(payload.currency ?? 'AED'),
      });
      await addNavItem({ href: '/invoices', label: 'Invoices' });
      return { ok: true, invoice: inv };
    }

    case 'list-obari': {
      await ensureStores();
      const [orders, bookings, active, reports, invoices] = await Promise.all([
        listOrders(),
        listBookings(),
        listActive(),
        listReport(),
        listInvoices(),
      ]);
      return { orders, bookings, active, report: reports, invoices };
    }

    default:
      throw new Error(`Unknown task: ${task}`);
  }
}

// --- safe helpers -----------------------------------------------------------
async function safeExists(filePath: string): Promise<boolean> {
  try { await fs.stat(filePath); return true; } catch { return false; }
}

async function upsertSimplePage(
  dir: string,
  title: string,
  subtitle?: string,
  opts: { force?: boolean } = {}
) {
  const pageDir = path.join(process.cwd(), 'apps', 'studio', 'app', dir);
  const pageFile = path.join(pageDir, 'page.tsx');

  await fs.mkdir(pageDir, { recursive: true });

  // If not forcing, don't overwrite an existing page
  if (!opts.force && await safeExists(pageFile)) return;

  const content = `export default function Page() {
  return (
    <div className="container stack">
      <div className="card">
        <h1 className="text-2xl font-bold">${title}</h1>
        ${subtitle ? `<p className="muted">${subtitle}</p>` : ''}
      </div>
    </div>
  );
}
`;
  await fs.writeFile(pageFile, content, 'utf8');
}

async function scaffoldObariUI(payload?: { force?: boolean }) {
  const force = Boolean(payload?.force);

  // 1) Pages to ensure exist
  const pages = [
    { slug: 'orders',   title: 'Orders',   subtitle: 'Order pipeline' },
    { slug: 'bookings', title: 'Bookings', subtitle: 'Scheduled slots' },
    { slug: 'active',   title: 'Active',   subtitle: 'In-flight deliveries' },
    { slug: 'report',   title: 'Reports',  subtitle: 'Goods received & exceptions' },
    { slug: 'invoices', title: 'Invoices', subtitle: 'Billing & settlement' },
  ];

  // 2) Create/skip depending on force flag
  for (const p of pages) {
    await upsertSimplePage(p.slug, p.title, p.subtitle, { force });
    await addNavItem({ href: `/${p.slug}`, label: p.title }); // dedup handled in addNavItem
  }

  // 3) Non-destructive: only create index if it doesn't exist or when force=true
  const rootIndex = path.join(process.cwd(), 'apps', 'studio', 'app', 'page.tsx');
  if (force || !(await safeExists(rootIndex))) {
    const grid = pages
      .map((p) => `<a className="btn" href="/${p.slug}">${p.title}</a>`)
      .join('\n        ');
    const indexContent = `export default function Home() {
  return (
    <div className="container stack">
      <h1 className="text-3xl font-bold">corAe Studio</h1>
      <p className="muted">OBARI UI</p>
      <div className="row">
        ${grid}
      </div>
    </div>
  );
}
`;
    await fs.writeFile(rootIndex, indexContent, 'utf8');
  }

  return {
    pages: pages.map((p) => `/${p.slug}`),
    note: force ? 'OBARI UI scaffolded (overwrites enabled).' : 'OBARI UI scaffolded (non-destructive).',
  };
}

// Keep this helper for single page scaffolds; it's okay if it overwrites only when you call it directly.
async function scaffoldPage(payload: { name: string; title: string; subtitle?: string }) {
  const appDir = path.join(process.cwd(), 'apps', 'studio', 'app');
  const pageDir = path.join(appDir, payload.name);
  const pageFile = path.join(pageDir, 'page.tsx');

  await fs.mkdir(pageDir, { recursive: true });

  const content = `export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">${payload.title}</h1>
      <p className="text-gray-500">${payload.subtitle ?? ''}</p>
      <div className="mt-4">This page was scaffolded by the Dev Agent</div>
    </div>
  );
}
`;
  await fs.writeFile(pageFile, content, 'utf8');
  await addNavItem({ href: '/' + payload.name, label: payload.title });
  return { ok: true, page: '/' + payload.name };
}