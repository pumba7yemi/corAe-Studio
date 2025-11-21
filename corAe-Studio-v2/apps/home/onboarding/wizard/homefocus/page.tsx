// apps/studio/app/home/onboarding/wizard/homefocus/page.tsx
"use client";

/**
 * corAe â€¢ Home â€¢ Onboarding â€¢ HomeFocusâ„¢ Wizard
 * White-label, Owner/Resident aware. Saves progress locally. Seeds /api/home endpoints.
 *
 * Flow:
 *   WELCOME â†’ IDENTITY â†’ HOUSEHOLD â†’ SPACES â†’ ROUTINES â†’ REMINDERS â†’ NOTIFICATIONS â†’ BLUEPRINT â†’ SUCCESS
 */

import React, { useEffect, useMemo, useState } from "react";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type Step =
  | "WELCOME" | "IDENTITY" | "HOUSEHOLD" | "SPACES"
  | "ROUTINES" | "REMINDERS" | "FAITH" | "NOTIFICATIONS" | "SECURITY" | "ENERGY" | "MAINTENANCE" | "GUESTS" | "BLUEPRINT" | "SUCCESS";

type IdentityKey = "OWNER" | "RESIDENT";

type RoutineFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

interface HouseholdMember {
  id: string;
  name: string;
  relation?: string; // spouse, child, parent, flatmate
}

interface Space {
  id: string;
  name: string; // Kitchen, Bedroom 1, Laundry, Study
}

interface Routine {
  id: string;
  title: string;          // "Morning Reset", "Laundry", "Weekly Budget Review"
  frequency: RoutineFrequency;
  when?: string;          // "07:00", "Sat 10:00"
  spaceId?: string;
  checklist: string[];    // ordered steps
}

interface Reminder {
  id: string;
  text: string;           // Have-You prompt text
  schedule: string;       // cron-ish "0 7 * * *" or simple "07:00 DAILY"
}

interface SecuritySetting {
  id: string;
  name: string;
  enabled: boolean;
  note?: string;
}
interface EnergyPref {
  id: string;
  name: string;
  targetKwh?: number;
  note?: string;
}
interface MaintenanceTask {
  id: string;
  title: string;
  schedule?: string;
  done?: boolean;
}
interface Guest {
  id: string;
  name: string;
  accessLevel?: "FULL" | "LIMITED" | "GUEST";
}

interface FaithPractice {
  id: string;
  title: string;
  cadence?: string; // e.g., Daily, Weekly
  note?: string;
}

interface NotificationPrefs {
  viaCIMS: boolean;
  viaEmail: boolean;
  viaPush: boolean;
  quietHours?: { from: string; to: string }; // "22:00" â†’ "07:00"
}

interface HomeState {
  step: Step;
  homeName: string;               // e.g., "The Smith Household"
  identity: IdentityKey | null;

  members: HouseholdMember[];
  spaces: Space[];
  routines: Routine[];
  reminders: Reminder[];
  notify: NotificationPrefs;

  // additional sections
  securitySettings?: SecuritySetting[];
  energyPreferences?: EnergyPref[];
  maintenance?: MaintenanceTask[];
  guests?: Guest[];
  faiths?: FaithPractice[];

  blueprintJson: string;
  savedAt?: string | null;
}

const LOCAL_KEY = "corAeHomeWizard/homefocus";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Defaults â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const initial: HomeState = {
  step: "WELCOME",
  homeName: "",
  identity: null,
  members: [],
  spaces: [],
  routines: [],
  reminders: [],
  notify: { viaCIMS: true, viaEmail: false, viaPush: true, quietHours: { from: "22:00", to: "07:00" } },
  // defaults for new sections
  securitySettings: [],
  energyPreferences: [],
  maintenance: [],
  guests: [],
  faiths: [],
  blueprintJson: "",
  savedAt: null,
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Util â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function rid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) { /* @ts-ignore */ return crypto.randomUUID(); }
  return "id_" + Math.random().toString(36).slice(2, 10);
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
function saveLocal(s: HomeState) {
  const payload = { ...s, savedAt: new Date().toISOString() };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  return payload.savedAt!;
}
function loadLocal(): HomeState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HomeState;
  } catch { return null; }
}
function clearLocal() {
  localStorage.removeItem(LOCAL_KEY);
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ UI atoms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Shell({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-3 pt-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Home Onboarding â€¢ HomeFocusâ„¢</h1>
          <p className="text-xs text-zinc-400">Set your household, spaces, routines and Have-You prompts.</p>
        </div>
        {right}
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
function Chip({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs">
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
function Welcome({ s, set, next }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void }) {
  return (
    <Card title="Welcome" hint="Letâ€™s set up your HomeFocusâ„¢ so corAe can buy back your time.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-200">Home / Household name</label>
          <Input placeholder="e.g., The Adamson Household" value={s.homeName} onChange={(e) => set({ homeName: (e.target as HTMLInputElement).value })} />
        </div>
      </div>
      <Button onClick={next} disabled={!s.homeName}>Start</Button>
    </Card>
  );
}
function Identity({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const [idk, setIdk] = useState<IdentityKey | null>(s.identity);
  return (
    <Card title="Who are you?" hint="Owner sets structure; Residents confirm routines and reminders.">
      <div className="grid gap-3 sm:grid-cols-2">
        {(["OWNER","RESIDENT"] as IdentityKey[]).map(k => (
          <button key={k} onClick={() => setIdk(k)}
            className={`rounded-xl border px-4 py-3 text-left transition ${idk===k?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>
            <div className="text-sm font-semibold">{k}</div>
            <div className="text-xs text-zinc-400">
              {k==="OWNER"?"Create household, spaces & base routines":"Confirm personal reminders & quiet hours"}
            </div>
          </button>
        ))}
      </div>
      <Row>
        <Button variant="ghost" onClick={back}>Back</Button>
        <Button onClick={() => { set({ identity: idk }); next(); }} disabled={!idk}>Continue</Button>
      </Row>
    </Card>
  );
}
function Household({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [name, setName] = useState(""); const [rel, setRel] = useState("");
  function add() { if (!isOwner || !name.trim()) return; set({ members: [...s.members, { id: rid(), name: name.trim(), relation: rel.trim() || undefined }] }); setName(""); setRel(""); }
  function remove(id: string) { if (!isOwner) return; set({ members: s.members.filter(m => m.id !== id) }); }
  return (
    <Card title="Household Members" hint={isOwner ? "Add household members to tailor routines and reminders." : "Review your household."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input placeholder="Relation (optional)" value={rel} onChange={(e)=>setRel(e.target.value)} />
          <Button variant="secondary" onClick={add}>+ Add</Button>
        </div>
      )}
      {s.members.length>0 && (
        <div className="flex flex-wrap gap-2">
          {s.members.map(m => <Chip key={m.id} onRemove={isOwner?()=>remove(m.id):undefined}>{m.name}{m.relation?` â€¢ ${m.relation}`:""}</Chip>)}
        </div>
      )}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function SpacesStep({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [name, setName] = useState("");
  function add(){ if(!isOwner||!name.trim())return; set({ spaces:[...s.spaces,{id:rid(), name:name.trim()}]}); setName(""); }
  function remove(id:string){ if(!isOwner)return; set({ spaces: s.spaces.filter(x=>x.id!==id) }); }
  return (
    <Card title="Spaces / Areas" hint={isOwner ? "Define the places where routines run." : "Review your home spaces."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="e.g., Kitchen" value={name} onChange={(e)=>setName(e.target.value)} />
          <div className="sm:col-span-2"><Button variant="secondary" onClick={add}>+ Add space</Button></div>
        </div>
      )}
      {s.spaces.length>0 && <div className="flex flex-wrap gap-2">{s.spaces.map(a => <Chip key={a.id} onRemove={isOwner?()=>remove(a.id):undefined}>{a.name}</Chip>)}</div>}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function Routines({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [title,setTitle]=useState(""); const [freq,setFreq]=useState<RoutineFrequency>("DAILY");
  const [when,setWhen]=useState(""); const [space,setSpace]=useState<string>("");
  const [itemsRaw,setItemsRaw]=useState("");
  function add(){
    if(!isOwner||!title.trim())return;
    set({ routines: [...s.routines, { id: rid(), title: title.trim(), frequency: freq, when: when.trim()||undefined, spaceId: space||undefined, checklist: itemsRaw.split("\n").map(x=>x.trim()).filter(Boolean)}]});
    setTitle(""); setWhen(""); setSpace(""); setItemsRaw("");
  }
  function remove(id:string){ if(!isOwner)return; set({ routines: s.routines.filter(r=>r.id!==id) }); }
  return (
    <Card title="Routines" hint={isOwner ? "Create daily/weekly/monthly routines with checklists." : "Review the routines assigned to you."}>
      {isOwner && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Input placeholder="Title (e.g., Morning Reset)" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={freq} onChange={(e)=>setFreq(e.target.value as RoutineFrequency)}>
              <option value="DAILY">DAILY</option><option value="WEEKLY">WEEKLY</option><option value="MONTHLY">MONTHLY</option>
            </select>
            <Input placeholder='When (e.g., "07:00" or "Sat 10:00")' value={when} onChange={(e)=>setWhen(e.target.value)} />
            <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={space} onChange={(e)=>setSpace(e.target.value)}>
              <option value="">â€” space â€”</option>
              {s.spaces.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-200">Checklist (one per line)</label>
            <Textarea value={itemsRaw} onChange={(e)=>setItemsRaw(e.target.value)} placeholder="Step 1&#10;Step 2&#10;Step 3" />
          </div>
          <Button variant="secondary" onClick={add}>+ Add routine</Button>
        </>
      )}
      {s.routines.length>0 && (
        <div className="space-y-3">
          {s.routines.map(r => (
            <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="mb-1 text-sm font-semibold">{r.title}
                <span className="text-zinc-400"> â€¢ {r.frequency}{r.when?` @ ${r.when}`:""}{r.spaceId?` â€¢ ${s.spaces.find(sp=>sp.id===r.spaceId)?.name}`:""}</span>
              </div>
              {r.checklist.length>0 && <ul className="list-disc pl-5 text-sm text-zinc-300">{r.checklist.map((it,i)=><li key={i}>{it}</li>)}</ul>}
              {isOwner && <div className="mt-2"><Button variant="danger" onClick={()=>remove(r.id)}>Remove</Button></div>}
            </div>
          ))}
        </div>
      )}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function Reminders({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [text,setText]=useState(""); const [schedule,setSchedule]=useState(""); // e.g., "07:00 DAILY"
  function add(){ if(!isOwner||!text.trim()||!schedule.trim())return; set({ reminders:[...s.reminders,{id:rid(), text:text.trim(), schedule:schedule.trim()}]}); setText(""); setSchedule(""); }
  function remove(id:string){ if(!isOwner)return; set({ reminders: s.reminders.filter(x=>x.id!==id) }); }
  return (
    <Card title="Have-You Reminders" hint={isOwner ? "Define your prompts. These feed the Have-You Engineâ„¢ & Pulse." : "Review the prompts that will appear to you."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder='Reminder text (e.g., "Have you planned todayâ€™s meals?")' value={text} onChange={(e)=>setText(e.target.value)} />
          <Input placeholder='Schedule (e.g., "07:00 DAILY")' value={schedule} onChange={(e)=>setSchedule(e.target.value)} />
          <Button variant="secondary" onClick={add}>+ Add</Button>
        </div>
      )}
      {s.reminders.length>0 && (
        <div className="flex flex-wrap gap-2">
          {s.reminders.map(r => <Chip key={r.id} onRemove={isOwner?()=>remove(r.id):undefined}>{r.text} â€¢ {r.schedule}</Chip>)}
        </div>
      )}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function Notifications({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const [viaCIMS, setCIMS] = useState(!!s.notify.viaCIMS);
  const [viaEmail, setEmail] = useState(!!s.notify.viaEmail);
  const [viaPush, setPush] = useState(!!s.notify.viaPush);
  const [qhFrom, setQFrom] = useState(s.notify.quietHours?.from ?? "22:00");
  const [qhTo, setQTo] = useState(s.notify.quietHours?.to ?? "07:00");
  function commit(){
    set({ notify: { viaCIMS, viaEmail, viaPush, quietHours: { from: qhFrom, to: qhTo } } });
    next();
  }
  return (
    <Card title="Notification Settings" hint="Where and when you want to be nudged.">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={viaCIMS} onChange={(e)=>setCIMS(e.target.checked)} /> CIMS</label>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={viaEmail} onChange={(e)=>setEmail(e.target.checked)} /> Email</label>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={viaPush} onChange={(e)=>setPush(e.target.checked)} /> Push</label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-200">Quiet hours â€” From</label>
          <Input value={qhFrom} onChange={(e)=>setQFrom(e.target.value)} placeholder="22:00" />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-200">Quiet hours â€” To</label>
          <Input value={qhTo} onChange={(e)=>setQTo(e.target.value)} placeholder="07:00" />
        </div>
      </div>
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={commit}>Continue</Button></Row>
    </Card>
  );
}
function SecurityStep({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [name, setName] = useState(""); const [note, setNote] = useState(""); const [enabled, setEnabled] = useState(true);
  function add(){ if(!isOwner||!name.trim())return; set({ securitySettings: [...(s.securitySettings||[]), { id: rid(), name: name.trim(), enabled, note: note.trim()||undefined }] }); setName(""); setNote(""); setEnabled(true); }
  function remove(id:string){ if(!isOwner)return; set({ securitySettings: (s.securitySettings||[]).filter(x=>x.id!==id) }); }
  return (
    <Card title="Security & Access" hint={isOwner?"Configure locks, cameras, and access rules." : "View security settings."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Device / Rule name (e.g., Front Door Lock)" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input placeholder="Note (optional)" value={note} onChange={(e)=>setNote(e.target.value)} />
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} /> Enabled</label>
          <div><Button variant="secondary" onClick={add}>+ Add</Button></div>
        </div>
      )}
      {(s.securitySettings||[]).length>0 && <div className="flex flex-wrap gap-2 mt-3">{(s.securitySettings||[]).map(ss=> <Chip key={ss.id} onRemove={isOwner?()=>remove(ss.id):undefined}>{ss.name}{ss.note?` â€¢ ${ss.note}`:''}{!ss.enabled?` â€¢ disabled`:''}</Chip>)}</div>}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function EnergyStep({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [name, setName] = useState(""); const [target, setTarget] = useState<number|"">(""); const [note, setNote] = useState("");
  function add(){ if(!isOwner||!name.trim())return; set({ energyPreferences: [...(s.energyPreferences||[]), { id: rid(), name: name.trim(), targetKwh: typeof target==="number"?target:undefined, note: note.trim()||undefined }] }); setName(""); setTarget(""); setNote(""); }
  function remove(id:string){ if(!isOwner)return; set({ energyPreferences: (s.energyPreferences||[]).filter(x=>x.id!==id) }); }
  return (
    <Card title="Energy & Efficiency" hint={isOwner?"Track targets and preferences for energy usage." : "View energy preferences."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Label (e.g., Monthly kWh target)" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input placeholder="Target kWh (optional)" value={target as any} onChange={(e)=>setTarget(e.target.value?Number(e.target.value):"")} />
          <Input placeholder="Note (optional)" value={note} onChange={(e)=>setNote(e.target.value)} />
          <div><Button variant="secondary" onClick={add}>+ Add</Button></div>
        </div>
      )}
      {(s.energyPreferences||[]).length>0 && <div className="flex flex-wrap gap-2 mt-3">{(s.energyPreferences||[]).map(ep=> <Chip key={ep.id} onRemove={isOwner?()=>remove(ep.id):undefined}>{ep.name}{ep.targetKwh?` â€¢ ${ep.targetKwh} kWh`:''}{ep.note?` â€¢ ${ep.note}`:''}</Chip>)}</div>}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function MaintenanceStep({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [title, setTitle] = useState(""); const [schedule, setSchedule] = useState("");
  function add(){ if(!isOwner||!title.trim())return; set({ maintenance: [...(s.maintenance||[]), { id: rid(), title: title.trim(), schedule: schedule.trim()||undefined, done: false }] }); setTitle(""); setSchedule(""); }
  function remove(id:string){ if(!isOwner)return; set({ maintenance: (s.maintenance||[]).filter(x=>x.id!==id) }); }
  return (
    <Card title="Maintenance" hint={isOwner?"Track recurring maintenance tasks (e.g., change filter, service AC)." : "View maintenance tasks."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Task title (e.g., Change HVAC filter)" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <Input placeholder="Schedule (e.g., Monthly)" value={schedule} onChange={(e)=>setSchedule(e.target.value)} />
          <div><Button variant="secondary" onClick={add}>+ Add</Button></div>
        </div>
      )}
      {(s.maintenance||[]).length>0 && <div className="space-y-2 mt-3">{(s.maintenance||[]).map(m=> <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"><div className="text-sm font-semibold">{m.title}<span className="text-zinc-400">{m.schedule?` â€¢ ${m.schedule}`:''}</span></div>{isOwner && <div className="mt-2"><Button variant="danger" onClick={()=>remove(m.id)}>Remove</Button></div>}</div>)}</div>}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function GuestsStep({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [name, setName] = useState(""); const [level, setLevel] = useState<Guest["accessLevel"]>("GUEST");
  function add(){ if(!isOwner||!name.trim())return; set({ guests: [...(s.guests||[]), { id: rid(), name: name.trim(), accessLevel: level }] }); setName(""); setLevel("GUEST"); }
  function remove(id:string){ if(!isOwner)return; set({ guests: (s.guests||[]).filter(x=>x.id!==id) }); }
  return (
    <Card title="Guests & Access" hint={isOwner?"Manage guest accounts and temporary access rights." : "View guest access."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Guest name" value={name} onChange={(e)=>setName(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={level} onChange={(e)=>setLevel(e.target.value as any)}>
            <option value="FULL">FULL</option><option value="LIMITED">LIMITED</option><option value="GUEST">GUEST</option>
          </select>
          <div><Button variant="secondary" onClick={add}>+ Add</Button></div>
        </div>
      )}
      {(s.guests||[]).length>0 && <div className="flex flex-wrap gap-2 mt-3">{(s.guests||[]).map(g=> <Chip key={g.id} onRemove={isOwner?()=>remove(g.id):undefined}>{g.name} â€¢ {g.accessLevel}</Chip>)}</div>}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
function Blueprint({ s, set, finish, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; finish: () => void; back: () => void }) {
  const blueprint = useMemo(() => makeBlueprint(s), [s]);
  useEffect(() => { set({ blueprintJson: JSON.stringify(blueprint, null, 2) }); }, [blueprint, set]);

  async function seedApis() {
    try {
      await fetch("/api/home/routines", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seedFromBlueprint", blueprint }),
      });
    } catch {}
    try {
      await fetch("/api/home/haveyou", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkUpsert", items: s.reminders }),
      });
    } catch {}
  }

  function download() {
    const blob = new Blob([s.blueprintJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${s.homeName || "homefocus"}-blueprint.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card title="HomeFocusâ„¢ Blueprint" hint="This JSON seeds Home routines, Have-You prompts, and notification rails.">
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
    <Card title="HomeFocusâ„¢ Ready ðŸŽ‰" hint="Your daily and weekly flows are now structured.">
      <p className="text-sm text-zinc-300">Youâ€™ll start receiving Have-You prompts and routine nudges per your notification settings.</p>
    </Card>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function HomeFocusWizardPage() {
  const [s, setS] = useState<HomeState>(initial);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<HomeState | null>(null);

  useEffect(()=>{ const d=loadLocal(); if(d) setResume(d); }, []);
  function set(p: Partial<HomeState>){ setS(x=>({ ...x, ...p })); }
  function go(step: Step){ set({ step }); }
  function save(){ setSaving(true); const when = saveLocal(s); set({ savedAt: when }); setTimeout(()=>setSaving(false), 300); }
  function resumeDraft(){ if(!resume) return; setS(resume); setResume(null); }
  function discardDraft(){ clearLocal(); setResume(null); }
  function finish(){ clearLocal(); go("SUCCESS"); }

  const headerRight = (
    <div className="flex items-center gap-2 text-xs">
      <Badge ok={!!s.homeName} label="Home" />
      <Badge ok={!!s.identity} label="Identity" />
      <Badge ok={s.members.length>0} label="Members" />
      <Badge ok={s.spaces.length>0} label="Spaces" />
      <Badge ok={s.routines.length>0} label="Routines" />
      <Badge ok={s.reminders.length>0} label="Reminders" />
      <Badge ok={(s.faiths?.length||0)>0} label="Faith" />
      <Badge ok={(s.securitySettings?.length||0)>0} label="Security" />
      <Badge ok={(s.energyPreferences?.length||0)>0} label="Energy" />
      <Badge ok={(s.maintenance?.length||0)>0} label="Maintenance" />
      <Badge ok={(s.guests?.length||0)>0} label="Guests" />
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

      {s.step==="WELCOME" && <Welcome s={s} set={set} next={()=>go("IDENTITY")} />}
      {s.step==="IDENTITY" && <Identity s={s} set={set} next={()=>go("HOUSEHOLD")} back={()=>go("WELCOME")} />}
      {s.step==="HOUSEHOLD" && <Household s={s} set={set} next={()=>go("SPACES")} back={()=>go("IDENTITY")} />}
      {s.step==="SPACES" && <SpacesStep s={s} set={set} next={()=>go("ROUTINES")} back={()=>go("HOUSEHOLD")} />}
      {s.step==="ROUTINES" && <Routines s={s} set={set} next={()=>go("REMINDERS")} back={()=>go("SPACES")} />}
    {s.step==="REMINDERS" && <Reminders s={s} set={set} next={()=>go("FAITH")} back={()=>go("ROUTINES")} />}
  {s.step==="FAITH" && <Faith s={s} set={set} next={()=>go("NOTIFICATIONS")} back={()=>go("REMINDERS")} />}
  {s.step==="NOTIFICATIONS" && <Notifications s={s} set={set} next={()=>go("SECURITY")} back={()=>go("FAITH")} />}
  {s.step==="SECURITY" && <SecurityStep s={s} set={set} next={()=>go("ENERGY")} back={()=>go("NOTIFICATIONS")} />}
  {s.step==="ENERGY" && <EnergyStep s={s} set={set} next={()=>go("MAINTENANCE")} back={()=>go("SECURITY")} />}
  {s.step==="MAINTENANCE" && <MaintenanceStep s={s} set={set} next={()=>go("GUESTS")} back={()=>go("ENERGY")} />}
  {s.step==="GUESTS" && <GuestsStep s={s} set={set} next={()=>go("BLUEPRINT")} back={()=>go("MAINTENANCE")} />}
  {s.step==="BLUEPRINT" && <Blueprint s={s} set={set} finish={finish} back={()=>go("GUESTS")} />}
      {s.step==="SUCCESS" && <Success />}

      {s.step!=="SUCCESS" && <SaveBar onSave={save} savedAt={s.savedAt} saving={saving} />}
    </Shell>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function makeBlueprint(s: HomeState) {
  return {
    scope: "HOME",
    home: s.homeName,
    identity: s.identity, // OWNER | RESIDENT
    members: s.members,
    spaces: s.spaces,
    routines: s.routines.map(r => ({ id:r.id, title:r.title, frequency:r.frequency, when:r.when, spaceId:r.spaceId, checklist:r.checklist })),
    reminders: s.reminders,
    faiths: s.faiths || [],
    notifications: s.notify,
    routes: [
      { id: "PLAN", next: "DO" }, { id: "DO", next: "REVIEW" }, { id: "REVIEW", next: "DONE" }
    ],
    generatedAt: new Date().toISOString(),
    version: 1,
  };
}
function Faith({ s, set, next, back }: { s: HomeState; set: (p: Partial<HomeState>) => void; next: () => void; back: () => void }) {
  const isOwner = s.identity === "OWNER";
  const [title, setTitle] = useState("");
  const [cadence, setCadence] = useState("");
  const [note, setNote] = useState("");
  function add() {
    if (!isOwner || !title.trim()) return;
    set({ faiths: [...(s.faiths || []), { id: rid(), title: title.trim(), cadence: cadence.trim() || undefined, note: note.trim() || undefined }] });
    setTitle(""); setCadence(""); setNote("");
  }
  function remove(id: string) { if (!isOwner) return; set({ faiths: (s.faiths || []).filter(f => f.id !== id) }); }

  return (
    <Card title="Faith & Practices" hint={isOwner ? "Record services, devotions, or spiritual rhythms." : "View your household's faith practices."}>
      {isOwner && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Practice (e.g., Sunday Service)" value={title} onChange={(e) => setTitle((e.target as HTMLInputElement).value)} />
          <Input placeholder="Cadence (e.g., Weekly)" value={cadence} onChange={(e) => setCadence((e.target as HTMLInputElement).value)} />
          <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote((e.target as HTMLInputElement).value)} />
          <div className="sm:col-span-3"><Button variant="secondary" onClick={add}>+ Add</Button></div>
        </div>
      )}
      {(s.faiths || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">{(s.faiths || []).map(f => <Chip key={f.id} onRemove={isOwner?()=>remove(f.id):undefined}>{f.title}{f.cadence?` â€¢ ${f.cadence}`:''}{f.note?` â€¢ ${f.note}`:''}</Chip>)}</div>
      )}
      <Row><Button variant="ghost" onClick={back}>Back</Button><Button onClick={next}>Continue</Button></Row>
    </Card>
  );
}
