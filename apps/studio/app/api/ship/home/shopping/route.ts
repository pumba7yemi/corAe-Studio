// apps/studio/app/api/ship/home/shopping/route.ts
import { NextRequest, NextResponse } from "next/server";

// Mirror of Business vendors, simplified for HomeGro™
type DayOfWeek="SUN"|"MON"|"TUE"|"WED"|"THU"|"FRI"|"SAT";
interface Vendor { id:string; name:string; contact?:string; cycle?:{ anchor:DayOfWeek; days:number }; priority?:number; note?:string }
interface ListItem { id:string; name:string; qty:number; unit?:string; vendorId?:string; urgent?:boolean }

interface Blueprint {
  scope:"HOME"; module:"SHOPPING";
  household:string; anchorDay:DayOfWeek;
  vendors:Vendor[]; list:ListItem[];
  generatedAt:string; version:1;
}

const mem = { bp: null as Blueprint | null };

export async function GET() { return NextResponse.json({ ok:true, blueprint: mem.bp }); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));
  if (body.action === "seedFromBlueprint") { mem.bp = body.blueprint as Blueprint; return NextResponse.json({ ok:true }); }
  return NextResponse.json({ ok:false, error:"Unknown action" }, { status:400 });
}