// apps/studio/app/api/home/glamglow/route.ts
import { NextRequest, NextResponse } from "next/server";

type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Routine{ id:string; name:string; steps:string[] }
interface Slot{ day:DayOfWeek; time:string; routineId?:string }
interface Product{ id:string; name:string; vendor?:string; reorderAt?:number }

interface Blueprint {
  scope:"HOME"; module:"GLAMGLOW";
  profile:string; routines:Routine[]; schedule:Slot[]; products:Product[];
  generatedAt:string; version:1;
}

const mem = { bp: null as Blueprint | null };

export async function GET() { return NextResponse.json({ ok:true, blueprint: mem.bp }); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "seedFromBlueprint") { mem.bp = body.blueprint as Blueprint; return NextResponse.json({ ok:true }); }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}
