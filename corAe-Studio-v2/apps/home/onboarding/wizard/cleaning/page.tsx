// apps/studio/app/ship/home/onboarding/wizard/cleaning/page.tsx
"use client";
/**
 * corAe • Home • Onboarding • Cleaning
 * 28-day cleaning rhythm with zones & rotations.
 * Seeds: /api/ship/home/cleaning (+Have-You prompts)
 */
import React, { useEffect, useMemo, useState } from "react";
type Step="WELCOME"|"ZONES"|"TASKS"|"ROTATION"|"BLUEPRINT"|"SUCCESS";
type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Zone{ id:string; name:string }
interface Task{ id:string; zoneId:string; title:string; freq:"DAILY"|"WEEKLY"|"MONTHLY" }
interface Slot{ day:DayOfWeek; zoneId?:string }
interface State{ step:Step; householdName:string; anchorDay:DayOfWeek; zones:Zone[]; tasks:Task[]; rotation:Slot[]; blueprintJson:string; savedAt?:string|null }
const DAYS:DayOfWeek[]=["SUN","MON","TUE","WED","THU","FRI","SAT"];
const rid=(p="id")=>`${p}_`+Math.random().toString(36).slice(2,10);
const Input=(p:React.InputHTMLAttributes<HTMLInputElement>)=><input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Button=({children,onClick}:{children:React.ReactNode;onClick?:()=>void})=><button onClick={onClick} className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium"> {children} </button>;
const Card=({title,children}:{title:string;children:React.ReactNode})=><section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 space-y-4">{children}</div></section>;
export default function CleaningWizard(){
  const [s,setS]=useState<State>({step:"WELCOME",householdName:"",anchorDay:"THU",zones:[],tasks:[],rotation:DAYS.map(d=>({day:d})),blueprintJson:""});
  const set=(p:Partial<State>)=>setS(x=>({...x,...p})); const go=(step:Step)=>set({step});
  const Welcome=()=>(
    <Card title="Welcome — Cleaning Rhythm">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Household name" value={s.householdName} onChange={e=>set({householdName:(e.target as HTMLInputElement).value})}/>
        <div className="flex flex-wrap gap-2">{DAYS.map(d=><button key={d} onClick={()=>set({anchorDay:d})} className={`rounded-xl border px-3 py-1 text-sm ${s.anchorDay===d?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>{d}</button>)}</div>
      </div>
      <Button onClick={()=>go("ZONES")}>Start</Button>
    </Card>
  );
  const Zones=()=> {
    const [name,setName]=useState(""); const add=()=>{ if(!name.trim())return; set({zones:[...s.zones,{id:rid("z"),name:name.trim()}]}); setName(""); };
    const remove=(id:string)=> set({zones:s.zones.filter(x=>x.id!==id)});
    return (
      <Card title="Zones / Areas">
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="e.g., Kitchen" value={name} onChange={e=>setName(e.target.value)} />
          <Button onClick={add}>+ Add Zone</Button>
        </div>
        <div className="flex flex-wrap gap-2">{s.zones.map(z=><span key={z.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">{z.name}<button onClick={()=>remove(z.id)} className="text-zinc-400 hover:text-zinc-100">✕</button></span>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("WELCOME")}>Back</Button><Button onClick={()=>go("TASKS")}>Continue</Button></div>
      </Card>
    );
  };
  const Tasks=()=> {
    const [title,setTitle]=useState(""); const [zoneId,setZoneId]=useState(s.zones[0]?.id??""); const [freq,setFreq]=useState<Task["freq"]>("WEEKLY");
    useEffect(()=>{ if(!zoneId && s.zones[0]) setZoneId(s.zones[0].id); },[s.zones,zoneId]);
    const add=()=>{ if(!title.trim()||!zoneId) return; set({tasks:[...s.tasks,{id:rid("t"),zoneId,title:title.trim(),freq}]}); setTitle(""); };
    const remove=(id:string)=> set({tasks:s.tasks.filter(x=>x.id!==id)});
    return (
      <Card title="Cleaning Tasks">
        <div className="grid gap-3 sm:grid-cols-5">
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={zoneId} onChange={e=>setZoneId(e.target.value)}>{s.zones.map(z=><option key={z.id} value={z.id}>{z.name}</option>)}</select>
          <Input placeholder="Task title" value={title} onChange={e=>setTitle(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={freq} onChange={e=>setFreq(e.target.value as any)}>
            <option value="DAILY">DAILY</option><option value="WEEKLY">WEEKLY</option><option value="MONTHLY">MONTHLY</option>
          </select>
          <div className="sm:col-span-2"><Button onClick={add}>+ Add Task</Button></div>
        </div>
        {s.tasks.length>0 && <div className="space-y-2 pt-2">{s.tasks.map(t=><div key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{t.title} • {s.zones.find(z=>z.id===t.zoneId)?.name} • {t.freq} <button onClick={()=>remove(t.id)} className="ml-2 text-zinc-400 hover:text-zinc-100">✕</button></div>)}</div>}
        <div className="flex gap-2"><Button onClick={()=>go("ZONES")}>Back</Button><Button onClick={()=>go("ROTATION")} >Continue</Button></div>
      </Card>
    );
  };
  const Rotation=()=> {
    function setZoneForDay(day:DayOfWeek, zoneId:string){ set({rotation: s.rotation.map(slt=> slt.day===day ? {...slt, zoneId}: slt)}); }
    return (
      <Card title="Weekly Rotation">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.rotation.map(slt=>(
            <div key={slt.day} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-sm font-semibold mb-2">{slt.day}</div>
              <select className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                value={slt.zoneId ?? ""} onChange={e=>setZoneForDay(slt.day, e.target.value)}>
                <option value="">— Zone —</option>
                {s.zones.map(z=><option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-2"><Button onClick={()=>go("TASKS")}>Back</Button><Button onClick={()=>go("BLUEPRINT")}>Continue</Button></div>
      </Card>
    );
  };
  const Blueprint=()=> {
    const bp=useMemo(()=>({scope:"HOME", module:"CLEANING", household:s.householdName, anchorDay:s.anchorDay, zones:s.zones, tasks:s.tasks, rotation:s.rotation, generatedAt:new Date().toISOString(), version:1}),[s]);
    async function seedApis(){ try{ await fetch("/api/ship/home/cleaning",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:bp})}); }catch{} try{ await fetch("/api/ship/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:[
      { text:`Have you done today’s cleaning zone?`, schedule:`DAILY 10:00` },
      { text:`Have you planned weekly deep-clean for ${s.anchorDay}?`, schedule:`${s.anchorDay} 11:00` },
    ]})}); }catch{} }
    function download(){ const blob=new Blob([JSON.stringify(bp,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${s.householdName||"home-cleaning"}-blueprint.json`; a.click(); URL.revokeObjectURL(url); }
    return (
      <Card title="Cleaning Blueprint">
        <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{JSON.stringify(bp,null,2)}</pre>
        <div className="flex gap-2"><Button onClick={download}>Download JSON</Button><Button onClick={seedApis}>Seed APIs</Button><Button onClick={()=>go("SUCCESS")}>Confirm & Finish</Button></div>
      </Card>
    );
  };
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      {s.step==="WELCOME"&&<Welcome/>}
      {s.step==="ZONES"&&<Zones/>}
      {s.step==="TASKS"&&<Tasks/>}
      {s.step==="ROTATION"&&<Rotation/>}
      {s.step==="BLUEPRINT"&&<Blueprint/>}
      {s.step==="SUCCESS"&&<Card title="Cleaning Rhythm Ready 🎉"><p className="text-sm text-zinc-300">Prompts and weekly rotation are live.</p></Card>}
    </div>
  );
}