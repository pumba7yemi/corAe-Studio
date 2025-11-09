// apps/studio/app/ship/home/onboarding/wizard/wardrobe/page.tsx
"use client";
/**
 * corAe • Home • Onboarding • Wardrobe
 * Inventory, laundry cycle, outfit planning.
 * Seeds: /api/ship/home/wardrobe (+Have-You prompts)
 */
import React, { useMemo, useState } from "react";
type Step="WELCOME"|"INVENTORY"|"LAUNDRY"|"OUTFITS"|"BLUEPRINT"|"SUCCESS";
interface Garment{ id:string; name:string; type:string; color?:string; tags?:string[] }
interface Laundry{ day:"SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT"; cutoff?:string } // time
interface Outfit{ id:string; name:string; items:string[] } // garment ids
interface State{ step:Step; householdName:string; inventory:Garment[]; laundry:Laundry[]; outfits:Outfit[]; blueprintJson:string }
const rid=(p="id")=>`${p}_`+Math.random().toString(36).slice(2,10);
const Input=(p:React.InputHTMLAttributes<HTMLInputElement>)=><input {...p} className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder-zinc-500 focus:ring-2 focus:ring-zinc-600 ${p.className??""}`} />;
const Button=({children,onClick}:{children:React.ReactNode;onClick?:()=>void})=><button onClick={onClick} className="rounded-xl bg-zinc-100 text-zinc-950 px-4 py-2 text-sm font-medium">{children}</button>;
const Card=({title,children}:{title:string;children:React.ReactNode})=><section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 space-y-4">{children}</div></section>;
export default function WardrobeWizard(){
  const [s,setS]=useState<State>({step:"WELCOME",householdName:"",inventory:[],laundry:[{day:"THU",cutoff:"20:00"} as any],outfits:[],blueprintJson:""});
  const set=(p:Partial<State>)=>setS(x=>({...x,...p})); const go=(step:Step)=>set({step});
  const Welcome=()=>(
    <Card title="Welcome — Wardrobe">
      <Input placeholder="Household name" value={s.householdName} onChange={e=>set({householdName:(e.target as HTMLInputElement).value})}/>
      <Button onClick={()=>go("INVENTORY")} >Start</Button>
    </Card>
  );
  const Inventory=()=> {
    const [name,setName]=useState(""); const [type,setType]=useState(""); const [color,setColor]=useState(""); const [tags,setTags]=useState("");
    const add=()=>{ if(!name.trim()||!type.trim())return; set({inventory:[...s.inventory,{id:rid("g"),name:name.trim(),type:type.trim(),color:color.trim()||undefined,tags:tags.split(",").map(t=>t.trim()).filter(Boolean)}]}); setName(""); setType(""); setColor(""); setTags(""); };
    const remove=(id:string)=> set({inventory:s.inventory.filter(x=>x.id!==id)});
    return (
      <Card title="Inventory">
        <div className="grid gap-3 sm:grid-cols-5">
          <Input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <Input placeholder="Type (shirt, dress…)" value={type} onChange={e=>setType(e.target.value)} />
          <Input placeholder="Color" value={color} onChange={e=>setColor(e.target.value)} />
          <Input placeholder="Tags (summer, formal…)" value={tags} onChange={e=>setTags(e.target.value)} />
          <Button onClick={add}>+ Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">{s.inventory.map(g=><span key={g.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">{g.name} • {g.type}<button onClick={()=>remove(g.id)} className="text-zinc-400 hover:text-zinc-100">✕</button></span>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("WELCOME")}>Back</Button><Button onClick={()=>go("LAUNDRY")}>Continue</Button></div>
      </Card>
    );
  };
  const LaundryStep=()=> {
    const [day,setDay]=useState<"SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT">("THU"); const [cutoff,setCutoff]=useState("20:00");
    const add=()=> set({laundry:[...s.laundry,{day,cutoff}]}); const remove=(i:number)=> set({laundry: s.laundry.filter((_,idx)=>idx!==i)});
    return (
      <Card title="Laundry Cycle">
        <div className="grid gap-3 sm:grid-cols-4">
          <select className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" value={day} onChange={e=>setDay(e.target.value as any)}>
            {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <Input placeholder="Cutoff (HH:MM)" value={cutoff} onChange={e=>setCutoff(e.target.value)} />
          <div className="sm:col-span-2"><Button onClick={add}>+ Add Laundry Day</Button></div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">{s.laundry.map((l,i)=><span key={i} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs">{l.day} • {l.cutoff}<button onClick={()=>remove(i)} className="text-zinc-400 hover:text-zinc-100">✕</button></span>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("INVENTORY")}>Back</Button><Button onClick={()=>go("OUTFITS")}>Continue</Button></div>
      </Card>
    );
  };
  const Outfits=()=> {
    const [name,setName]=useState(""); const [selected,setSelected]=useState<string[]>([]);
    const toggle=(id:string)=> setSelected(prev=> prev.includes(id)? prev.filter(x=>x!==id) : [...prev,id]);
    const add=()=>{ if(!name.trim()||selected.length===0) return; set({outfits:[...s.outfits,{id:rid("o"),name:name.trim(),items:selected}]}); setName(""); setSelected([]); };
    const remove=(id:string)=> set({outfits:s.outfits.filter(x=>x.id!==id)});
    return (
      <Card title="Outfit Planning">
        <Input placeholder="Outfit name" value={name} onChange={e=>setName(e.target.value)} />
        <div className="flex flex-wrap gap-2">{s.inventory.map(g=><button key={g.id} onClick={()=>toggle(g.id)} className={`rounded-full border px-3 py-1 text-xs ${selected.includes(g.id)?"border-zinc-200 bg-zinc-100 text-zinc-950":"border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900"}`}>{g.name}</button>)}</div>
        <Button onClick={add}>+ Save Outfit</Button>
        <div className="space-y-2 pt-2">{s.outfits.map(o=><div key={o.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{o.name} • {o.items.length} items<button onClick={()=>remove(o.id)} className="ml-2 text-zinc-400 hover:text-zinc-100">✕</button></div>)}</div>
        <div className="flex gap-2"><Button onClick={()=>go("LAUNDRY")}>Back</Button><Button onClick={()=>go("BLUEPRINT")}>Continue</Button></div>
      </Card>
    );
  };
  const Blueprint=()=> {
    const bp=useMemo(()=>({scope:"HOME", module:"WARDROBE", household:s.householdName, inventory:s.inventory, laundry:s.laundry, outfits:s.outfits, generatedAt:new Date().toISOString(), version:1}),[s]);
    async function seedApis(){ try{ await fetch("/api/ship/home/wardrobe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"seedFromBlueprint",blueprint:bp})}); }catch{} try{ await fetch("/api/ship/home/haveyou",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"bulkUpsert",items:[
      { text:`Have you prepped tomorrow’s outfit?`, schedule:`DAILY 21:00` },
      { text:`Have you started laundry for today’s slot?`, schedule:`DAILY 19:00` },
    ]})}); }catch{} }
    return (
      <Card title="Wardrobe Blueprint">
        <pre className="max-h-96 overflow-auto rounded-xl border border-zinc-800 bg-black/60 p-4 text-xs">{JSON.stringify(bp,null,2)}</pre>
        <div className="flex gap-2"><Button onClick={seedApis}>Seed APIs</Button><Button onClick={()=>go("SUCCESS")}>Confirm & Finish</Button></div>
      </Card>
    );
  };
  return (
  <div className="min-h-dvh bg-zinc-950 text-zinc-100 p-8">
      {s.step==="WELCOME"&&<Welcome/>}
      {s.step==="INVENTORY"&&<Inventory/>}
      {s.step==="LAUNDRY"&&<LaundryStep/>}
      {s.step==="OUTFITS"&&<Outfits/>}
      {s.step==="BLUEPRINT"&&<Blueprint/>}
      {s.step==="SUCCESS"&&<Card title="Wardrobe Setup Complete 🎉"><p className="text-sm text-zinc-300">Prompts are live.</p></Card>}
    </div>
  );
}