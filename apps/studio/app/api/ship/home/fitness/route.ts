// apps/studio/app/api/ship/home/fitness/route.ts
import { NextRequest, NextResponse } from "next/server";

type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Goal{ id:string; name:string; target:string }
interface Plan{ id:string; name:string; weeks:number; daysPerWeek:number }
interface Session{ id:string; day:DayOfWeek; time:string; planId?:string; notes?:string }

interface Blueprint {
  scope:"HOME"; module:"FITNESS";
  profile:string; goals:Goal[]; plan?:Plan; sessions:Session[];
  generatedAt:string; version:1;
}

const mem = { bp: null as Blueprint | null };

export async function GET() { return NextResponse.json({ ok:true, blueprint: mem.bp }); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "seedFromBlueprint") { mem.bp = body.blueprint as Blueprint; return NextResponse.json({ ok:true }); }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}