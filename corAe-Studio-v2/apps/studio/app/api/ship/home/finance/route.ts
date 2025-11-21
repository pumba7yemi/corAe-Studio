// apps/studio/app/api/home/finance/route.ts
import { NextRequest, NextResponse } from "next/server";

type Frequency = "WEEKLY" | "MONTHLY" | "ADHOC";
type DayOfWeek = "SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";

interface Income { id:string; source:string; amount:number; freq:Frequency; day?:DayOfWeek; note?:string }
interface Budget { id:string; category:string; amount:number; freq:Frequency }
interface Bill   { id:string; name:string; amount:number; dueDay:number; reminderDay?:number; channel?: "CARD"|"BANK"|"CASH"|"OTHER"; note?:string }
interface SavingGoal { id:string; name:string; target:number; perPeriod:number; freq:Frequency; note?:string }

interface Blueprint {
  scope:"HOME"; module:"FINANCE";
  household:string; anchorDay:DayOfWeek;
  incomes:Income[]; budgets:Budget[]; bills:Bill[]; goals:SavingGoal[];
  generatedAt:string; version:1;
}

const mem = { bp: null as Blueprint | null };

export async function GET() {
  return NextResponse.json({ ok:true, blueprint: mem.bp });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "seedFromBlueprint") {
    mem.bp = body.blueprint as Blueprint;
    return NextResponse.json({ ok:true });
  }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}
