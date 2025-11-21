"use client";
import React, { useEffect, useState } from "react";
import HomeSectionLayout, { Card, Btn, Input, Chip } from "../_shared/HomeSectionLayout";
import { loadDraft, saveDraft } from "../_shared/homeDraft";

const KEY = "fitness";
type Item = { id: string; title: string };

export default function FitnessPage() {
  const [items,setItems]=useState<Item[]>([]);
  const [text,setText]=useState("");

  useEffect(()=>{ const d=loadDraft<Record<string, any>>(); setItems(Array.isArray(d[KEY])?d[KEY]:[]); },[]);
  const add=()=>{ if(!text.trim())return;
    const next=[...items,{id:crypto.randomUUID?.()??Math.random().toString(36),title:text.trim()}];
    setItems(next); saveDraft(p=>({...p,[KEY]:next})); setText(""); };
  const remove=(id:string)=>{ const next=items.filter(i=>i.id!==id); setItems(next); saveDraft(p=>({...p,[KEY]:next})); };

  return (
    <HomeSectionLayout title="Home • Fitness" hint="Workouts & habits">
      <Card title="Fitness Plan">
        <div className="flex gap-2">
          <Input placeholder="e.g., 20m walk after dinner" value={text} onChange={e=>setText(e.target.value)} />
          <Btn variant="secondary" onClick={add}>+ Add</Btn>
        </div>
        {items.length>0&&<div className="mt-3 flex flex-wrap gap-2">{items.map(i=><Chip key={i.id} onRemove={()=>remove(i.id)}>{i.title}</Chip>)}</div>}
      </Card>
    </HomeSectionLayout>
  );
}
