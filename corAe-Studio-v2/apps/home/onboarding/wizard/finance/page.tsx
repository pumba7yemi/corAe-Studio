// apps/studio/app/home/onboarding/wizard/finance/page.tsx
"use client";
/**
 * corAe â€¢ Home â€¢ Onboarding â€¢ Finance
 * Budgets, bills, shared expenses, savings. 28-day rhythm alignment.
 * Seeds: /api/home/finance  (+Have-You reminders for bill due dates)
 */
import React, { useEffect, useMemo, useState } from "react";

/* Types */
type Step = "WELCOME" | "INCOME" | "BUDGETS" | "BILLS" | "SAVINGS" | "BLUEPRINT" | "SUCCESS";
type Frequency = "WEEKLY" | "MONTHLY" | "ADHOC";
type DayOfWeek = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

interface Income {
  id: string; source: string; amount: number; freq: Frequency; day?: DayOfWeek; note?: string;
}
interface Budget {
  id: string; category: string; amount: number; freq: Frequency;
}
interface Bill {
  id: string; name: string; amount: number; dueDay: number; // 1â€“31
  reminderDay?: number; // days before due
  channel?: "CARD" | "BANK" | "CASH" | "OTHER"; note?: string;
}
interface SavingGoal {
  id: string; name: string; target: number; perPeriod: number; freq: Frequency; note?: string;
}
interface State {
  step: Step;
  householdName: string;
  incomes: Income[];
  budgets: Budget[];
  bills: Bill[];
  goals: SavingGoal[];
  anchorDay: DayOfWeek; // align to Shopping/MealPrep
  blueprintJson: string;
  savedAt?: string | null;
}
const LOCAL_KEY = "corAeHomeWizard/finance";
const DAYS: DayOfWeek[] = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

/* Utils */
const rid = (p="id") => (typeof crypto!=="undefined" && "randomUUID" in crypto ? `${p}_${(crypto as any).randomUUID()}` : `${p}_`+Math.random().toString(36).slice(2,10));
const saveLocal = (s: State) => { const payload={...s,savedAt:new Date().toISOString()}; localStorage.setItem(LOCAL_KEY, JSON.stringify(payload)); return payload.savedAt!; };
const loadLocal = (): State | null => { try { const raw=localStorage.getItem(LOCAL_KEY); return raw? JSON.parse(raw) as State : null; } catch { return null; } };
const clearLocal = ()=> localStorage.removeItem(LOCAL_KEY);
const timeAgo = (iso?:string|null)=>!iso?"never":((d=>d<60?`${d}m ago`:d<1440?`${Math.floor(d/60)}h ago`:`${Math.floor(d/1440)}d ago`)(Math.floor((Date.now()-new Date(iso).getTime())/60000)));
/* UI atoms */
const Shell = ({children,right}:{children:React.ReactNode; right?:React.ReactNode})=>(
  <div className="min-h-dvh bg-zinc-950 text-zinc-100">
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-8">
      <div><h1 className="text-2xl font-semibold">Home Onboarding â€¢ Finance</h1><p className="text-xs text-zinc-400">Budgets, bills, savings â€” synced to your weekly anchor.</p></div>
      {right}
    </header>
    <main className="mx-auto max-w-5xl px-4 pb-28 pt-6">{children}</main>
  </div>
);
const Card = ({title,hint,children}:{title:string;hint?:string;children:React.ReactNode})=>(
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2>{hint&&<p className="mt-1 text-sm text-zinc-400">{hint}</p>}<div className="mt-4 space-y-4">{children}</div></section>
);
const Button = ({children,onClick,variant="primary",disabled}:{children:React.ReactNode;onClick?:()=>void;variant?:"primary"|"secondary"|"ghost"|"danger";disabled?:boolean})=>{
  const base="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const map={primary:`${base} bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50`,secondary:`${base} bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50`,ghost:`${base} text-zinc-300 hover:bg-zinc-800/70`,danger:`${base} bg-red-600 text-white hover:bg-red-500 disabled:opacity-50`} as const;
  return <button onClick={onClick} disabled={disabled} className={map[variant]}>{children}</button>;
};
const Input = (p:React.InputHTMLAttributes<HTMLInputElement>)=> <input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Row = ({children}:{children:React.ReactNode})=> <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>;
const SaveBar = ({onSave,savedAt,saving}:{onSave:()=>void;savedAt?:string|null;saving:boolean})=>(
  <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs backdrop-blur">
    <Button variant="secondary" onClick={onSave} disabled={saving}>{saving?"Savingâ€¦":"Save & Continue Later"}</Button>
    <span className="text-zinc-400">{savedAt?`Last saved ${timeAgo(savedAt)}`:"Not saved yet"}</span>
  </div>
);
const Badge = ({ok,label}:{ok:boolean;label:string})=>(
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${ok?"bg-emerald-900/40 text-emerald-300":"bg-amber-900/40 text-amber-300"}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${ok?"bg-emerald-400":"bg-amber-400"}`} /> {label}
  </span>
);

/* Page */
export default function HomeFinanceWizardPage(){
  const [s,setS]=useState<State>({step:"WELCOME",householdName:"",incomes:[],budgets:[],bills:[],goals:[],anchorDay:"THU",blueprintJson:"",savedAt:null});
  const [saving,setSaving]=useState(false); const [resume,setResume]=useState<State|null>(null);
  useEffect(()=>{const d=loadLocal(); if(d) setResume(d);},[]);
  const set=(p:Partial<State>)=>setS(x=>({...x,...p})); const go=(step:Step)=>set({step});
  const save=()=>{setSaving(true); const when=saveLocal(s); set({savedAt:when}); setTimeout(()=>setSaving(false),250);};
  const resumeDraft=()=>{if(!resume)return; setS(resume); setResume(null);}; const discardDraft=()=>{clearLocal(); setResume(null);}; const finish=()=>{clearLocal(); go("SUCCESS");};

  const headerRight=<div className="flex items-center gap-2 text-xs">
    <Badge ok={!!s.householdName} label="Home" />
    <Badge ok={s.incomes.length>0} label="Income" />
    <Badge ok={s.budgets.length>0} label="Budgets" />
    <Badge ok={s.bills.length>0} label="Bills" />
    <Badge ok={s.goals.length>0} label="Savings" />
  </div>;

  /* Steps */
  const Welcome=()=>(
    <Card title="Welcome" hint="Set your household finance rhythm. This aligns with your weekly anchor (e.g., bill checks every THU).">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-zinc-200">Household name</label>
          <Input placeholder="e.g., The Adamson Household" value={s.householdName} onChange={e=>set({householdName:(e.target as HTMLInputElement).value})} />
        </div>
        <div><label className="text-sm font-medium text-zinc-200">Weekly anchor day</label>
          <div className="flex flex-wrap gap-2 pt-2">
            {DAYS.map(d=>(
              <button key={d} onClick={()=>set({anchorDay:d})}
                className={`rounded-xl border px-3 py-1 text-sm ${s.anchorDay===d?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>{d}</button>
            ))}
          </div>
        </div>
      </div>
      <Button onClick={()=>go("INCOME")} disabled={!s.householdName}>Start</Button>
    </Card>
  );

  const IncomeStep=()=> {
    const [source,setSource]=useState(""); const [amount,setAmount]=useState(""); const [freq,setFreq]=useState<Frequency>("MONTHLY"); const [day,setDay]=useState<DayOfWeek>("THU"); const [note,setNote]=useState("");
    const add=()=>{ if(!source.trim()||!amount) return; const rec:Income={id:rid("inc"),source:source.trim(),amount:Number(amount),freq,day:freq==="WEEKLY"?day:undefined,note:note.trim()||undefined}; set({incomes:[...s.incomes,rec]}); setSource(""); setAmount(""); setFreq("MONTHLY"); setDay("THU"); setNote(""); };
    const remove=(id:string)=> set({incomes:s.incomes.filter(x=>x.id!==id)});
    return (
      <Card title="Income" hint="Add income streams (monthly salary, weekly side-gig, etc.).">
        <div className="grid gap-3 sm:grid-cols-6">
          <Input placeholder="Source" value={source} onChange={e=>setSource(e.target.value)} />
          <Input placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={freq} onChange={e=>setFreq(e.target.value as Frequency)}>
            <option value="MONTHLY">MONTHLY</option><option value="WEEKLY">WEEKLY</option><option value="ADHOC">ADHOC</option>
          </select>
          {freq==="WEEKLY" && (
            <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={day} onChange={e=>setDay(e.target.value as DayOfWeek)}>
              {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          )}
          <Input placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
          <Button variant="secondary" onClick={add}>+ Add</Button>
        </div>
        {s.incomes.length>0 && <div className="space-y-2 pt-2">{s.incomes.map(i=>(
          <div key={i.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm flex items-center justify-between">
            <div><span className="font-medium">{i.source}</span> <span className="text-zinc-400">â€¢ {i.freq}{i.day?` â€¢ ${i.day}`:""} â€¢ {i.amount}</span></div>
            <Button variant="danger" onClick={()=>remove(i.id)}>Remove</Button>
          </div>
        ))}</div>}
        <Row><Button variant="ghost" onClick={()=>go("WELCOME")}>Back</Button><Button onClick={()=>go("BUDGETS")} disabled={s.incomes.length===0}>Continue</Button></Row>
      </Card>
    );
  };

  const Budgets=()=> {
    const [category,setCategory]=useState(""); const [amount,setAmount]=useState(""); const [freq,setFreq]=useState<Frequency>("MONTHLY");
    const add=()=>{ if(!category.trim()||!amount) return; set({budgets:[...s.budgets,{id:rid("bdg"),category:category.trim(),amount:Number(amount),freq}]}); setCategory(""); setAmount(""); setFreq("MONTHLY"); };
    const remove=(id:string)=> set({budgets:s.budgets.filter(x=>x.id!==id)});
    return (
      <Card title="Budgets" hint="Plan by category â€” Groceries, Utilities, Transport, Giving, etc.">
        <div className="grid gap-3 sm:grid-cols-5">
          <Input placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
          <Input placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={freq} onChange={e=>setFreq(e.target.value as Frequency)}>
            <option value="MONTHLY">MONTHLY</option><option value="WEEKLY">WEEKLY</option><option value="ADHOC">ADHOC</option>
          </select>
          <div className="sm:col-span-2"><Button variant="secondary" onClick={add}>+ Add Category</Button></div>
        </div>
        {s.budgets.length>0 && <div className="flex flex-wrap gap-2 pt-2">{s.budgets.map(b=>(
          <span key={b.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">
            {b.category} â€¢ {b.freq} â€¢ {b.amount}
            <button onClick={()=>remove(b.id)} className="text-zinc-400 hover:text-zinc-100">âœ•</button>
          </span>
        ))}</div>}
        <Row><Button variant="ghost" onClick={()=>go("INCOME")}>Back</Button><Button onClick={()=>go("BILLS")}>Continue</Button></Row>
      </Card>
    );
  };

  const Bills=()=> {
    const [name,setName]=useState(""); const [amount,setAmount]=useState(""); const [dueDay,setDueDay]=useState("1");
    const [rem,setRem]=useState("2"); const [channel,setChannel]=useState<Bill["channel"]>("BANK"); const [note,setNote]=useState("");
    const add=()=>{ if(!name.trim()||!amount||!dueDay) return;
      set({bills:[...s.bills,{id:rid("bill"),name:name.trim(),amount:Number(amount),dueDay:Number(dueDay),reminderDay:rem?Number(rem):undefined,channel,note:note.trim()||undefined}]});
      setName(""); setAmount(""); setDueDay("1"); setRem("2"); setChannel("BANK"); setNote("");
    };
    const remove=(id:string)=> set({bills:s.bills.filter(x=>x.id!==id)});
    return (
      <Card title="Bills" hint="Due day (1â€“31). Reminders can be set N days before.">
        <div className="grid gap-3 sm:grid-cols-7">
          <Input placeholder="Bill name" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <Input placeholder="Due day (1â€“31)" value={dueDay} onChange={e=>setDueDay(e.target.value)} />
          <Input placeholder="Remind N days before" value={rem} onChange={e=>setRem(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={channel} onChange={e=>setChannel(e.target.value as any)}>
            <option value="BANK">BANK</option><option value="CARD">CARD</option><option value="CASH">CASH</option><option value="OTHER">OTHER</option>
          </select>
          <Input placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
          <Button variant="secondary" onClick={add}>+ Add Bill</Button>
        </div>
        {s.bills.length>0 && <div className="space-y-2 pt-2">{s.bills.map(b=>(
          <div key={b.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm flex items-center justify-between">
            <div><span className="font-medium">{b.name}</span> <span className="text-zinc-400">â€¢ due {b.dueDay} â€¢ {b.amount}{b.reminderDay?` â€¢ remind ${b.reminderDay}d prior`:""}{b.channel?` â€¢ ${b.channel}`:""}</span></div>
            <Button variant="danger" onClick={()=>remove(b.id)}>Remove</Button>
          </div>
        ))}</div>}
        <Row><Button variant="ghost" onClick={()=>go("BUDGETS")}>Back</Button><Button onClick={()=>go("SAVINGS")}>Continue</Button></Row>
      </Card>
    );
  };

  const Savings=()=> {
    const [name,setName]=useState(""); const [target,setTarget]=useState(""); const [pp,setPP]=useState(""); const [freq,setFreq]=useState<Frequency>("MONTHLY"); const [note,setNote]=useState("");
    const add=()=>{ if(!name.trim()||!target||!pp) return; set({goals:[...s.goals,{id:rid("goal"),name:name.trim(),target:Number(target),perPeriod:Number(pp),freq,note:note.trim()||undefined}]}); setName(""); setTarget(""); setPP(""); setFreq("MONTHLY"); setNote(""); };
    const remove=(id:string)=> set({goals:s.goals.filter(x=>x.id!==id)});
    return (
      <Card title="Savings Goals" hint="Set targets and per-period contributions.">
        <div className="grid gap-3 sm:grid-cols-6">
          <Input placeholder="Goal name" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Target total" value={target} onChange={e=>setTarget(e.target.value)} />
          <Input placeholder="Per period amount" value={pp} onChange={e=>setPP(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={freq} onChange={e=>setFreq(e.target.value as Frequency)}>
            <option value="MONTHLY">MONTHLY</option><option value="WEEKLY">WEEKLY</option><option value="ADHOC">ADHOC</option>
          </select>
          <Input placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
          <Button variant="secondary" onClick={add}>+ Add Goal</Button>
        </div>
        {s.goals.length>0 && <div className="flex flex-wrap gap-2 pt-2">{s.goals.map(g=>(
          <span key={g.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">
            {g.name} â€¢ {g.freq} â€¢ target {g.target} â€¢ +{g.perPeriod}
            <button onClick={()=>remove(g.id)} className="text-zinc-400 hover:text-zinc-100">âœ•</button>
          </span>
        ))}</div>}
        <Row><Button variant="ghost" onClick={()=>go("BILLS")}>Back</Button><Button onClick={()=>go("BLUEPRINT")} disabled={s.goals.length===0 && s.bills.length===0 && s.budgets.length===0}>Continue</Button></Row>
      </Card>
    );
  };

  const Blueprint=()=> {
    const bp=useMemo(()=>makeBlueprint(s),[s]);
    useEffect(()=>{ set({blueprintJson:JSON.stringify(bp,null,2)}); },[bp]);
    async function seedApis(){
      try { await fetch("/api/home/finance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:bp})}); } catch {}
      try { const reminders=makeFinanceHaveYou(s); await fetch("/api/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:reminders})}); } catch {}
    }
    function download(){ const blob=new Blob([s.blueprintJson],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${s.householdName||"home-finance"}-blueprint.json`; a.click(); URL.revokeObjectURL(url); }
    return (
      <Card title="Finance Blueprint" hint="This JSON seeds budgets, bills, and savings into Home Finance.">
        <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{s.blueprintJson}</pre>
        <Row>
          <Button variant="secondary" onClick={download}>Download JSON</Button>
          <Button variant="secondary" onClick={seedApis}>Seed APIs</Button>
          <Button variant="ghost" onClick={()=>go("SAVINGS")}>Back</Button>
          <Button onClick={()=>{clearLocal(); go("SUCCESS");}} disabled={!s.blueprintJson}>Confirm & Finish</Button>
        </Row>
      </Card>
    );
  };

  return (
    <Shell right={headerRight}>
      {resume && (
        <div className="mb-4 rounded-xl border border-amber-900/40 bg-amber-900/20 p-4 text-sm text-amber-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>Draft found (saved {resume.savedAt?timeAgo(resume.savedAt):"previously"}). Resume?</div>
            <div className="flex gap-2"><Button variant="secondary" onClick={resumeDraft}>Resume</Button><Button variant="ghost" onClick={discardDraft}>Discard</Button></div>
          </div>
        </div>
      )}

      {s.step==="WELCOME" && <Welcome />}
      {s.step==="INCOME" && <IncomeStep />}
      {s.step==="BUDGETS" && <Budgets />}
      {s.step==="BILLS" && <Bills />}
      {s.step==="SAVINGS" && <Savings />}
      {s.step==="BLUEPRINT" && <Blueprint />}
      {s.step==="SUCCESS" && (
        <Card title="Finance Setup Complete ðŸŽ‰" hint="Youâ€™ll get nudges on anchor day for check-ins, and before bill due dates.">
          <p className="text-sm text-zinc-300">You can edit or expand any time in Home â†’ Finance.</p>
        </Card>
      )}

      {s.step!=="SUCCESS" && <SaveBar onSave={save} savedAt={s.savedAt} saving={saving} />}
    </Shell>
  );
}

/* Helpers */
function makeBlueprint(s: State){
  return {
    scope:"HOME", module:"FINANCE",
    household:s.householdName,
    anchorDay:s.anchorDay,
    incomes:s.incomes, budgets:s.budgets, bills:s.bills, goals:s.goals,
    generatedAt:new Date().toISOString(), version:1,
  };
}
function makeFinanceHaveYou(s: State){
  const out:Array<{text:string;schedule:string}> = [];
  // Weekly anchor review
  out.push({ text:`Have you reviewed budgets & balances for ${s.anchorDay}?`, schedule:`${s.anchorDay} 09:00` });
  // Bill reminders (X days prior, simplified schedule string for your scheduler)
  for(const b of s.bills){
    if (b.reminderDay && b.reminderDay>0){
      out.push({ text:`Have you prepared payment for ${b.name}? (due ${b.dueDay})`, schedule:`${b.reminderDay}D_BEFORE_${b.dueDay}` });
    }
  }
  return out;
}
