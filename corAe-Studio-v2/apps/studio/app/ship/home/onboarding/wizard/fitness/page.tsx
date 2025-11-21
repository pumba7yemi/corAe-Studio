// apps/studio/app/home/onboarding/wizard/fitness/page.tsx
"use client";
/**
 * corAe â€¢ Home â€¢ Onboarding â€¢ Fitness
 * Plans, targets, sessions & recovery.
 * Seeds: /api/home/fitness (+Have-You prompts)
 */
import React, { useMemo, useState } from "react";
type Step="WELCOME"|"GOALS"|"PLAN"|"SESSIONS"|"BLUEPRINT"|"SUCCESS";
type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Goal{ id:string; name:string; target:string }
interface Plan{ id:string; name:string; weeks:number; daysPerWeek:number }
interface Session{ id:string; day:DayOfWeek; time:string; planId?:string; notes?:string }
interface State{ step:Step; profileName:string; goals:Goal[]; plan?:Plan; sessions:Session[]; blueprintJson:string }
const rid=(p="id")=>`${p}_`+Math.random().toString(36).slice(2,10);
const DAYS:DayOfWeek[]=["SUN","MON","TUE","WED","THU","FRI","SAT"];
const Input=(p:React.InputHTMLAttributes<HTMLInputElement>)=> <input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Button=({children,onClick,disabled}:{children:React.ReactNode;onClick?:()=>void;disabled?:boolean})=> <button onClick={onClick} disabled={disabled} className={`rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium ${disabled?"opacity-50 cursor-not-allowed":""}`}>{children}</button>;
const Card=({title,children}:{title:string;children:React.ReactNode})=> <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 space-y-4">{children}</div></section>;
export default function FitnessWizard(){
  const [s,setS]=useState<State>({step:"WELCOME",profileName:"",goals:[],plan:undefined,sessions:[],blueprintJson:""});
  const set=(p:Partial<State>)=>setS(x=>({...x,...p})); const go=(step:Step)=>set({step});
  const Welcome=()=>(
    <Card title="Welcome â€” Fitness">
      <Input placeholder="Profile name" value={s.profileName} onChange={e=>set({profileName:(e.target as HTMLInputElement).value})}/>
      <Button onClick={()=>go("GOALS")}>Start</Button>
    </Card>
  );
  const Goals=()=> {
    const [name,setName]=useState(""); const [target,setTarget]=useState("");
    const add=()=>{ if(!name.trim()||!target.trim()) return; set({goals:[...s.goals,{id:rid("g"),name:name.trim(),target:target.trim()}]}); setName(""); setTarget(""); };
    const remove=(id:string)=> set({goals:s.goals.filter(x=>x.id!==id)});
    return (
      <Card title="Goals">
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Goal" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Target (e.g., 5km 3x/week)" value={target} onChange={e=>setTarget(e.target.value)} />
          <div className="sm:col-span-2"><Button onClick={add}>+ Add Goal</Button></div>
        </div>
        <div className="space-y-2 pt-2">{s.goals.map(g=><div key={g.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{g.name} â€¢ {g.target}<button onClick={()=>remove(g.id)} className="ml-2 text-zinc-400 hover:text-zinc-100">âœ•</button></div>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("WELCOME")}>Back</Button><Button onClick={()=>go("PLAN")} disabled={s.goals.length===0}>Continue</Button></div>
      </Card>
    );
  };
  const PlanStep=()=> {
    const [name,setName]=useState(""); const [weeks,setWeeks]=useState("8"); const [dpw,setDpw]=useState("3");
    const commit=()=> set({plan:{id:rid("p"),name:name.trim()||"Base Plan",weeks:Number(weeks||"8"),daysPerWeek:Number(dpw||"3")}});
    return (
      <Card title="Plan">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Plan name" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Weeks" value={weeks} onChange={e=>setWeeks(e.target.value)} />
          <Input placeholder="Days per week" value={dpw} onChange={e=>setDpw(e.target.value)} />
        </div>
        <div className="flex gap-2"><Button onClick={()=>go("GOALS")}>Back</Button><Button onClick={()=>{commit(); go("SESSIONS");}}>Continue</Button></div>
      </Card>
    );
  };
  const Sessions=()=> {
    const [time,setTime]=useState("07:00");
    function toggle(day:DayOfWeek){
      const exists=s.sessions.find(ses=>ses.day===day);
      if(exists){ set({sessions:s.sessions.filter(ses=>ses.day!==day)}); }
      else { set({sessions:[...s.sessions,{id:rid("s"),day,time,planId:s.plan?.id}]}); }
    }
    return (
      <Card title="Sessions">
        <Input placeholder="Default time" value={time} onChange={e=>setTime(e.target.value)} />
        <div className="flex flex-wrap gap-2 pt-2">{DAYS.map(d=><button key={d} onClick={()=>toggle(d)} className={`rounded-xl border px-3 py-1 text-sm ${s.sessions.find(x=>x.day===d)?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>{d}</button>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("PLAN")}>Back</Button><Button onClick={()=>go("BLUEPRINT")} disabled={s.sessions.length===0}>Continue</Button></div>
      </Card>
    );
  };
  const Blueprint=()=> {
    const bp=useMemo(()=>({scope:"HOME", module:"FITNESS", profile:s.profileName, goals:s.goals, plan:s.plan, sessions:s.sessions, generatedAt:new Date().toISOString(), version:1}),[s]);
    async function seedApis(){ try{ await fetch("/api/home/fitness",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:bp})}); }catch{} try{ await fetch("/api/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:[
      { text:`Have you completed todayâ€™s workout?`, schedule:`DAILY 20:00` },
      { text:`Have you planned this weekâ€™s sessions?`, schedule:`SUN 18:00` },
    ]})}); }catch{} }
    return (
      <Card title="Fitness Blueprint">
        <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{JSON.stringify(bp,null,2)}</pre>
        <div className="flex gap-2"><Button onClick={seedApis}>Seed APIs</Button><Button onClick={()=>go("SUCCESS")}>Confirm & Finish</Button></div>
      </Card>
    );
  };
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      {s.step==="WELCOME"&&<Welcome/>}
      {s.step==="GOALS"&&<Goals/>}
      {s.step==="PLAN"&&<PlanStep/>}
      {s.step==="SESSIONS"&&<Sessions/>}
      {s.step==="BLUEPRINT"&&<Blueprint/>}
      {s.step==="SUCCESS"&&<Card title="Fitness Setup Complete ðŸŽ‰"><p className="text-sm text-zinc-300">Prompts are live.</p></Card>}
    </div>
  );
}
