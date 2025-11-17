// apps/studio/app/ship/home/onboarding/wizard/mindful/page.tsx
"use client";
/**
 * corAe • Home • Onboarding • Mindful
 * Wellbeing, prayer/reflection, gratitude.
 * Seeds: /api/ship/home/mindful (+Have-You prompts)
 */
import React, { useMemo, useState } from "react";
type Step="WELCOME"|"PILLARS"|"SCHEDULE"|"PROMPTS"|"BLUEPRINT"|"SUCCESS";
type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Pillar{ id:string; name:string; checklist:string[] }
interface Slot{ day:DayOfWeek; time:string; pillarId?:string }
interface Prompt{ id:string; text:string; schedule:string }
interface State{ step:Step; householdName:string; pillars:Pillar[]; schedule:Slot[]; prompts:Prompt[]; blueprintJson:string }
const DAYS:DayOfWeek[]=["SUN","MON","TUE","WED","THU","FRI","SAT"];
const rid=(p="id")=>`${p}_`+Math.random().toString(36).slice(2,10);
const Input=(p:React.InputHTMLAttributes<HTMLInputElement>)=> <input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Button=({children,onClick}:{children:React.ReactNode;onClick?:()=>void})=> <button onClick={onClick} className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium">{children}</button>;
const Card=({title,children}:{title:string;children:React.ReactNode})=> <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 space-y-4">{children}</div></section>;
export default function MindfulWizard(){
  const [s,setS]=useState<State>({step:"WELCOME",householdName:"",pillars:[],schedule:[],prompts:[],blueprintJson:""});
  const set=(p:Partial<State>)=>setS(x=>({...x,...p})); const go=(step:Step)=>set({step});
  const Welcome=()=>(
    <Card title="Welcome — Mindful">
      <Input placeholder="Household / Profile name" value={s.householdName} onChange={e=>set({householdName:(e.target as HTMLInputElement).value})} />
      <Button onClick={()=>go("PILLARS")}>Start</Button>
    </Card>
  );
  const Pillars=()=> {
    const [name,setName]=useState(""); const [list,setList]=useState("");
    const add=()=>{ if(!name.trim()) return; const checklist=list.split("\n").map(x=>x.trim()).filter(Boolean); set({pillars:[...s.pillars,{id:rid("p"),name:name.trim(),checklist}]}); setName(""); setList(""); };
    const remove=(id:string)=> set({pillars:s.pillars.filter(x=>x.id!==id)});
    return (
      <Card title="Pillars (e.g., Morning Prayer, Gratitude, Reading)">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Pillar name" value={name} onChange={e=>setName(e.target.value)} />
          <textarea placeholder="Checklist (one per line)" value={list} onChange={e=>setList(e.target.value)} className="h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" />
          <Button onClick={add}>+ Add</Button>
        </div>
        <div className="space-y-2 pt-2">{s.pillars.map(p=><div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{p.name} • {p.checklist.length} steps <button onClick={()=>remove(p.id)} className="ml-2 text-zinc-400 hover:text-zinc-100">✕</button></div>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("WELCOME")}>Back</Button><Button onClick={()=>go("SCHEDULE")}>Continue</Button></div>
      </Card>
    );
  };
  const Schedule=()=> {
    const [day,setDay]=useState<DayOfWeek>("MON"); const [time,setTime]=useState("07:00"); const [pillarId,setPillar]=useState(s.pillars[0]?.id ?? "");
    const add=()=>{ if(!pillarId) return; set({schedule:[...s.schedule,{day,time,pillarId}]}); };
    const remove=(i:number)=> set({schedule:s.schedule.filter((_,idx)=>idx!==i)});
    return (
      <Card title="Schedule">
        <div className="grid gap-3 sm:grid-cols-5">
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={day} onChange={e=>setDay(e.target.value as any)}>{DAYS.map(d=><option key={d} value={d}>{d}</option>)}</select>
          <Input placeholder="HH:MM" value={time} onChange={e=>setTime(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={pillarId} onChange={e=>setPillar(e.target.value)}>
            <option value="">— Pillar —</option>
            {s.pillars.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="sm:col-span-2"><Button onClick={add}>+ Add Slot</Button></div>
        </div>
        <div className="space-y-2 pt-2">{s.schedule.map((sl,i)=> <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{sl.day} • {sl.time} • {s.pillars.find(p=>p.id===sl.pillarId)?.name}<button onClick={()=>remove(i)} className="ml-2 text-zinc-400 hover:text-zinc-100">✕</button></div>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("PILLARS")}>Back</Button><Button onClick={()=>go("PROMPTS")}>Continue</Button></div>
      </Card>
    );
  };
  const Prompts=()=> {
    const [text,setText]=useState(""); const [schedule,setSchedule]=useState("DAILY 06:30");
    const add=()=>{ if(!text.trim()) return; set({prompts:[...s.prompts,{id:rid("hv"),text:text.trim(),schedule:schedule.trim()}]}); setText(""); };
    const remove=(id:string)=> set({prompts:s.prompts.filter(x=>x.id!==id)});
    return (
      <Card title="Have-You Prompts">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder='Prompt text (e.g., "Have you prayed?")' value={text} onChange={e=>setText(e.target.value)} />
          <Input placeholder='Schedule (e.g., "DAILY 06:30")' value={schedule} onChange={e=>setSchedule(e.target.value)} />
          <Button onClick={add}>+ Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">{s.prompts.map(p=><span key={p.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">{p.text} • {p.schedule}<button onClick={()=>remove(p.id)} className="text-zinc-400 hover:text-zinc-100">✕</button></span>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("SCHEDULE")}>Back</Button><Button onClick={()=>go("BLUEPRINT")}>Continue</Button></div>
      </Card>
    );
  };
  const Blueprint=()=> {
    const bp=useMemo(()=>({scope:"HOME", module:"MINDFUL", household:s.householdName, pillars:s.pillars, schedule:s.schedule, prompts:s.prompts, generatedAt:new Date().toISOString(), version:1}),[s]);
    async function seedApis(){ try{ await fetch("/api/ship/home/mindful",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:bp})}); }catch{} try{ await fetch("/api/ship/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:s.prompts})}); }catch{} }
    return (
      <Card title="Mindful Blueprint">
        <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{JSON.stringify(bp,null,2)}</pre>
        <div className="flex gap-2"><Button onClick={seedApis}>Seed APIs</Button><Button onClick={()=>go("SUCCESS")}>Confirm & Finish</Button></div>
      </Card>
    );
  };
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      {s.step==="WELCOME"&&<Welcome/>}
      {s.step==="PILLARS"&&<Pillars/>}
      {s.step==="SCHEDULE"&&<Schedule/>}
      {s.step==="PROMPTS"&&<Prompts/>}
      {s.step==="BLUEPRINT"&&<Blueprint/>}
      {s.step==="SUCCESS"&&<Card title="Mindful Setup Complete 🎉"><p className="text-sm text-zinc-300">Prompts live.</p></Card>}
    </div>
  );
}