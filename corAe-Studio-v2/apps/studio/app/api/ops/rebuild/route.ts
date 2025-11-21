import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CAIA_DIR = path.resolve(process.cwd(), "corAe-Studio-v2", ".corae");
const OPS_DIR = path.join(CAIA_DIR, "ops");
const REQ_FILE = path.join(OPS_DIR, "rebuild-requests.json");

async function ensureDir(){
  try{ await fs.promises.mkdir(OPS_DIR, { recursive: true }); }catch{}
}

export async function POST(req: Request){
  try{
    const body = await req.json();
    await ensureDir();
    let existing:any[] = [];
    try{ const raw = await fs.promises.readFile(REQ_FILE, "utf-8"); existing = JSON.parse(raw); }catch{}
    const entry = { id: Date.now(), ts: new Date().toISOString(), requestedBy: body.requestedBy ?? "web", note: body.note ?? null, meta: body.meta ?? {} };
    existing.push(entry);
    await fs.promises.writeFile(REQ_FILE, JSON.stringify(existing, null, 2), "utf-8");
    return NextResponse.json({ ok:true, enqueued: entry });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: String(e?.message ?? e) }, { status:500 });
  }
}

export async function GET(){
  try{
    await ensureDir();
    try{ const raw = await fs.promises.readFile(REQ_FILE, "utf-8"); const existing = JSON.parse(raw); return NextResponse.json({ ok:true, requests: existing }); }catch{ return NextResponse.json({ ok:true, requests: [] }); }
  }catch(e:any){
    return NextResponse.json({ ok:false, error: String(e?.message ?? e) }, { status:500 });
  }
}
