// apps/studio/app/api/ship/home/mealprep/route.ts
import { NextRequest, NextResponse } from "next/server";

type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface PantryItem{ id:string; name:string; qty:number; unit?:string; expires?:string; tags?:string[] }
interface Prefs{ diet:string[]; dislikes:string[]; allergies:string[] }
interface Meal{ id:string; title:string; tags:string[]; vendorLink?:string }
interface DayPlan{ day:DayOfWeek; meals:{time:"BREAKFAST"|"LUNCH"|"DINNER"|"SNACK"; mealId?:string}[] }

interface Blueprint {
  scope:"HOME"; module:"MEALPREP";
  household:string; anchorDay:DayOfWeek;
  pantry:PantryItem[]; prefs:Prefs; library:Meal[]; rotation:DayPlan[];
  generatedAt:string; version:1;
}

const mem = { bp: null as Blueprint | null };

export async function GET() { return NextResponse.json({ ok:true, blueprint: mem.bp }); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "seedFromBlueprint") { mem.bp = body.blueprint as Blueprint; return NextResponse.json({ ok:true }); }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}