/* eslint-disable */
// apps/studio/app/home/onboarding/wizard/mealprep/page.tsx
"use client";
/**
 * corAe â€¢ Home â€¢ Onboarding â€¢ Meal Prep
 * 28-day rotation, pantry-first usage, vendor tie-in.
 * Seeds: /api/home/mealprep (+Have-You prompts)
 */
import React, { useEffect, useMemo, useState } from "react";
import EthosCard from "../../../../../components/EthosCard";
type Step="WELCOME"|"PANTRY"|"PREFERENCES"|"ROTATION"|"PLAN"|"BLUEPRINT"|"SUCCESS";
type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface PantryItem{ id:string; name:string; qty:number; unit?:string; expires?:string; tags?:string[] }
interface Prefs{ diet:string[]; dislikes:string[]; allergies:string[] }
interface Meal{ id:string; title:string; tags:string[]; vendorLink?:string }
interface DayPlan{ day:DayOfWeek; meals:{time:"BREAKFAST"|"LUNCH"|"DINNER"|"SNACK"; mealId?:string}[] }
interface State{ step:Step; householdName:string; anchorDay:DayOfWeek; pantry:PantryItem[]; prefs:Prefs; library:Meal[]; rotation:DayPlan[]; blueprintJson:string; savedAt?:string|null }
const rid=(p="id")=>(typeof crypto!=="undefined"&&"randomUUID"in crypto?`${p}_${(crypto as any).randomUUID()}`:`${p}_`+Math.random().toString(36).slice(2,10));
const DAYS:DayOfWeek[]=["SUN","MON","TUE","WED","THU","FRI","SAT"];
const saveLocal=(k:string,s:any)=>{localStorage.setItem(k,JSON.stringify({...s,savedAt:new Date().toISOString()}));};
const loadLocal=(k:string)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):null}catch{return null}};
const LOCAL_KEY="corAeHomeWizard/mealprep";
const Input=(p:React.InputHTMLAttributes<HTMLInputElement>)=><input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Button=({children,onClick,variant="primary",disabled}:{children:React.ReactNode;onClick?:()=>void;variant?:"primary"|"secondary"|"ghost"|"danger";disabled?:boolean})=>{
  const base="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const map={primary:`${base} bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50`,secondary:`${base} bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50`,ghost:`${base} text-zinc-300 hover:bg-zinc-800/70`,danger:`${base} bg-red-600 text-white hover:bg-red-500 disabled:opacity-50`} as const;
  return <button onClick={onClick} disabled={disabled} className={map[variant]}>{children}</button>;
};
const Card=({title,hint,children}:{title:string;hint?:string;children:React.ReactNode})=><section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2>{hint&&<p className="mt-1 text-sm text-zinc-400">{hint}</p>}<div className="mt-4 space-y-4">{children}</div></section>;
const Row=({children}:{children:React.ReactNode})=><div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>;
export default function MealPrepWizard(){
  const [s,setS]=useState<State>({step:"WELCOME",householdName:"",anchorDay:"THU",pantry:[],prefs:{diet:[],dislikes:[],allergies:[]},library:[],rotation:[],blueprintJson:"",savedAt:null});
  const set=(p:Partial<State>)=>setS(x=>({...x,...p})); const go=(step:Step)=>set({step});
  useEffect(()=>{const d=loadLocal(LOCAL_KEY); if(d) setS(d);},[]);
  const save=()=>saveLocal(LOCAL_KEY,s);

  const Welcome=()=>(
    <Card title="Welcome" hint="Plan a 28-day meal rotation that uses pantry stock first.">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="text-sm font-medium text-zinc-200">Household name</label>
          <Input value={s.householdName} onChange={e=>set({householdName:(e.target as HTMLInputElement).value})} placeholder="e.g., The Adamson Household"/></div>
        <div><label className="text-sm font-medium text-zinc-200">Weekly anchor</label>
          <div className="flex flex-wrap gap-2 pt-2">{DAYS.map(d=><button key={d} onClick={()=>set({anchorDay:d})} className={`rounded-xl border px-3 py-1 text-sm ${s.anchorDay===d?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>{d}</button>)}</div>
        </div>
      </div>
      <Button onClick={()=>go("PANTRY")} disabled={!s.householdName}>Start</Button>
    </Card>
  );

  const Pantry=()=> {
    const [name,setName]=useState(""); const [qty,setQty]=useState(""); const [unit,setUnit]=useState("pack"); const [exp,setExp]=useState(""); const [tags,setTags]=useState("");
    const add=()=>{ if(!name.trim())return; set({pantry:[...s.pantry,{id:rid("p"),name:name.trim(),qty:Number(qty||1),unit:unit.trim()||undefined,expires:exp||undefined,tags:tags.split(",").map(t=>t.trim()).filter(Boolean)}]}); setName(""); setQty(""); setUnit("pack"); setExp(""); setTags(""); };
    const remove=(id:string)=> set({pantry:s.pantry.filter(x=>x.id!==id)});
    return (
      <Card title="Pantry / Fridge" hint="List current items. corAe will rotate oldest first.">
        <div className="grid gap-3 sm:grid-cols-6">
          <Input placeholder="Item name" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)} />
          <Input placeholder="Unit" value={unit} onChange={e=>setUnit(e.target.value)} />
          <Input placeholder="Expiry (YYYY-MM-DD)" value={exp} onChange={e=>setExp(e.target.value)} />
          <Input placeholder="Tags (comma)" value={tags} onChange={e=>setTags(e.target.value)} />
          <Button variant="secondary" onClick={add}>+ Add</Button>
        </div>
        {s.pantry.length>0 && <div className="flex flex-wrap gap-2 pt-2">{s.pantry.map(i=><span key={i.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">{i.name} â€¢ {i.qty}{i.unit?` ${i.unit}`:""}{i.expires?` â€¢ exp ${i.expires}`:""}</span>)}</div>}
        <Row><Button variant="ghost" onClick={()=>go("WELCOME")}>Back</Button><Button onClick={()=>go("PREFERENCES")} disabled={s.pantry.length===0}>Continue</Button></Row>
      </Card>
    );
  };

  const Preferences=()=> {
    const [diet,setDiet]=useState(""); const [dis,setDis]=useState(""); const [all,setAll]=useState("");
    const commit=()=> set({prefs:{diet:diet.split(",").map(x=>x.trim()).filter(Boolean),dislikes:dis.split(",").map(x=>x.trim()).filter(Boolean),allergies:all.split(",").map(x=>x.trim()).filter(Boolean)}}); 
    return (
      <Card title="Preferences" hint="Diet, dislikes, allergies (comma-separated).">
        <Input placeholder="Diet (e.g., halal, pescatarian)" value={diet} onChange={e=>setDiet(e.target.value)} />
        <Input placeholder="Dislikes" value={dis} onChange={e=>setDis(e.target.value)} />
        <Input placeholder="Allergies" value={all} onChange={e=>setAll(e.target.value)} />
        <Row><Button variant="ghost" onClick={()=>go("PANTRY")}>Back</Button><Button onClick={()=>{commit(); go("ROTATION");}}>Continue</Button></Row>
      </Card>
    );
  };

  const Rotation=()=> {
    // seed simple library
    useEffect(()=>{ if(s.library.length===0) set({library:[
      {id:rid("m"), title:"Oats & Fruit", tags:["BREAKFAST","VEG"]},
      {id:rid("m"), title:"Chicken & Rice", tags:["LUNCH","DINNER"]},
      {id:rid("m"), title:"Veggie Stir-Fry", tags:["DINNER","VEG"]},
      {id:rid("m"), title:"Greek Yogurt Bowl", tags:["SNACK","BREAKFAST"]},
    ]}); },[]);
    const makeDay=(d:DayOfWeek):DayPlan=>({day:d, meals:[{time:"BREAKFAST"},{time:"LUNCH"},{time:"DINNER"}]});
    useEffect(()=>{ if(s.rotation.length===0) set({rotation:DAYS.map(makeDay)}); },[s.rotation]);
    const allMeals=s.library;
    function setMeal(day:DayOfWeek, slotIdx:number, mealId:string){
      set({rotation: s.rotation.map(dp => dp.day===day ? {...dp, meals: dp.meals.map((m,i)=> i===slotIdx? {...m, mealId }: m)} : dp)});
    }
    return (
      <Card title="Weekly Rotation" hint="Choose template meals for each day (you can refine later).">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.rotation.map(dp=>(
            <div key={dp.day} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-sm font-semibold mb-2">{dp.day}</div>
              {dp.meals.map((m,i)=>(
                <div key={i} className="mb-2">
                  <div className="text-xs text-zinc-400 mb-1">{m.time}</div>
                  <select className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                    value={m.mealId ?? ""} onChange={e=>setMeal(dp.day,i,e.target.value)}>
                    <option value="">â€” select â€”</option>
                    {allMeals.map(me=> <option key={me.id} value={me.id}>{me.title}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Row><Button variant="ghost" onClick={()=>go("PREFERENCES")}>Back</Button><Button onClick={()=>go("PLAN")}>Continue</Button></Row>
      </Card>
    );
  };

  const Plan=()=> {
    const reminders = useMemo(()=>[
      { text:`Have you prepped todayâ€™s meals?`, schedule:`DAILY 07:00` },
      { text:`Have you reviewed pantry before shopping?`, schedule:`${s.anchorDay} 09:00` },
    ],[s.anchorDay]);
    return (
      <Card title="Prompts & Checks" hint="Weâ€™ll create simple Have-You nudges for meal prep and pantry usage.">
        <ul className="list-disc pl-5 text-sm text-zinc-300">
          {reminders.map((r,i)=><li key={i}>{r.text} â€¢ {r.schedule}</li>)}
        </ul>
        <Row><Button variant="ghost" onClick={()=>go("ROTATION")}>Back</Button><Button onClick={()=>go("BLUEPRINT")}>Continue</Button></Row>
      </Card>
    );
  };

  const Blueprint=()=> {
    const bp = useMemo(()=>({
      scope:"HOME", module:"MEALPREP",
      household:s.householdName, anchorDay:s.anchorDay,
      pantry:s.pantry, prefs:s.prefs, library:s.library, rotation:s.rotation,
      generatedAt:new Date().toISOString(), version:1,
    }),[s]);
    useEffect(()=> set({blueprintJson:JSON.stringify(bp,null,2)}),[bp]);
    async function seedApis(){
      try { await fetch("/api/home/mealprep",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:bp})}); } catch {}
      try { await fetch("/api/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:[
        { text:`Have you prepped todayâ€™s meals?`, schedule:`DAILY 07:00` },
        { text:`Have you reviewed pantry before shopping?`, schedule:`${s.anchorDay} 09:00` },
      ]})}); } catch {}
    }
    function download(){ const blob=new Blob([s.blueprintJson],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${s.householdName||"home-mealprep"}-blueprint.json`; a.click(); URL.revokeObjectURL(url); }
    return (
      <Card title="Meal Plan Blueprint" hint="Seeds pantry, rotation, and prompts.">
        <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{s.blueprintJson}</pre>
        <Row><Button variant="secondary" onClick={download}>Download JSON</Button><Button variant="secondary" onClick={seedApis}>Seed APIs</Button><Button variant="ghost" onClick={()=>go("PLAN")}>Back</Button><Button onClick={()=>go("SUCCESS")}>Confirm & Finish</Button></Row>
      </Card>
    );
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      <div className="mb-6">
        <EthosCard />
      </div>
      {s.step==="WELCOME"&&<Welcome/>}
      {s.step==="PANTRY"&&<Pantry/>}
      {s.step==="PREFERENCES"&&<Preferences/>}
      {s.step==="ROTATION"&&<Rotation/>}
      {s.step==="PLAN"&&<Plan/>}
      {s.step==="BLUEPRINT"&&<Blueprint/>}
      {s.step==="SUCCESS"&&<Card title="Meal Plan Ready ðŸŽ‰" hint="Routines and prompts are live." children={undefined}/>}
      {s.step!=="SUCCESS" && <div className="fixed bottom-4 right-4"><Button variant="secondary" onClick={save}>Save & Continue Later</Button></div>}
    </div>
  );
}
