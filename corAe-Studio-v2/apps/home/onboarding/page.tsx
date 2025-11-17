// apps/studio/app/ship/home/onboarding/wizard/homefocus/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
type Step = "WELCOME" | "IDENTITY" | "HOUSEHOLD" | "SPACES" | "ROUTINES" | "REMINDERS" | "NOTIFICATIONS" | "BLUEPRINT" | "SUCCESS";
type IdentityKey = "OWNER" | "RESIDENT";
type RoutineFrequency = "DAILY" | "WEEKLY" | "MONTHLY";
interface HouseholdMember { id: string; name: string; relation?: string; }
interface Space { id: string; name: string; }
interface Routine { id: string; title: string; frequency: RoutineFrequency; when?: string; spaceId?: string; checklist: string[]; }
interface Reminder { id: string; text: string; schedule: string; }
interface NotificationPrefs { viaCIMS: boolean; viaEmail: boolean; viaPush: boolean; quietHours?: { from: string; to: string }; }
interface HomeState {
  step: Step; homeName: string; identity: IdentityKey | null;
  members: HouseholdMember[]; spaces: Space[]; routines: Routine[]; reminders: Reminder[];
  notify: NotificationPrefs; blueprintJson: string; savedAt?: string | null;
}
const LOCAL_KEY = "corAeHomeWizard/homefocus";
const initial: HomeState = { step: "WELCOME", homeName: "", identity: null, members: [], spaces: [], routines: [], reminders: [], notify: { viaCIMS: true, viaEmail: false, viaPush: true, quietHours: { from: "22:00", to: "07:00" } }, blueprintJson: "", savedAt: null };
const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const rid = () => (typeof crypto!=="undefined" && "randomUUID" in crypto ? (crypto as any).randomUUID() : "id_"+Math.random().toString(36).slice(2,10));
const timeAgo = (iso?: string|null) => !iso ? "never" : ((d=>d<60?`${d}m ago`:d<1440?`${Math.floor(d/60)}h ago`:`${Math.floor(d/1440)}d ago`)(Math.floor((Date.now()-new Date(iso).getTime())/60000)));
const Save = (s: HomeState)=>{const p={...s,savedAt:new Date().toISOString()};localStorage.setItem(LOCAL_KEY,JSON.stringify(p));return p.savedAt!;};
const Load = ():HomeState|null=>{try{const r=localStorage.getItem(LOCAL_KEY);return r?JSON.parse(r):null;}catch{return null;}};
const Clear = ()=>localStorage.removeItem(LOCAL_KEY);
const Shell = ({children,right}:{children:React.ReactNode;right?:React.ReactNode})=>(
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
    <header className="mx-auto max-w-4xl px-3 pt-8 flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Home Onboarding • HomeFocus™</h1><p className="text-xs text-zinc-400">Set household, spaces, routines & Have-You.</p></div>{right}</header>
    <main className="mx-auto max-w-4xl px-3 pb-24 pt-6">{children}</main>
  </div>
);
const Card = ({title,hint,children}:{title:string;hint?:string;children:React.ReactNode})=>(
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2>{hint&&<p className="mt-1 text-sm text-zinc-400">{hint}</p>}<div className="mt-4 space-y-4">{children}</div></section>
);
const Row = ({children}:{children:React.ReactNode})=><div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>;
const Btn = ({children,onClick,variant="primary",disabled}:{children:React.ReactNode;onClick?:()=>void;variant?:"primary"|"secondary"|"ghost"|"danger";disabled?:boolean})=>{
  const b="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const m={primary:`${b} bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50`,secondary:`${b} bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50`,ghost:`${b} text-zinc-300 hover:bg-zinc-800/70`,danger:`${b} bg-red-600 text-white hover:bg-red-500 disabled:opacity-50`} as const;
  return <button onClick={onClick} disabled={disabled} className={m[variant]}>{children}</button>;
};
const Input=(p:React.InputHTMLAttributes<HTMLInputElement>)=><input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Textarea=(p:React.TextareaHTMLAttributes<HTMLTextAreaElement>)=><textarea {...p} className={`h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Chip=({children,onRemove}:{children:React.ReactNode;onRemove?:()=>void})=> <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs">{children}{onRemove&&<button onClick={onRemove} className="text-zinc-400 hover:text-zinc-200">✕</button>}</span>;
const SaveBar=({onSave,savedAt,saving}:{onSave:()=>void;savedAt?:string|null;saving:boolean})=>(
  <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs backdrop-blur">
    <Btn variant="secondary" onClick={onSave} disabled={saving}>{saving?"Saving…":"Save & Continue Later"}</Btn>
    <span className="text-zinc-400">{savedAt?`Last saved ${timeAgo(savedAt)}`:"Not saved yet"}</span>
  </div>
);
const Badge=({ok,label}:{ok:boolean;label:string})=> <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${ok?"bg-emerald-900/40 text-emerald-300":"bg-amber-900/40 text-amber-300"}`}><span className={`h-1.5 w-1.5 rounded-full ${ok?"bg-emerald-400":"bg-amber-400"}`} />{label}</span>;

function HomeFocusWizardPageImpl(){
  const [s,setS]=useState<HomeState>(initial); const [saving,setSaving]=useState(false); const [resume,setResume]=useState<HomeState|null>(null);
  useEffect(()=>{const d=Load(); if(d) setResume(d);},[]);
  const set=(p:Partial<HomeState>)=>setS(x=>({...x,...p})); const go=(st:Step)=>set({step:st});
  const save=()=>{setSaving(true); const when=Save(s); set({savedAt:when}); setTimeout(()=>setSaving(false),300);};
  const resumeDraft=()=>{if(!resume)return; setS(resume); setResume(null);};
  const discardDraft=()=>{Clear(); setResume(null);};
  const finish=()=>{Clear(); go("SUCCESS");};
  const headerRight=(<div className="flex items-center gap-2 text-xs"><Badge ok={!!s.homeName} label="Home"/><Badge ok={!!s.identity} label="Identity"/><Badge ok={s.members.length>0} label="Members"/><Badge ok={s.spaces.length>0} label="Spaces"/><Badge ok={s.routines.length>0} label="Routines"/><Badge ok={s.reminders.length>0} label="Reminders"/></div>);
  return (
    <Shell right={headerRight}>
      {resume&&(<div className="mb-4 rounded-xl border border-amber-900/40 bg-amber-900/20 p-4 text-sm text-amber-200"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div>Draft found (saved {resume.savedAt?timeAgo(resume.savedAt):"previously"}). Resume?</div><div className="flex gap-2"><Btn variant="secondary" onClick={resumeDraft}>Resume</Btn><Btn variant="ghost" onClick={discardDraft}>Discard</Btn></div></div></div>)}
      {s.step==="WELCOME"&&(<Card title="Welcome" hint="Let’s set your HomeFocus™ so corAe can buy back your time."><div className="grid gap-3 sm:grid-cols-2"><div><label className="text-sm font-medium text-zinc-200">Home / Household name</label><Input placeholder="e.g., The Adamson Household" value={s.homeName} onChange={e=>set({homeName:(e.target as HTMLInputElement).value})}/></div></div><Btn onClick={()=>go("IDENTITY")} disabled={!s.homeName}>Start</Btn></Card>)}
      {s.step==="IDENTITY"&&(<Card title="Who are you?" hint="Owner sets structure; Residents confirm routines and reminders.">
        <div className="grid gap-3 sm:grid-cols-2">{(["OWNER","RESIDENT"] as IdentityKey[]).map(k=>(
          <button key={k} onClick={()=>set({identity:k})} className={`rounded-xl border px-4 py-3 text-left transition ${s.identity===k?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}><div className="text-sm font-semibold">{k}</div><div className="text-xs text-zinc-400">{k==="OWNER"?"Create household, spaces & base routines":"Confirm personal reminders & quiet hours"}</div></button>
        ))}</div>
        <Row><Btn variant="ghost" onClick={()=>go("WELCOME")}>Back</Btn><Btn onClick={()=>go("HOUSEHOLD")} disabled={!s.identity}>Continue</Btn></Row>
      </Card>)}
      {s.step==="HOUSEHOLD"&&(<Card title="Household Members" hint="Add the people in your home.">
        <HouseholdEditor s={s} set={set}/>
        <Row><Btn variant="ghost" onClick={()=>go("IDENTITY")}>Back</Btn><Btn onClick={()=>go("SPACES")}>Continue</Btn></Row>
      </Card>)}
      {s.step==="SPACES"&&(<Card title="Spaces / Areas" hint="Define the places where routines run."><SpacesEditor s={s} set={set}/><Row><Btn variant="ghost" onClick={()=>go("HOUSEHOLD")}>Back</Btn><Btn onClick={()=>go("ROUTINES")}>Continue</Btn></Row></Card>)}
      {s.step==="ROUTINES"&&(<Card title="Routines" hint="Create daily/weekly/monthly routines with checklists."><RoutinesEditor s={s} set={set}/><Row><Btn variant="ghost" onClick={()=>go("SPACES")}>Back</Btn><Btn onClick={()=>go("REMINDERS")}>Continue</Btn></Row></Card>)}
      {s.step==="REMINDERS"&&(<Card title="Have-You Reminders" hint="Define prompts that feed Have-You Engine™ & Pulse."><RemindersEditor s={s} set={set}/><Row><Btn variant="ghost" onClick={()=>go("ROUTINES")}>Back</Btn><Btn onClick={()=>go("NOTIFICATIONS")}>Continue</Btn></Row></Card>)}
      {s.step==="NOTIFICATIONS"&&(<Card title="Notification Settings" hint="Where and when you want to be nudged."><NotificationsEditor s={s} set={set}/><Row><Btn variant="ghost" onClick={()=>go("REMINDERS")}>Back</Btn><Btn onClick={()=>go("BLUEPRINT")}>Continue</Btn></Row></Card>)}
      {s.step==="BLUEPRINT"&&(<Card title="HomeFocus™ Blueprint" hint="Seeds Home routines, Have-You prompts, and notifications.">
        <BlueprintView s={s} set={set}/>
        <Row><Btn variant="secondary" onClick={()=>downloadJson(s.blueprintJson,`${s.homeName||"homefocus"}-blueprint.json`)}>Download JSON</Btn><Btn variant="secondary" onClick={()=>seedApis(s)}>Seed APIs</Btn><Btn variant="ghost" onClick={()=>go("NOTIFICATIONS")}>Back</Btn><Btn onClick={finish} disabled={!s.blueprintJson}>Confirm & Generate</Btn></Row>
      </Card>)}
      {s.step==="SUCCESS"&&(<Card title="HomeFocus™ Ready 🎉" hint="Your daily and weekly flows are now structured."><p className="text-sm text-zinc-300">You’ll start receiving Have-You prompts and routine nudges per your notification settings.</p></Card>)}
      {s.step!=="SUCCESS"&&<SaveBar onSave={save} savedAt={s.savedAt} saving={saving}/>}
    </Shell>
  );
}
function HouseholdEditor({s,set}:{s:HomeState;set:(p:Partial<HomeState>)=>void}){
  const [name,setName]=useState(""); const [rel,setRel]=useState("");
  const add=()=>{if(!name.trim())return; set({members:[...s.members,{id:rid(),name:name.trim(),relation:rel.trim()||undefined}]}); setName(""); setRel("");};
  const remove=(id:string)=>set({members:s.members.filter(m=>m.id!==id)});
  return(<div><div className="grid gap-3 sm:grid-cols-3"><Input placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/><Input placeholder="Relation (optional)" value={rel} onChange={e=>setRel(e.target.value)}/><Btn variant="secondary" onClick={add}>+ Add</Btn></div>{s.members.length>0&&(<div className="flex flex-wrap gap-2 mt-3">{s.members.map(m=><Chip key={m.id} onRemove={()=>remove(m.id)}>{m.name}{m.relation?` • ${m.relation}`:""}</Chip>)}</div>)}</div>);
}
function SpacesEditor({s,set}:{s:HomeState;set:(p:Partial<HomeState>)=>void}){
  const [name,setName]=useState(""); const add=()=>{if(!name.trim())return; set({spaces:[...s.spaces,{id:rid(),name:name.trim()}]}); setName("");}; const rem=(id:string)=>set({spaces:s.spaces.filter(a=>a.id!==id)});
  return(<div><div className="grid gap-3 sm:grid-cols-3"><Input placeholder="e.g., Kitchen" value={name} onChange={e=>setName(e.target.value)}/><div className="sm:col-span-2"><Btn variant="secondary" onClick={add}>+ Add space</Btn></div></div>{s.spaces.length>0&&<div className="flex flex-wrap gap-2 mt-3">{s.spaces.map(a=><Chip key={a.id} onRemove={()=>rem(a.id)}>{a.name}</Chip>)}</div>}</div>);
}
function RoutinesEditor({s,set}:{s:HomeState;set:(p:Partial<HomeState>)=>void}){
  const [title,setTitle]=useState(""); const [freq,setFreq]=useState<RoutineFrequency>("DAILY"); const [when,setWhen]=useState(""); const [space,setSpace]=useState(""); const [items,setItems]=useState("");
  const add=()=>{if(!title.trim())return; set({routines:[...s.routines,{id:rid(),title:title.trim(),frequency:freq,when:when.trim()||undefined,spaceId:space||undefined,checklist:items.split("\n").map(x=>x.trim()).filter(Boolean)}]}); setTitle(""); setWhen(""); setSpace(""); setItems("");};
  const rem=(id:string)=>set({routines:s.routines.filter(r=>r.id!==id)});
  return(<div>
    <div className="grid gap-3 sm:grid-cols-4"><Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/>
      <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={freq} onChange={e=>setFreq(e.target.value as any)}><option value="DAILY">DAILY</option><option value="WEEKLY">WEEKLY</option><option value="MONTHLY">MONTHLY</option></select>
      <Input placeholder='When (e.g., "07:00" or "Sat 10:00")' value={when} onChange={e=>setWhen(e.target.value)}/>
      <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={space} onChange={e=>setSpace(e.target.value)}><option value="">— space —</option>{s.spaces.map(sp=><option key={sp.id} value={sp.id}>{sp.name}</option>)}</select>
    </div>
    <div className="mt-3"><label className="text-sm font-medium text-zinc-200">Checklist (one per line)</label><Textarea value={items} onChange={e=>setItems(e.target.value)} placeholder="Step 1&#10;Step 2&#10;Step 3"/></div>
    <Btn variant="secondary" onClick={add}>+ Add routine</Btn>
    {s.routines.length>0&&(<div className="space-y-3 mt-3">{s.routines.map(r=>(
      <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-1 text-sm font-semibold">{r.title}<span className="text-zinc-400"> • {r.frequency}{r.when?` @ ${r.when}`:""}{r.spaceId?` • ${s.spaces.find(sp=>sp.id===r.spaceId)?.name}`:""}</span></div>
        {r.checklist.length>0&&<ul className="list-disc pl-5 text-sm text-zinc-300">{r.checklist.map((it,i)=><li key={i}>{it}</li>)}</ul>}
        <div className="mt-2"><Btn variant="danger" onClick={()=>rem(r.id)}>Remove</Btn></div>
      </div>
    ))}</div>)}
  </div>);
}
function RemindersEditor({s,set}:{s:HomeState;set:(p:Partial<HomeState>)=>void}){
  const [text,setText]=useState(""); const [sched,setSched]=useState("");
  const add=()=>{if(!text.trim()||!sched.trim())return; set({reminders:[...s.reminders,{id:rid(),text:text.trim(),schedule:sched.trim()}]}); setText(""); setSched("");};
  const rem=(id:string)=>set({reminders:s.reminders.filter(x=>x.id!==id)});
  return(<div>
    <div className="grid gap-3 sm:grid-cols-3"><Input placeholder='Reminder text (e.g., "Have you planned meals?")' value={text} onChange={e=>setText(e.target.value)}/><Input placeholder='Schedule (e.g., "07:00 DAILY")' value={sched} onChange={e=>setSched(e.target.value)}/><Btn variant="secondary" onClick={add}>+ Add</Btn></div>
    {s.reminders.length>0&&<div className="flex flex-wrap gap-2 mt-3">{s.reminders.map(r=><Chip key={r.id} onRemove={()=>rem(r.id)}>{r.text} • {r.schedule}</Chip>)}</div>}
  </div>);
}
function NotificationsEditor({s,set}:{s:HomeState;set:(p:Partial<HomeState>)=>void}){
  const [viaCIMS,setC]=useState(!!s.notify.viaCIMS); const [viaEmail,setE]=useState(!!s.notify.viaEmail); const [viaPush,setP]=useState(!!s.notify.viaPush);
  const [qhFrom,setF]=useState(s.notify.quietHours?.from??"22:00"); const [qhTo,setT]=useState(s.notify.quietHours?.to??"07:00");
  return(<div>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={viaCIMS} onChange={e=>setC(e.target.checked)}/> CIMS</label>
      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={viaEmail} onChange={e=>setE(e.target.checked)}/> Email</label>
      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={viaPush} onChange={e=>setP(e.target.checked)}/> Push</label>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 mt-3">
      <div><label className="text-sm font-medium text-zinc-200">Quiet hours — From</label><Input value={qhFrom} onChange={e=>setF(e.target.value)} placeholder="22:00"/></div>
      <div><label className="text-sm font-medium text-zinc-200">Quiet hours — To</label><Input value={qhTo} onChange={e=>setT(e.target.value)} placeholder="07:00"/></div>
    </div>
    <div className="mt-3"><Btn onClick={()=>set({notify:{viaCIMS,viaEmail,viaPush,quietHours:{from:qhFrom,to:qhTo}}})}>Apply</Btn></div>
  </div>);
}
function BlueprintView({s,set}:{s:HomeState;set:(p:Partial<HomeState>)=>void}){
  const blueprint=useMemo(()=>({
    scope:"HOME",home:s.homeName,identity:s.identity,members:s.members,spaces:s.spaces,
    routines:s.routines.map(r=>({id:r.id,title:r.title,frequency:r.frequency,when:r.when,spaceId:r.spaceId,checklist:r.checklist})),
    reminders:s.reminders,notifications:s.notify,generatedAt:new Date().toISOString(),version:1
  }),[s]); useEffect(()=>set({blueprintJson:JSON.stringify(blueprint,null,2)}),[blueprint,set]);
  return <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{s.blueprintJson}</pre>;
}
async function seedApis(s:HomeState){
  try{await fetch("/api/ship/home/routines",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:JSON.parse(s.blueprintJson||"{}")})});}catch{}
  try{await fetch("/api/ship/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:s.reminders})});}catch{}
}
function downloadJson(text:string, name:string){const b=new Blob([text],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);}
export default function HomeFocusWizardPage(){ return <HomeFocusWizardPageImpl/>; }