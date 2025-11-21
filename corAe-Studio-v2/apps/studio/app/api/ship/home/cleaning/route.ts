// apps/studio/app/api/home/cleaning/route.ts
import { NextRequest, NextResponse } from "next/server";

type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Zone{ id:string; name:string }
interface Task{ id:string; zoneId:string; title:string; freq:"DAILY"|"WEEKLY"|"MONTHLY" }
interface Slot{ day:DayOfWeek; zoneId?:string }

interface Blueprint {
  scope:"HOME"; module:"CLEANING";
  household:string; anchorDay:DayOfWeek;
  zones:Zone[]; tasks:Task[]; rotation:Slot[];
  generatedAt:string; version:1;
}

const mem = { bp: null as Blueprint | null };

export async function GET() { return NextResponse.json({ ok:true, blueprint: mem.bp }); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "seedFromBlueprint") { mem.bp = body.blueprint as Blueprint; return NextResponse.json({ ok:true }); }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}
