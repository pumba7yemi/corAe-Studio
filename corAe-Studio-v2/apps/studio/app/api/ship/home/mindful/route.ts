// apps/studio/app/api/ship/home/mindful/route.ts
import { NextRequest, NextResponse } from "next/server";

type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Pillar{ id:string; name:string; checklist:string[] }
interface Slot{ day:DayOfWeek; time:string; pillarId?:string }
interface Prompt{ id:string; text:string; schedule:string }

interface Blueprint {
  scope:"HOME"; module:"MINDFUL";
  household:string; pillars:Pillar[]; schedule:Slot[]; prompts:Prompt[];
  generatedAt:string; version:1;
}

const mem = { bp: null as Blueprint | null };

export async function GET() { return NextResponse.json({ ok:true, blueprint: mem.bp }); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "seedFromBlueprint") { mem.bp = body.blueprint as Blueprint; return NextResponse.json({ ok:true }); }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}