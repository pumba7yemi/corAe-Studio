// apps/studio/app/home/onboarding/wizard/shopping/page.tsx
"use client";

/**
 * corAe â€¢ Home â€¢ Onboarding â€¢ Shopping Wizard (HomeGroâ„¢)
 * Mirrors Business Vendor Ordering but for household supply.
 *
 * Flow:
 *   WELCOME â†’ VENDORS â†’ CATALOG â†’ CYCLE(28d) â†’ LISTS â†’ ORDERS â†’ BLUEPRINT â†’ SUCCESS
 * Features:
 *   - Save & Continue (localStorage)
 *   - 28-day cycle with anchor day + top-ups
 *   - Vendor â†’ Items â†’ Reorder logic (par levels, min/max)
 *   - Auto-generated weekly order lists
 *   - Seeds /api/home/shopping with blueprint
 *   - Emits Have-You reminders for order days
 */

import React, { useEffect, useMemo, useState } from "react";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type Step =
  | "WELCOME"
  | "VENDORS"
  | "CATALOG"
  | "CYCLE"
  | "LISTS"
  | "ORDERS"
  | "BLUEPRINT"
  | "SUCCESS";

type DayOfWeek = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

interface Vendor {
  id: string;
  name: string;
  channel?: "WALKIN" | "DELIVERY" | "APP" | "OTHER";
  contact?: string; // phone/email/url
  notes?: string;
  active: boolean;
}

interface CatalogItem {
  id: string;
  vendorId: string;
  name: string;
  unit?: string;       // kg, pack, bottle
  price?: number;      // per unit
  parLevel?: number;   // desired on-hand
  minLevel?: number;   // below this, order
  maxLevel?: number;   // cap
  tags?: string[];     // dairy, produce, etc
}

type OrderKind = "ANCHOR" | "TOPUP" | "ADHOC";

interface CyclePlan {
  anchorDay: DayOfWeek;           // main weekly order (e.g., THU)
  topupDays: DayOfWeek[];         // optional top-ups (e.g., MON)
  lengthDays: 28;                 // constant for now
  startIso?: string;              // optional fixed start
}

interface ListRule {
  id: string;
  title: string;                  // "Weekly Essentials", "Produce Top-up"
  vendorId?: string;              // lock to vendor if desired
  includeTags: string[];          // item tags included
  excludeTags: string[];          // item tags excluded
  kind: OrderKind;                // ANCHOR/TOPUP/ADHOC
  day?: DayOfWeek;                // for ADHOC default day or override
}

interface GeneratedOrderLine {
  itemId: string;
  qty: number;
  unit?: string;
  price?: number;
  vendorId: string;
}

interface GeneratedOrder {
  id: string;
  vendorId: string;
  dueDay: DayOfWeek;
  kind: OrderKind;
  lines: GeneratedOrderLine[];
  eta?: string;
}

interface ShoppingState {
  step: Step;
  householdName: string;

  vendors: Vendor[];
  catalog: CatalogItem[];
  cycle: CyclePlan;
  listRules: ListRule[];

  generated: GeneratedOrder[];

  blueprintJson: string;
  savedAt?: string | null;
}

const LOCAL_KEY = "corAeHomeWizard/shopping";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Defaults â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const initial: ShoppingState = {
  step: "WELCOME",
  householdName: "",
  vendors: [],
  catalog: [],
  cycle: { anchorDay: "THU", topupDays: ["MON"], lengthDays: 28 },
  listRules: [],
  generated: [],
  blueprintJson: "",
  savedAt: null,
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Utils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function rid(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_` + Math.random().toString(36).slice(2, 10);
}
function saveLocal(s: ShoppingState) {
  const payload = { ...s, savedAt: new Date().toISOString() };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  return payload.savedAt!;
}
function loadLocal(): ShoppingState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShoppingState;
  } catch { return null; }
}
function clearLocal() {
  localStorage.removeItem(LOCAL_KEY);
}
function timeAgo(iso?: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
const DAYS: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ UI atoms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Shell({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Home Onboarding â€¢ HomeGroâ„¢ Shopping</h1>
          <p className="text-xs text-zinc-400">28-day household purchasing cycle, vendor-mirrored.</p>
        </div>
        {right}
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">{children}</main>
    </div>
  );
}
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-zinc-400">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>;
}
function Button({ children, onClick, variant = "primary", disabled }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger"; disabled?: boolean }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const map = {
    primary: `${base} bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50`,
    secondary: `${base} bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50`,
    ghost: `${base} text-zinc-300 hover:bg-zinc-800/70`,
    danger: `${base} bg-red-600 text-white hover:bg-red-500 disabled:opacity-50`,
  } as const;
  return <button onClick={onClick} disabled={disabled} className={map[variant]}>{children}</button>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${props.className ?? ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${props.className ?? ""}`} />;
}
function Chip({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">
      {children}
      {onRemove && <button onClick={onRemove} className="text-zinc-400 hover:text-zinc-200">âœ•</button>}
    </span>
  );
}
function SaveBar({ onSave, savedAt, saving }: { onSave: () => void; savedAt?: string | null; saving: boolean }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs backdrop-blur">
      <Button variant="secondary" onClick={onSave} disabled={saving}>{saving ? "Savingâ€¦" : "Save & Continue Later"}</Button>
      <span className="text-zinc-400">{savedAt ? `Last saved ${timeAgo(savedAt)}` : "Not saved yet"}</span>
    </div>
  );
}
function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${ok ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />
      {label}
    </span>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Steps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Welcome({ s, set, next }: { s: ShoppingState; set: (p: Partial<ShoppingState>) => void; next: () => void }) {
  return (
    <Card title="Welcome" hint="Mirror your home shopping to vendor-style ordering with a simple 28-day rhythm.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-200">Household name</label>
          <Input placeholder="e.g., The Adamson Household" value={s.householdName} onChange={(e) => set({ householdName: (e.target as HTMLInputElement).value })} />
        </div>
      </div>
      <Button onClick={next} disabled={!s.householdName}>Start</Button>
    </Card>
  );
}

function Vendors({ s, set, next, back }: { s: ShoppingState; set: (p: Partial<ShoppingState>) => void; next: () => void; back: () => void }) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Vendor["channel"]>("DELIVERY");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");

  function add() {
    if (!name.trim()) return;
    const v: Vendor = { id: rid("v"), name: name.trim(), channel, contact: contact.trim() || undefined, notes: notes.trim() || undefined, active: true };
    set({ vendors: [...s.vendors, v] });
    setName(""); setChannel("DELIVERY"); setContact(""); setNotes("");
  }
  function remove(id: string) {
    set({ vendors: s.vendors.filter(v => v.id !== id) });
    // also strip catalog items for this vendor
    set({ catalog: s.catalog.filter(ci => ci.vendorId !== id) });
  }

  return (
    <Card title="Vendors / Sources" hint="Add the places you buy from (apps, stores, local market, delivery).">
      <div className="grid gap-3 sm:grid-cols-4">
        <Input placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={channel} onChange={(e) => setChannel(e.target.value as any)}>
          <option value="DELIVERY">DELIVERY</option>
          <option value="APP">APP</option>
          <option value="WALKIN">WALKIN</option>
          <option value="OTHER">OTHER</option>
        </select>
        <Input placeholder="Contact (phone/email/url)" value={contact} onChange={(e) => setContact(e.target.value)} />
        <Button variant="secondary" onClick={add}>+ Add Vendor</Button>
      </div>
      <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {s.vendors.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {s.vendors.map(v => (
            <Chip key={v.id} onRemove={() => remove(v.id)}>{v.name} {v.channel ? `â€¢ ${v.channel}` : ""}</Chip>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={s.vendors.length === 0}>Continue</Button>
      </Row>
    </Card>
  );
}

function Catalog({ s, set, next, back }: { s: ShoppingState; set: (p: Partial<ShoppingState>) => void; next: () => void; back: () => void }) {
  const [vendorId, setVendorId] = useState(s.vendors[0]?.id ?? "");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pack");
  const [price, setPrice] = useState<string>("");
  const [par, setPar] = useState<string>("");
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (!vendorId && s.vendors[0]) setVendorId(s.vendors[0].id);
  }, [s.vendors, vendorId]);

  function add() {
    if (!vendorId || !name.trim()) return;
    const ci: CatalogItem = {
      id: rid("itm"),
      vendorId,
      name: name.trim(),
      unit: unit.trim() || undefined,
      price: price ? Number(price) : undefined,
      parLevel: par ? Number(par) : undefined,
      minLevel: min ? Number(min) : undefined,
      maxLevel: max ? Number(max) : undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    set({ catalog: [...s.catalog, ci] });
    setName(""); setPrice(""); setPar(""); setMin(""); setMax(""); setTags("");
  }

  function remove(id: string) {
    set({ catalog: s.catalog.filter(c => c.id !== id) });
  }

  return (
    <Card title="Catalog" hint="Add regular items with reorder logic (par/min/max) per vendor.">
      <div className="grid gap-3 sm:grid-cols-7">
        <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm sm:col-span-2" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
          <option value="">â€” Vendor â€”</option>
          {s.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <Input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Unit (e.g., pack)" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <Input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input placeholder="Par" value={par} onChange={(e) => setPar(e.target.value)} />
        <Button variant="secondary" onClick={add}>+ Add Item</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Input placeholder="Min level" value={min} onChange={(e) => setMin(e.target.value)} />
        <Input placeholder="Max level" value={max} onChange={(e) => setMax(e.target.value)} />
        <Input placeholder="Tags (comma-sep)" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      {s.catalog.length > 0 && (
        <div className="space-y-2 pt-2">
          {s.catalog.map(ci => (
            <div key={ci.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{ci.name}</span>
                  <span className="text-zinc-400"> â€¢ {s.vendors.find(v => v.id === ci.vendorId)?.name}</span>
                  {ci.tags && ci.tags.length > 0 && <span className="ml-2 text-xs text-zinc-400">[{ci.tags.join(", ")}]</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  {ci.unit && <span>unit: {ci.unit}</span>}
                  {ci.price != null && <span>price: {ci.price}</span>}
                  {ci.parLevel != null && <span>par: {ci.parLevel}</span>}
                  {ci.minLevel != null && <span>min: {ci.minLevel}</span>}
                  {ci.maxLevel != null && <span>max: {ci.maxLevel}</span>}
                  <Button variant="danger" onClick={() => remove(ci.id)}>Remove</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={s.catalog.length === 0}>Continue</Button>
      </Row>
    </Card>
  );
}

function Cycle({ s, set, next, back }: { s: ShoppingState; set: (p: Partial<ShoppingState>) => void; next: () => void; back: () => void }) {
  const [anchorDay, setAnchor] = useState<DayOfWeek>(s.cycle.anchorDay);
  const [topups, setTopups] = useState<DayOfWeek[]>(s.cycle.topupDays);

  function toggleTop(d: DayOfWeek) {
    setTopups(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }
  function commit() {
    set({ cycle: { ...s.cycle, anchorDay, topupDays: topups } });
    next();
  }

  return (
    <Card title="28-Day Cycle" hint="Pick your main order day and optional top-ups.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-200">Anchor day (main weekly order)</label>
          <div className="flex flex-wrap gap-2 pt-2">
            {DAYS.map(d => (
              <button key={d} onClick={() => setAnchor(d)}
                className={`rounded-xl border px-3 py-1 text-sm ${anchorDay===d?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-200">Top-up days (optional)</label>
          <div className="flex flex-wrap gap-2 pt-2">
            {DAYS.map(d => (
              <button key={d} onClick={() => toggleTop(d)}
                className={`rounded-xl border px-3 py-1 text-sm ${topups.includes(d)?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={commit}>Continue</Button>
      </Row>
    </Card>
  );
}

function Lists({ s, set, next, back }: { s: ShoppingState; set: (p: Partial<ShoppingState>) => void; next: () => void; back: () => void }) {
  const [title, setTitle] = useState("");
  const [vendorId, setVendorId] = useState<string>("");
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [kind, setKind] = useState<OrderKind>("ANCHOR");
  const [day, setDay] = useState<DayOfWeek | "">("");

  function add() {
    if (!title.trim()) return;
    const lr: ListRule = {
      id: rid("lr"),
      title: title.trim(),
      vendorId: vendorId || undefined,
      includeTags: include.split(",").map(x => x.trim()).filter(Boolean),
      excludeTags: exclude.split(",").map(x => x.trim()).filter(Boolean),
      kind,
      day: day || undefined,
    };
    set({ listRules: [...s.listRules, lr] });
    setTitle(""); setVendorId(""); setInclude(""); setExclude(""); setKind("ANCHOR"); setDay("");
  }

  function remove(id: string) {
    set({ listRules: s.listRules.filter(l => l.id !== id) });
  }

  return (
    <Card title="Order Lists" hint="Create smart lists that auto-compile orders by tag/vendor and day.">
      <div className="grid gap-3 sm:grid-cols-6">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
          <option value="">Any Vendor</option>
          {s.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value as OrderKind)}>
          <option value="ANCHOR">ANCHOR</option>
          <option value="TOPUP">TOPUP</option>
          <option value="ADHOC">ADHOC</option>
        </select>
        <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={day} onChange={(e) => setDay(e.target.value as DayOfWeek | "")}>
          <option value="">â€” Day â€”</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <Input placeholder="Include tags (comma)" value={include} onChange={(e) => setInclude(e.target.value)} />
        <Input placeholder="Exclude tags (comma)" value={exclude} onChange={(e) => setExclude(e.target.value)} />
      </div>
      <Button variant="secondary" onClick={add}>+ Add List</Button>

      {s.listRules.length > 0 && (
        <div className="space-y-2 pt-2">
          {s.listRules.map(l => (
            <div key={l.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{l.title}</span>
                  <span className="text-zinc-400"> â€¢ {l.kind}</span>
                  {l.vendorId && <span className="text-zinc-400"> â€¢ {s.vendors.find(v => v.id === l.vendorId)?.name}</span>}
                  {l.day && <span className="text-zinc-400"> â€¢ {l.day}</span>}
                  {(l.includeTags.length>0 || l.excludeTags.length>0) && (
                    <span className="ml-2 text-xs text-zinc-400">[{l.includeTags.join(", ")}{l.excludeTags.length>0?" | -"+l.excludeTags.join(", "):""}]</span>
                  )}
                </div>
                <Button variant="danger" onClick={() => remove(l.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={s.listRules.length === 0}>Continue</Button>
      </Row>
    </Card>
  );
}

function Orders({ s, set, next, back }: { s: ShoppingState; set: (p: Partial<ShoppingState>) => void; next: () => void; back: () => void }) {
  const generated = useMemo(() => generateOrders(s), [s]);

  function accept() {
    set({ generated });
    next();
  }

  return (
    <Card title="Auto-Generated Orders" hint="Based on par/min/max, tags, and your cycle. You can adjust after onboarding.">
      {generated.length === 0 ? (
        <p className="text-sm text-zinc-400">No orders generated. Add list rules and catalog with tags & levels.</p>
      ) : (
        <div className="space-y-3">
          {generated.map(ord => (
            <div key={ord.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="mb-2 text-sm">
                <span className="font-medium">{s.vendors.find(v => v.id === ord.vendorId)?.name}</span>
                <span className="text-zinc-400"> â€¢ {ord.kind} â€¢ {ord.dueDay}</span>
              </div>
              {ord.lines.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-400">
                    <tr><th className="py-1">Item</th><th className="py-1">Qty</th><th className="py-1">Unit</th><th className="py-1">Price</th></tr>
                  </thead>
                  <tbody>
                    {ord.lines.map((ln, i) => {
                      const it = s.catalog.find(ci => ci.id === ln.itemId);
                      return (
                        <tr key={i} className="border-t border-zinc-800">
                          <td className="py-1">{it?.name ?? ln.itemId}</td>
                          <td className="py-1">{ln.qty}</td>
                          <td className="py-1">{ln.unit ?? it?.unit ?? ""}</td>
                          <td className="py-1">{ln.price ?? it?.price ?? ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-zinc-500">No lines matched.</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={accept} disabled={generated.length === 0}>Accept & Continue</Button>
      </Row>
    </Card>
  );
}

function Blueprint({ s, set, finish, back }: { s: ShoppingState; set: (p: Partial<ShoppingState>) => void; finish: () => void; back: () => void }) {
  const blueprint = useMemo(() => makeBlueprint(s), [s]);

  useEffect(() => {
    set({ blueprintJson: JSON.stringify(blueprint, null, 2) });
  }, [blueprint, set]);

  async function seedApis() {
    try {
      await fetch("/api/home/shopping", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seedFromBlueprint", blueprint }),
      });
    } catch {}
    // Seed Have-You reminders for anchor + top-ups:
    try {
      const reminders = makeHaveYouReminders(s);
      await fetch("/api/home/haveyou", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkUpsert", items: reminders }),
      });
    } catch {}
  }

  function download() {
    const blob = new Blob([s.blueprintJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${s.householdName || "homegro-shopping"}-blueprint.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card title="Shopping Blueprint" hint="This JSON seeds vendors, catalog, lists, and generated orders.">
      <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{s.blueprintJson}</pre>
      <Row>
        <Button variant="secondary" onClick={download}>Download JSON</Button>
        <Button variant="secondary" onClick={seedApis}>Seed APIs</Button>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={finish} disabled={!s.blueprintJson}>Confirm & Generate</Button>
      </Row>
    </Card>
  );
}

function Success() {
  return (
    <Card title="Shopping Rhythm Ready ðŸŽ‰" hint="Your 28-day HomeGroâ„¢ schedule is now live.">
      <p className="text-sm text-zinc-300">Youâ€™ll receive prompts on anchor/top-up days to confirm or edit orders before sending.</p>
    </Card>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function HomeShoppingWizardPage() {
  const [s, setS] = useState<ShoppingState>(initial);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<ShoppingState | null>(null);

  useEffect(() => { const d = loadLocal(); if (d) setResume(d); }, []);
  function set(p: Partial<ShoppingState>) { setS(x => ({ ...x, ...p })); }
  function go(step: Step) { set({ step }); }
  function save() { setSaving(true); const when = saveLocal(s); set({ savedAt: when }); setTimeout(() => setSaving(false), 250); }
  function resumeDraft() { if (!resume) return; setS(resume); setResume(null); }
  function discardDraft() { clearLocal(); setResume(null); }
  function finish() { clearLocal(); go("SUCCESS"); }

  const headerRight = (
    <div className="flex items-center gap-2 text-xs">
      <Badge ok={!!s.householdName} label="Home" />
      <Badge ok={s.vendors.length>0} label="Vendors" />
      <Badge ok={s.catalog.length>0} label="Catalog" />
      <Badge ok={s.listRules.length>0} label="Lists" />
      <Badge ok={s.generated.length>0} label="Orders" />
    </div>
  );

  return (
    <Shell right={headerRight}>
      {resume && (
        <div className="mb-4 rounded-xl border border-amber-900/40 bg-amber-900/20 p-4 text-sm text-amber-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>Draft found (saved {resume.savedAt ? timeAgo(resume.savedAt) : "previously"}). Resume?</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={resumeDraft}>Resume</Button>
              <Button variant="ghost" onClick={discardDraft}>Discard</Button>
            </div>
          </div>
        </div>
      )}

      {s.step === "WELCOME" && <Welcome s={s} set={set} next={() => go("VENDORS")} />}
      {s.step === "VENDORS" && <Vendors s={s} set={set} next={() => go("CATALOG")} back={() => go("WELCOME")} />}
      {s.step === "CATALOG" && <Catalog s={s} set={set} next={() => go("CYCLE")} back={() => go("VENDORS")} />}
      {s.step === "CYCLE" && <Cycle s={s} set={set} next={() => go("LISTS")} back={() => go("CATALOG")} />}
      {s.step === "LISTS" && <Lists s={s} set={set} next={() => go("ORDERS")} back={() => go("CYCLE")} />}
      {s.step === "ORDERS" && <Orders s={s} set={set} next={() => go("BLUEPRINT")} back={() => go("LISTS")} />}
      {s.step === "BLUEPRINT" && <Blueprint s={s} set={set} finish={finish} back={() => go("ORDERS")} />}
      {s.step === "SUCCESS" && <Success />}

      {s.step !== "SUCCESS" && <SaveBar onSave={save} savedAt={s.savedAt} saving={saving} />}
    </Shell>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Generators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function generateOrders(s: ShoppingState): GeneratedOrder[] {
  const out: GeneratedOrder[] = [];
  // Build maps for quick access
  const byVendorItems = new Map<string, CatalogItem[]>();
  for (const it of s.catalog) {
    const list = byVendorItems.get(it.vendorId) ?? [];
    list.push(it);
    byVendorItems.set(it.vendorId, list);
  }

  // Expand list rules into orders per vendor/day
  for (const lr of s.listRules) {
    // Determine day for this rule
    const dueDay =
      lr.kind === "ANCHOR" ? s.cycle.anchorDay :
      lr.kind === "TOPUP"  ? (s.cycle.topupDays[0] ?? s.cycle.anchorDay) :
      (lr.day ?? s.cycle.anchorDay);

    // Vendor scope
    const vendors = lr.vendorId ? s.vendors.filter(v => v.id === lr.vendorId) : s.vendors;

    for (const v of vendors) {
      const items = (byVendorItems.get(v.id) ?? []).filter(it => {
        const includeOk = lr.includeTags.length === 0 || (it.tags ?? []).some(t => lr.includeTags.includes(t));
        const excludeOk = lr.excludeTags.length === 0 || !(it.tags ?? []).some(t => lr.excludeTags.includes(t));
        return includeOk && excludeOk;
      });

      const lines: GeneratedOrderLine[] = items.map(it => {
        // Simulate reorder qty: aim to top up to par if below par; fallback to minLevel or 1
        const par = it.parLevel ?? 0;
        const min = it.minLevel ?? 0;
        let qty = par > 0 ? Math.max(par - Math.floor(par * 0.6), 1) : (min > 0 ? min : 1); // heuristic
        if (it.maxLevel && qty > it.maxLevel) qty = it.maxLevel;
        return { itemId: it.id, qty, unit: it.unit, price: it.price, vendorId: v.id };
      }).filter(ln => ln.qty > 0);

      out.push({
        id: rid("ord"),
        vendorId: v.id,
        dueDay,
        kind: lr.kind,
        lines,
      });
    }
  }

  // Collapse empty orders
  return out.filter(o => o.lines.length > 0);
}

function makeBlueprint(s: ShoppingState) {
  return {
    scope: "HOME",
    module: "SHOPPING",
    household: s.householdName,
    cycle: s.cycle,
    vendors: s.vendors,
    catalog: s.catalog,
    listRules: s.listRules,
    generatedOrders: s.generated,
    generatedAt: new Date().toISOString(),
    version: 1,
  };
}

function makeHaveYouReminders(s: ShoppingState) {
  const out: Array<{ id?: string; text: string; schedule: string }> = [];
  const anchor = s.cycle.anchorDay;
  if (anchor) {
    out.push({
      text: `Have you confirmed this weekâ€™s ANCHOR order for ${anchor}?`,
      schedule: `${anchor} 09:00`,
    });
  }
  for (const d of s.cycle.topupDays) {
    out.push({
      text: `Have you prepped todayâ€™s TOP-UP list for ${d}?`,
      schedule: `${d} 09:00`,
    });
  }
  return out;
}
