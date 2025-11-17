/* eslint-disable */
// apps/studio/app/work/onboarding/wizard/operations/page.tsx
"use client";

/**
 * corAe • Work • Onboarding • Operations Wizard (White-Label, Worker/HR aware)
 * Path: apps/studio/app/work/onboarding/wizard/operations/page.tsx
 *
 * Purpose:
 *  - During WORK onboarding, define the operational blueprint with awareness of WHO is setting it up:
 *      • Owner / HR: sets company-wide departments, partners, policies, routes
 *      • Individual Worker: confirms personal role, contact, department, and accepts the “Have You…” loops
 *  - Archetype → Identity (Owner/HR/Worker) → Departments → Partners/Roles → Work Items → SLA → Checklists → QA/Reporting → Blueprint
 *  - Save & Continue (localStorage). On finish: seeds ship/work APIs.
 *
 * Integrations (optional, safe to comment):
 *  - POST /api/ship/work/partners (bulkUpsert)
 *  - POST /api/ship/work/operations (seedFromBlueprint)
 */

import React, { useEffect, useMemo, useState } from "react";

/* ───────────────────── Types ───────────────────── */
type StepKey =
  | "WELCOME"
  | "IDENTITY"
  | "ARCHETYPE"
  | "DEPARTMENTS"
  | "PARTNERS"
  | "WORKER_ROLE"
  | "WORK_ITEMS"
  | "SLA"
  | "CHECKLISTS"
  | "QA_REPORT"
  | "BLUEPRINT"
  | "SUCCESS";

type ArchetypeKey = "HOTEL" | "MANUFACTURING" | "SALON" | "REPAIR" | "CUSTOM";
type IdentityKey = "OWNER" | "HR" | "WORKER";

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface Partner {
  id: string;
  role: string;          // e.g., "Front Desk", "Production Lead", "Stylist", "Technician"
  contact?: string;      // optional email/alias
  isExternal?: boolean;  // vendor/contractor
  departmentId?: string; // optional link
}

interface WorkItemType {
  id: string;
  name: string;         // e.g., "Room Turnover", "Batch Run", "Service Ticket"
  fields: string[];     // required fields when raising a request
}

interface SLAConfig {
  acceptanceWindowHours: number;   // partner must accept within X hours
  escalationTo: string[];          // roles to notify if no acceptance
}

interface ChecklistTemplate {
  workItemId: string;
  title: string;
  items: string[];      // ordered steps
}

interface QAConfig {
  reviewerRole: string;       // who signs-off
  requirePhoto?: boolean;     // attachment rule
  requireSignature?: boolean; // client signoff
}

interface ReportingConfig {
  pushToObari?: boolean;
  pushToFinance?: boolean;
  tags: string[];            // labels used for dashboards
}

interface WorkerProfile {
  fullName: string;
  email: string;
  roleTitle: string;
  departmentId?: string;
  phone?: string;
  willAcceptHaveYou: boolean;
}

interface OpsState {
  step: StepKey;

  // identity
  businessName: string;
  archetype: ArchetypeKey | null;
  identity: IdentityKey | null;

  // structure
  departments: Department[];
  partners: Partner[];
  workItems: WorkItemType[];

  // execution policy
  sla: SLAConfig;
  checklists: ChecklistTemplate[];

  // qa/reporting
  qa: QAConfig;
  reporting: ReportingConfig;

  // worker context (when signed-in Worker is running the wizard)
  worker: WorkerProfile;

  // computed blueprint
  blueprintJson: string;

  savedAt?: string | null;
}

/* ───────────────────── Defaults / Packs ───────────────────── */
const LOCAL_KEY = "corAeOpsWizard/work-onboarding";

const initialState: OpsState = {
  step: "WELCOME",
  businessName: "",
  archetype: null,
  identity: null,
  departments: [],
  partners: [],
  workItems: [],
  sla: {
    acceptanceWindowHours: 24,
    escalationTo: [],
  },
  checklists: [],
  qa: {
    reviewerRole: "Manager",
    requirePhoto: false,
    requireSignature: false,
  },
  reporting: {
    pushToObari: true,
    pushToFinance: false,
    tags: [],
  },
  worker: {
    fullName: "",
    email: "",
    roleTitle: "",
    departmentId: undefined,
    phone: "",
    willAcceptHaveYou: true,
  },
  blueprintJson: "",
  savedAt: null,
};

// Lightweight archetype presets (white-label; no domain lock-in)
const PACKS: Record<ArchetypeKey, {
  departments: Department[];
  partners: Partner[];
  workItems: WorkItemType[];
  checklists: ChecklistTemplate[];
}> = {
  HOTEL: {
    departments: [
      d("front-office", "Front Office"),
      d("housekeeping", "Housekeeping"),
      d("maintenance", "Maintenance"),
      d("f&b", "F&B"),
    ],
    partners: [
      p("front-desk", "Front Desk"),
      p("housekeeper", "Housekeeper"),
      p("maintenance-tech", "Maintenance Technician"),
      p("duty-manager", "Duty Manager"),
    ],
    workItems: [
      w("room-turnover", "Room Turnover", ["Room #", "Priority"]),
      w("maintenance-ticket", "Maintenance Ticket", ["Location", "Issue"]),
      w("fnb-request", "F&B Request", ["Outlet", "Items"]),
    ],
    checklists: [
      c("room-turnover", "Turnover Steps", ["Strip linens", "Clean surfaces", "Restock amenities", "Final inspection"]),
      c("maintenance-ticket", "General Fix", ["Assess issue", "Isolate power/water if needed", "Repair/replace", "Test & restore"]),
    ],
  },
  MANUFACTURING: {
    departments: [
      d("production", "Production"),
      d("quality", "Quality"),
      d("maintenance", "Maintenance"),
      d("logistics", "Logistics"),
    ],
    partners: [
      p("line-lead", "Line Lead"),
      p("qa-inspector", "QA Inspector"),
      p("maint-tech", "Maintenance Technician"),
      p("dispatcher", "Dispatcher"),
    ],
    workItems: [
      w("batch-run", "Batch Run", ["SKU", "Batch Size"]),
      w("quality-hold", "Quality Hold", ["SKU", "Reason"]),
      w("work-order", "Work Order", ["Asset", "Task"]),
    ],
    checklists: [
      c("batch-run", "Run Start", ["Pre-checks", "Materials staged", "Safety OK", "Start batch"]),
      c("quality-hold", "Hold Protocol", ["Isolate units", "Tag & log", "Notify QA lead"]),
    ],
  },
  SALON: {
    departments: [
      d("front-desk", "Front Desk"),
      d("service", "Service"),
      d("inventory", "Inventory"),
    ],
    partners: [
      p("receptionist", "Receptionist"),
      p("stylist", "Stylist"),
      p("colorist", "Colorist"),
      p("manager", "Manager"),
    ],
    workItems: [
      w("appointment", "Appointment", ["Client", "Service Type"]),
      w("service-ticket", "Service Ticket", ["Client", "Request"]),
      w("stock-replenish", "Stock Replenish", ["Item", "Qty"]),
    ],
    checklists: [
      c("service-ticket", "Service Flow", ["Consultation", "Perform service", "Aftercare advice", "Checkout"]),
    ],
  },
  REPAIR: {
    departments: [
      d("intake", "Intake"),
      d("workshop", "Workshop"),
      d("qa", "QA"),
      d("dispatch", "Dispatch"),
    ],
    partners: [
      p("intake-agent", "Intake Agent"),
      p("technician", "Technician"),
      p("qa-officer", "QA Officer"),
      p("dispatcher", "Dispatcher"),
    ],
    workItems: [
      w("repair-ticket", "Repair Ticket", ["Item ID", "Issue"]),
      w("install-job", "Install Job", ["Location", "Scope"]),
    ],
    checklists: [
      c("repair-ticket", "Repair Steps", ["Diagnose", "Quote", "Repair", "Bench test"]),
    ],
  },
  CUSTOM: {
    departments: [],
    partners: [],
    workItems: [],
    checklists: [],
  },
};

function d(id: string, name: string, description?: string): Department {
  return { id, name, description };
}
function p(id: string, role: string, contact?: string, isExternal?: boolean, departmentId?: string): Partner {
  return { id, role, contact, isExternal, departmentId };
}
function w(id: string, name: string, fields: string[]): WorkItemType {
  return { id, name, fields };
}
function c(workItemId: string, title: string, items: string[]): ChecklistTemplate {
  return { workItemId, title, items };
}

function rid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) { /* @ts-ignore */ return crypto.randomUUID(); }
  return "id-" + Math.random().toString(36).slice(2, 9);
}

/* ───────────────────── Persistence (local) ───────────────────── */
function saveLocal(state: OpsState) {
  const payload = { ...state, savedAt: new Date().toISOString() };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  return payload.savedAt!;
}
function loadLocal(): OpsState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OpsState;
  } catch {
    return null;
  }
}
function clearLocal() {
  localStorage.removeItem(LOCAL_KEY);
}

/* ───────────────────── UI atoms ───────────────────── */
function Shell({ children, headerRight }: { children: React.ReactNode; headerRight?: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-3 pt-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work Onboarding • Operations Wizard</h1>
          <p className="text-xs text-zinc-400">Owner/HR sets the structure; Workers confirm their role and “Have You…” loops.</p>
        </div>
        {headerRight}
      </header>
      <main className="mx-auto max-w-4xl px-3 pb-24 pt-6">{children}</main>
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
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-zinc-200">{children}</label>;
}
function Chip({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs">
      {children}
      {onRemove && <button onClick={onRemove} className="text-zinc-400 hover:text-zinc-200">✕</button>}
    </span>
  );
}
function SaveBar({ onSave, savedAt, saving }: { onSave: () => void; savedAt: string | null | undefined; saving: boolean }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs backdrop-blur">
      <Button variant="secondary" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save & Continue Later"}</Button>
      <span className="text-zinc-400">{savedAt ? `Last saved ${timeAgo(savedAt)}` : "Not saved yet"}</span>
    </div>
  );
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ───────────────────── Steps ───────────────────── */
function Welcome({ s, set, next }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void }) {
  return (
    <Card title="Welcome" hint="Configure Work operations for your business. Owners/HR build the structure; workers confirm role and ‘Have You…’ loops.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Business name</Label>
          <Input placeholder="e.g., Acme Group" value={s.businessName} onChange={(e) => set({ businessName: (e.target as HTMLInputElement).value })} />
        </div>
      </div>
      <Button onClick={next} disabled={!s.businessName}>Start</Button>
    </Card>
  );
}

function IdentityStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const [idk, setIdk] = useState<IdentityKey | null>(s.identity);
  const [fullName, setFullName] = useState(s.worker.fullName);
  const [email, setEmail] = useState(s.worker.email);
  const [phone, setPhone] = useState(s.worker.phone || "");
  const canContinue =
    idk === "OWNER" || idk === "HR" ? !!idk : !!idk && !!fullName && !!email;

  function commit() {
    set({
      identity: idk,
      worker: {
        ...s.worker,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      },
    });
    next();
  }

  return (
    <Card title="Who are you today?" hint="Your role determines what this wizard asks you to set up.">
      <div className="grid gap-3 sm:grid-cols-3">
        {(["OWNER", "HR", "WORKER"] as IdentityKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setIdk(k)}
            className={`rounded-xl border px-4 py-3 text-left transition ${idk === k ? "border-zinc-200 bg-zinc-100 text-zinc-950" : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}
          >
            <div className="text-sm font-semibold">{k}</div>
            <div className="text-xs text-zinc-400">
              {k === "OWNER" ? "Full structure setup"
                : k === "HR" ? "People, roles, escalations"
                : "Confirm your role & checklists"}
            </div>
          </button>
        ))}
      </div>

      {idk === "WORKER" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName((e.target as HTMLInputElement).value)} />
            </div>
            <div className="sm:col-span-1">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} placeholder="me@company.com" />
            </div>
            <div className="sm:col-span-1">
              <Label>Phone (optional)</Label>
              <Input value={phone} onChange={(e) => setPhone((e.target as HTMLInputElement).value)} />
            </div>
          </div>
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={commit} disabled={!canContinue}>Continue</Button>
      </Row>
    </Card>
  );
}

function ArchetypeStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const keys: ArchetypeKey[] = ["HOTEL", "MANUFACTURING", "SALON", "REPAIR", "CUSTOM"];
  function applyPack(key: ArchetypeKey) {
    const pack = PACKS[key];
    // Owner/HR seed; Worker can review only (still allowed to apply preset if blank)
    set({
      archetype: key,
      departments: key === "CUSTOM" ? s.departments : pack.departments,
      partners: key === "CUSTOM" ? s.partners : pack.partners,
      workItems: key === "CUSTOM" ? s.workItems : pack.workItems,
      checklists: key === "CUSTOM" ? s.checklists : pack.checklists,
    });
  }
  return (
    <Card title="Pick an archetype" hint="Seeds departments, partners, and work items. Edit anything; white-label all the way.">
      <div className="grid gap-3 sm:grid-cols-3">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => applyPack(k)}
            className={`rounded-xl border px-4 py-3 text-left transition ${s.archetype === k ? "border-zinc-200 bg-zinc-100 text-zinc-950" : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}
          >
            <div className="text-sm font-semibold">{k}</div>
            <div className="text-xs text-zinc-400">{k === "CUSTOM" ? "Start from blank" : "Preset"}</div>
          </button>
        ))}
      </div>
      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={!s.archetype}>Continue</Button>
      </Row>
    </Card>
  );
}

function DepartmentsStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const isEditor = s.identity === "OWNER" || s.identity === "HR";
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  function add() {
    if (!isEditor || !name.trim()) return;
    set({ departments: [...s.departments, { id: rid(), name: name.trim(), description: desc.trim() || undefined }] });
    setName(""); setDesc("");
  }
  function remove(id: string) {
    if (!isEditor) return;
    set({ departments: s.departments.filter((d) => d.id !== id) });
  }
  return (
    <Card title="Departments / Units" hint={isEditor ? "Add or edit units that handle operations." : "Review your organization’s departments."}>
      {isEditor && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} placeholder="e.g., Quality" />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input value={desc} onChange={(e) => setDesc((e.target as HTMLInputElement).value)} placeholder="What it does…" />
          </div>
        </div>
      )}
      {isEditor && <Button variant="secondary" onClick={add}>+ Add department</Button>}

      {s.departments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {s.departments.map((d) => (
            <Chip key={d.id} onRemove={isEditor ? () => remove(d.id) : undefined}>{d.name}</Chip>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={s.departments.length === 0}>Continue</Button>
      </Row>
    </Card>
  );
}

function PartnersStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const isEditor = s.identity === "OWNER" || s.identity === "HR";
  const [role, setRole] = useState("");
  const [contact, setContact] = useState("");
  const [dept, setDept] = useState<string>("");
  const [ext, setExt] = useState(false);

  function add() {
    if (!isEditor || !role.trim()) return;
    set({
      partners: [
        ...s.partners,
        { id: rid(), role: role.trim(), contact: contact.trim() || undefined, isExternal: ext, departmentId: dept || undefined },
      ],
    });
    setRole(""); setContact(""); setExt(false); setDept("");
  }
  function remove(id: string) {
    if (!isEditor) return;
    set({ partners: s.partners.filter((p) => p.id !== id) });
  }

  return (
    <Card title="Workflow Partners / Roles" hint={isEditor ? "Define roles, contacts, and which department each belongs to." : "Review who does what in your organization."}>
      {isEditor && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <Label>Role</Label>
              <Input value={role} onChange={(e) => setRole((e.target as HTMLInputElement).value)} placeholder="e.g., QA Inspector" />
            </div>
            <div>
              <Label>Contact (optional)</Label>
              <Input value={contact} onChange={(e) => setContact((e.target as HTMLInputElement).value)} placeholder="email/alias" />
            </div>
            <div>
              <Label>Department (optional)</Label>
              <select className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={dept} onChange={(e) => setDept((e.target as HTMLSelectElement).value)}>
                <option value="">—</option>
                {s.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ext} onChange={(e) => setExt(e.target.checked)} /> External partner
              </label>
              <Button variant="secondary" onClick={add}>+ Add</Button>
            </div>
          </div>
        </>
      )}

      {s.partners.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {s.partners.map((p) => (
            <Chip key={p.id} onRemove={isEditor ? () => remove(p.id) : undefined}>
              {p.role}{p.departmentId ? ` • ${deptName(s, p.departmentId)}` : ""}{p.isExternal ? " (external)" : ""}
            </Chip>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={s.partners.length === 0}>Continue</Button>
      </Row>
    </Card>
  );
}

function WorkerRoleStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  if (s.identity !== "WORKER") {
    // OWNER/HR see a read-only summary of worker prompt (useful when they guide a worker through onboarding)
    return (
      <Card title="Worker Role (preview)" hint="Workers confirm their personal details and accept the Have-You loops.">
        <p className="text-sm text-zinc-300">This step will appear for individual workers during their onboarding.</p>
        <Row>
          <Button variant="ghost" onClick={back}>Back</Button>
          <Button onClick={next}>Continue</Button>
        </Row>
      </Card>
    );
  }

  const [roleTitle, setRoleTitle] = useState(s.worker.roleTitle);
  const [dept, setDept] = useState<string>(s.worker.departmentId ?? "");
  const [acceptHY, setAcceptHY] = useState<boolean>(!!s.worker.willAcceptHaveYou);

  function commit() {
    set({ worker: { ...s.worker, roleTitle: roleTitle.trim(), departmentId: dept || undefined, willAcceptHaveYou: acceptHY } });
    next();
  }

  const canContinue = !!roleTitle;

  return (
    <Card title="Confirm your role" hint="This links you to your department and enables your daily Have-You prompts.">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Role title</Label>
          <Input value={roleTitle} onChange={(e) => setRoleTitle((e.target as HTMLInputElement).value)} placeholder="e.g., Technician" />
        </div>
        <div>
          <Label>Department</Label>
          <select className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={dept} onChange={(e) => setDept((e.target as HTMLSelectElement).value)}>
            <option value="">—</option>
            {s.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={acceptHY} onChange={(e) => setAcceptHY(e.target.checked)} /> Accept “Have You…” reminders
          </label>
        </div>
      </div>

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={commit} disabled={!canContinue}>Continue</Button>
      </Row>
    </Card>
  );
}

function WorkItemsStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const isEditor = s.identity === "OWNER" || s.identity === "HR";
  const [name, setName] = useState("");
  const [fieldsRaw, setFieldsRaw] = useState("");
  function add() {
    if (!isEditor || !name.trim()) return;
    const fields = fieldsRaw.split(",").map((x) => x.trim()).filter(Boolean);
    set({ workItems: [...s.workItems, { id: rid(), name: name.trim(), fields }] });
    setName(""); setFieldsRaw("");
  }
  function remove(id: string) {
    if (!isEditor) return;
    set({ workItems: s.workItems.filter((w) => w.id !== id) });
  }
  return (
    <Card title="Work Item Types" hint={isEditor ? "Define the request/order types that move through operations." : "Review what request types are used in your work."}>
      {isEditor && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} placeholder="e.g., Service Ticket" />
          </div>
          <div className="sm:col-span-2">
            <Label>Required fields (comma-separated)</Label>
            <Input value={fieldsRaw} onChange={(e) => setFieldsRaw((e.target as HTMLInputElement).value)} placeholder="e.g., Client, Issue, Priority" />
          </div>
        </div>
      )}
      {isEditor && <Button variant="secondary" onClick={add}>+ Add work item</Button>}

      {s.workItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {s.workItems.map((w) => (
            <Chip key={w.id} onRemove={isEditor ? () => remove(w.id) : undefined}>{w.name}</Chip>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={s.workItems.length === 0}>Continue</Button>
      </Row>
    </Card>
  );
}

function SLAStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const isEditor = s.identity === "OWNER" || s.identity === "HR";
  const [windowH, setWindowH] = useState<number>(s.sla.acceptanceWindowHours);
  const [escalate, setEscalate] = useState<string>(s.sla.escalationTo.join(", "));

  function commit() {
    if (!isEditor) { next(); return; }
    set({
      sla: {
        acceptanceWindowHours: Math.max(1, Number(windowH) || 24),
        escalationTo: escalate.split(",").map((x) => x.trim()).filter(Boolean),
      },
    });
    next();
  }

  return (
    <Card title="Acceptance SLA" hint={isEditor ? "Define how long partners have to accept, and who gets alerted if they don’t." : "Review the acceptance policy for your team."}>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Acceptance window (hours)</Label>
          <Input disabled={!isEditor} type="number" value={String(windowH)} onChange={(e) => setWindowH(Number((e.target as HTMLInputElement).value))} />
        </div>
        <div className="sm:col-span-2">
          <Label>Escalate to roles (comma-separated)</Label>
          <Input disabled={!isEditor} value={escalate} onChange={(e) => setEscalate((e.target as HTMLInputElement).value)} placeholder="e.g., Manager, Duty Lead" />
        </div>
      </div>
      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={commit}>Continue</Button>
      </Row>
    </Card>
  );
}

function ChecklistsStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const isEditor = s.identity === "OWNER" || s.identity === "HR";
  const [selectedWork, setSelectedWork] = useState<string>(s.workItems[0]?.id ?? "");
  const [title, setTitle] = useState("Execution Steps");
  const [itemsRaw, setItemsRaw] = useState("");

  function add() {
    if (!isEditor || !selectedWork) return;
    const items = itemsRaw.split("\n").map((x) => x.trim()).filter(Boolean);
    if (items.length === 0) return;
    const tpl: ChecklistTemplate = { workItemId: selectedWork, title: title.trim() || "Execution Steps", items };
    set({ checklists: [...s.checklists, tpl] });
    setItemsRaw("");
  }

  function remove(idx: number) {
    if (!isEditor) return;
    const cp = [...s.checklists];
    cp.splice(idx, 1);
    set({ checklists: cp });
  }

  return (
    <Card title="Execution Checklists" hint={isEditor ? "Define step-by-step instructions per work item." : "Review the steps required for your work items."}>
      {isEditor && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Work item</Label>
            <select
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              value={selectedWork}
              onChange={(e) => setSelectedWork((e.target as HTMLSelectElement).value)}
            >
              <option value="">Select…</option>
              {s.workItems.map((w) => (
                <option value={w.id} key={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Checklist title</Label>
            <Input value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} />
          </div>
        </div>
      )}

      {isEditor && (
        <div>
          <Label>Checklist items (one per line)</Label>
          <Textarea value={itemsRaw} onChange={(e) => setItemsRaw((e.target as HTMLTextAreaElement).value)} placeholder="Step 1&#10;Step 2&#10;Step 3" />
        </div>
      )}

      {isEditor && <Button variant="secondary" onClick={add} disabled={!selectedWork}>+ Add checklist</Button>}

      {s.checklists.length > 0 && (
        <div className="space-y-3">
          {s.checklists.map((tpl, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="mb-1 text-sm font-semibold">{tpl.title} <span className="text-zinc-400">• {wiName(s, tpl.workItemId)}</span></div>
              <ul className="list-disc pl-5 text-sm text-zinc-300">
                {tpl.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
              {isEditor && <div className="mt-2"><Button variant="danger" onClick={() => remove(i)}>Remove</Button></div>}
            </div>
          ))}
        </div>
      )}

      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={next} disabled={s.checklists.length === 0}>Continue</Button>
      </Row>
    </Card>
  );
}

function QAReportStep({ s, set, next, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; next: () => void; back: () => void }) {
  const isEditor = s.identity === "OWNER" || s.identity === "HR";
  const [role, setRole] = useState(s.qa.reviewerRole);
  const [reqPhoto, setReqPhoto] = useState(!!s.qa.requirePhoto);
  const [reqSign, setReqSign] = useState(!!s.qa.requireSignature);
  const [tags, setTags] = useState(s.reporting.tags.join(", "));
  const [toObari, setToObari] = useState(!!s.reporting.pushToObari);
  const [toFin, setToFin] = useState(!!s.reporting.pushToFinance);

  function commit() {
    if (!isEditor) { next(); return; }
    set({
      qa: { reviewerRole: role.trim() || "Manager", requirePhoto: reqPhoto, requireSignature: reqSign },
      reporting: { pushToObari: toObari, pushToFinance: toFin, tags: tags.split(",").map((x) => x.trim()).filter(Boolean) },
    });
    next();
  }

  return (
    <Card title="QA & Reporting" hint={isEditor ? "Define who signs off and where data flows." : "Review QA reviewer and reporting flows."}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>QA reviewer role</Label>
          <Input disabled={!isEditor} value={role} onChange={(e) => setRole((e.target as HTMLInputElement).value)} />
          <div className="mt-2 text-sm">
            <label className="mr-4 inline-flex items-center gap-2"><input disabled={!isEditor} type="checkbox" checked={reqPhoto} onChange={(e) => setReqPhoto(e.target.checked)} /> Require photo</label>
            <label className="inline-flex items-center gap-2"><input disabled={!isEditor} type="checkbox" checked={reqSign} onChange={(e) => setReqSign(e.target.checked)} /> Require signature</label>
          </div>
        </div>
        <div>
          <Label>Dashboard tags (comma-separated)</Label>
          <Input disabled={!isEditor} value={tags} onChange={(e) => setTags((e.target as HTMLInputElement).value)} placeholder="e.g., Operations, Field, VIP" />
          <div className="mt-2 text-sm">
            <label className="mr-4 inline-flex items-center gap-2"><input disabled={!isEditor} type="checkbox" checked={toObari} onChange={(e) => setToObari(e.target.checked)} /> Push to OBARI</label>
            <label className="inline-flex items-center gap-2"><input disabled={!isEditor} type="checkbox" checked={toFin} onChange={(e) => setToFin(e.target.checked)} /> Push to Finance</label>
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

function BlueprintStep({ s, set, finish, back }: { s: OpsState; set: (p: Partial<OpsState>) => void; finish: () => void; back: () => void }) {
  const blueprint = useMemo(() => makeBlueprint(s), [s]);
  useEffect(() => {
    set({ blueprintJson: JSON.stringify(blueprint, null, 2) });
  }, [blueprint, set]);

  async function exportJson() {
    const blob = new Blob([s.blueprintJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${s.businessName || "operations"}-blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function seedApis() {
    // Seed partners (Owner/HR only)
    if (s.identity === "OWNER" || s.identity === "HR") {
      try {
        await fetch("/api/ship/work/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bulkUpsert", items: s.partners }),
        });
      } catch {}
      try {
        await fetch("/api/ship/work/operations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "seedFromBlueprint", blueprint }),
        });
      } catch {}
    }
  }

  return (
    <Card title="Workflow Blueprint" hint="This JSON defines your operations matrix. Save it and scaffold tasks.">
      <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{s.blueprintJson}</pre>
      <Row>
        <Button variant="secondary" onClick={exportJson}>Download JSON</Button>
        {(s.identity === "OWNER" || s.identity === "HR") && (
          <Button variant="secondary" onClick={seedApis}>Seed APIs</Button>
        )}
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={finish} disabled={!s.blueprintJson}>Confirm & Generate</Button>
      </Row>
    </Card>
  );
}

function Success({ identity }: { identity: IdentityKey | null }) {
  return (
    <Card title="All set 🎉" hint="Your Work operations blueprint is ready.">
      <p className="text-sm text-zinc-300">
        {identity === "WORKER"
          ? "You’re linked to your department, role, and Have-You prompts. Watch your WorkFocus for today’s tasks."
          : "Use this to seed OBARI task bins, role routing, and dashboards. Workers can now onboard to their roles."}
      </p>
    </Card>
  );
}

/* ───────────────────── Page ───────────────────── */
export default function OperationsOnboardingWizardPage() {
  const [s, setS] = useState<OpsState>(initialState);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<OpsState | null>(null);

  useEffect(() => {
    const d = loadLocal();
    if (d) setResume(d);
  }, []);

  function set(p: Partial<OpsState>) { setS((x) => ({ ...x, ...p })); }
  function go(step: StepKey) { set({ step }); }
  function save() { setSaving(true); const when = saveLocal(s); set({ savedAt: when }); setTimeout(() => setSaving(false), 300); }
  function resumeDraft() { if (!resume) return; setS(resume); setResume(null); }
  function discardDraft() { clearLocal(); setResume(null); }

  function finish() {
    // In real use: also write Have-You items for worker/HR/owner contexts here.
    clearLocal();
    go("SUCCESS");
  }

  const headerRight = (
    <div className="flex items-center gap-2 text-xs">
      <Badge ok={!!s.businessName} label="Business" />
      <Badge ok={!!s.identity} label="Identity" />
      <Badge ok={!!s.archetype} label="Archetype" />
      <Badge ok={s.departments.length > 0} label="Departments" />
      <Badge ok={s.partners.length > 0} label="Partners" />
      <Badge ok={s.workItems.length > 0} label="Work Items" />
      <Badge ok={s.checklists.length > 0} label="Checklists" />
      <Badge ok={!!s.qa.reviewerRole} label="QA" />
    </div>
  );

  // Step flow:
  // WELCOME → IDENTITY → ARCHETYPE → DEPARTMENTS → PARTNERS → (WORKER_ROLE if identity=WORKER) → WORK_ITEMS → SLA → CHECKLISTS → QA_REPORT → BLUEPRINT → SUCCESS
  return (
    <Shell headerRight={headerRight}>
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

      {s.step === "WELCOME" && <Welcome s={s} set={set} next={() => go("IDENTITY")} />}

      {s.step === "IDENTITY" && <IdentityStep s={s} set={set} next={() => go("ARCHETYPE")} back={() => go("WELCOME")} />}

      {s.step === "ARCHETYPE" && <ArchetypeStep s={s} set={set} next={() => go("DEPARTMENTS")} back={() => go("IDENTITY")} />}

      {s.step === "DEPARTMENTS" && <DepartmentsStep s={s} set={set} next={() => go("PARTNERS")} back={() => go("ARCHETYPE")} />}

      {s.step === "PARTNERS" && <PartnersStep s={s} set={set} next={() => go("WORKER_ROLE")} back={() => go("DEPARTMENTS")} />}

      {s.step === "WORKER_ROLE" &&
        <WorkerRoleStep s={s} set={set}
          next={() => go("WORK_ITEMS")}
          back={() => go("PARTNERS")}
        />}

      {s.step === "WORK_ITEMS" && <WorkItemsStep s={s} set={set} next={() => go("SLA")} back={() => go("WORKER_ROLE")} />}

      {s.step === "SLA" && <SLAStep s={s} set={set} next={() => go("CHECKLISTS")} back={() => go("WORK_ITEMS")} />}

      {s.step === "CHECKLISTS" && <ChecklistsStep s={s} set={set} next={() => go("QA_REPORT")} back={() => go("SLA")} />}

      {s.step === "QA_REPORT" && <QAReportStep s={s} set={set} next={() => go("BLUEPRINT")} back={() => go("CHECKLISTS")} />}

      {s.step === "BLUEPRINT" && <BlueprintStep s={s} set={set} finish={finish} back={() => go("QA_REPORT")} />}

      {s.step === "SUCCESS" && <Success identity={s.identity} />}

      {s.step !== "SUCCESS" && <SaveBar onSave={save} savedAt={s.savedAt} saving={saving} />}
    </Shell>
  );
}

/* ───────────────────── Helpers ───────────────────── */
function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${ok ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />
      {label}
    </span>
  );
}
function wiName(s: OpsState, id: string) {
  return s.workItems.find((w) => w.id === id)?.name ?? id;
}
function deptName(s: OpsState, id: string) {
  return s.departments.find((d) => d.id === id)?.name ?? id;
}
function makeBlueprint(s: OpsState) {
  // A normalized, engine-friendly structure used by OBARI/Finance scaffolding
  return {
    scope: "WORK",
    business: s.businessName,
    identity: s.identity, // OWNER | HR | WORKER (for audit)
    worker: s.identity === "WORKER" ? {
      fullName: s.worker.fullName,
      email: s.worker.email,
      phone: s.worker.phone,
      roleTitle: s.worker.roleTitle,
      departmentId: s.worker.departmentId,
      willAcceptHaveYou: s.worker.willAcceptHaveYou,
    } : undefined,
    archetype: s.archetype,
    departments: s.departments.map(({ id, name, description }) => ({ id, name, description })),
    partners: s.partners.map(({ id, role, contact, isExternal, departmentId }) => ({ id, role, contact, isExternal, departmentId })),
    workItems: s.workItems.map(({ id, name, fields }) => ({ id, name, fields })),
    policies: {
      sla: s.sla,
      qa: s.qa,
      reporting: s.reporting,
    },
    checklists: s.checklists,
    routes: {
      // generic lifecycle routing usable by OBARI:
      start: "REQUEST_INTAKE",
      flow: [
        { id: "REQUEST_INTAKE", next: "ASSIGNMENT" },
        { id: "ASSIGNMENT", next: "ACCEPTANCE" },
        { id: "ACCEPTANCE", next: "EXECUTION" },
        { id: "EXECUTION", next: "QA" },
        { id: "QA", next: "REPORT" },
        { id: "REPORT", next: "DONE" },
      ],
      // role mapping (for notifications/escalation)
      roles: {
        escalateTo: s.sla.escalationTo,
        reviewer: s.qa.reviewerRole,
      },
    },
    tags: s.reporting.tags,
    generatedAt: new Date().toISOString(),
    version: 1,
  };
}