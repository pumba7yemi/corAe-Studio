// apps/studio/app/home/onboarding/wizard/glamglow/page.tsx
"use client";
/**
 * corAe â€¢ Home â€¢ Onboarding â€¢ Glam & Glow
 * Personal care routines: skincare, hair, salon cadence.
 * Seeds: /api/home/glamglow (+Have-You prompts)
 */
import React, { useMemo, useState } from "react";
type Step="WELCOME"|"ROUTINES"|"SCHEDULE"|"PRODUCTS"|"BLUEPRINT"|"SUCCESS";
type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Routine{ id:string; name:string; steps:string[] }
interface Slot{ day:DayOfWeek; time:string; routineId?:string }
interface Product{ id:string; name:string; vendor?:string; reorderAt?:number /* days left */ }
interface State{ step:Step; profileName:string; routines:Routine[]; schedule:Slot[]; products:Product[]; blueprintJson:string }
const DAYS:DayOfWeek[]=["SUN","MON","TUE","WED","THU","FRI","SAT"];
const rid=(p="id")=>`${p}_`+Math.random().toString(36).slice(2,10);
const Input=(p:React.InputHTMLAttributes<HTMLInputElement>)=> <input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Button=({children,onClick}:{children:React.ReactNode;onClick?:()=>void})=> <button onClick={onClick} className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium">{children}</button>;
const Card=({title,children}:{title:string;children:React.ReactNode})=> <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 space-y-4">{children}</div></section>;
export default function GlamGlowWizard(){
  const [s,setS]=useState<State>({step:"WELCOME",profileName:"",routines:[],schedule:[],products:[],blueprintJson:""});
  const set=(p:Partial<State>)=>setS(x=>({...x,...p})); const go=(step:Step)=>set({step});
  const Welcome=()=>(
    <Card title="Welcome â€” Glam & Glow">
      <Input placeholder="Profile name" value={s.profileName} onChange={e=>set({profileName:(e.target as HTMLInputElement).value})}/>
      <Button onClick={()=>go("ROUTINES")}>Start</Button>
    </Card>
  );
  const Routines=()=> {
    const [name,setName]=useState(""); const [steps,setSteps]=useState("");
    const add=()=>{ if(!name.trim())return; set({routines:[...s.routines,{id:rid("r"),name:name.trim(),steps:steps.split("\n").map(x=>x.trim()).filter(Boolean)}]}); setName(""); setSteps(""); };
    const remove=(id:string)=> set({routines:s.routines.filter(x=>x.id!==id)});
    return (
      <Card title="Routines (AM/PM skin, Hair day, Salon visit)">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Routine name" value={name} onChange={e=>setName(e.target.value)} />
          <textarea placeholder="Steps (one per line)" value={steps} onChange={e=>setSteps(e.target.value)} className="h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"/>
          <Button onClick={add}>+ Add</Button>
        </div>
        <div className="space-y-2 pt-2">{s.routines.map(r=><div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{r.name} â€¢ {r.steps.length} steps<button onClick={()=>remove(r.id)} className="ml-2 text-zinc-400 hover:text-zinc-100">âœ•</button></div>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("WELCOME")}>Back</Button><Button onClick={()=>go("SCHEDULE")}>Continue</Button></div>
      </Card>
    );
  };
  const Schedule=()=> {
    const [day,setDay]=useState<DayOfWeek>("MON"); const [time,setTime]=useState("07:00"); const [ridSel,setRid]=useState(s.routines[0]?.id ?? "");
    const add=()=>{ if(!ridSel) return; set({schedule:[...s.schedule,{day:day,time:time,routineId:ridSel}]}); };
    const remove=(i:number)=> set({schedule:s.schedule.filter((_,idx)=>idx!==i)});
    return (
      <Card title="Schedule">
        <div className="grid gap-3 sm:grid-cols-5">
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={day} onChange={e=>setDay(e.target.value as any)}>{DAYS.map(d=><option key={d} value={d}>{d}</option>)}</select>
          <Input placeholder="HH:MM" value={time} onChange={e=>setTime(e.target.value)} />
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={ridSel} onChange={e=>setRid(e.target.value)}>
            <option value="">â€” Routine â€”</option>
            {s.routines.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="sm:col-span-2"><Button onClick={add}>+ Add Slot</Button></div>
        </div>
        <div className="space-y-2 pt-2">{s.schedule.map((sl,i)=><div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{sl.day} â€¢ {sl.time} â€¢ {s.routines.find(r=>r.id===sl.routineId)?.name}<button onClick={()=>remove(i)} className="ml-2 text-zinc-400 hover:text-zinc-100">âœ•</button></div>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("ROUTINES")}>Back</Button><Button onClick={()=>go("PRODUCTS")}>Continue</Button></div>
      </Card>
    );
  };
  const Products=()=> {
    const [name,setName]=useState(""); const [vendor,setVendor]=useState(""); const [reorder,setReorder]=useState("");
    const add=()=>{ if(!name.trim())return; set({products:[...s.products,{id:rid("p"),name:name.trim(),vendor:vendor.trim()||undefined,reorderAt:reorder?Number(reorder):undefined}]}); setName(""); setVendor(""); setReorder(""); };
    const remove=(id:string)=> set({products:s.products.filter(x=>x.id!==id)});
    return (
      <Card title="Products (optional)">
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Product" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Vendor (link/name)" value={vendor} onChange={e=>setVendor(e.target.value)} />
          <Input placeholder="Reorder at (days left)" value={reorder} onChange={e=>setReorder(e.target.value)} />
          <Button onClick={add}>+ Add</Button>
        </div>
        <div className="space-y-2 pt-2">{s.products.map(p=><div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{p.name}{p.vendor?` â€¢ ${p.vendor}`:""}{p.reorderAt?` â€¢ reorder at ${p.reorderAt}d`:""}<button onClick={()=>remove(p.id)} className="ml-2 text-zinc-400 hover:text-zinc-100">âœ•</button></div>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("SCHEDULE")}>Back</Button><Button onClick={()=>go("BLUEPRINT")}>Continue</Button></div>
      </Card>
    );
  };
  const Blueprint=()=> {
    const bp=useMemo(()=>({scope:"HOME", module:"GLAMGLOW", profile:s.profileName, routines:s.routines, schedule:s.schedule, products:s.products, generatedAt:new Date().toISOString(), version:1}),[s]);
    async function seedApis(){ try{ await fetch("/api/home/glamglow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:bp})}); }catch{} try{ await fetch("/api/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:[
      { text:`Have you completed your routine?`, schedule:`DAILY 21:00` },
      { text:`Have you checked product stock?`, schedule:`WEEKLY MON 18:00` },
    ]})}); }catch{} }
    return (
      <Card title="Glam & Glow Blueprint">
        <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{JSON.stringify(bp,null,2)}</pre>
        <div className="flex gap-2"><Button onClick={seedApis}>Seed APIs</Button><Button onClick={()=>go("SUCCESS")}>Confirm & Finish</Button></div>
      </Card>
    );
  };
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      {s.step==="WELCOME"&&<Welcome/>}
      {s.step==="ROUTINES"&&<Routines/>}
      {s.step==="SCHEDULE"&&<Schedule/>}
      {s.step==="PRODUCTS"&&<Products/>}
      {s.step==="BLUEPRINT"&&<Blueprint/>}
      {s.step==="SUCCESS"&&<Card title="Glam & Glow Ready ðŸŽ‰"><p className="text-sm text-zinc-300">Prompts are live.</p></Card>}
    </div>
  );
}
