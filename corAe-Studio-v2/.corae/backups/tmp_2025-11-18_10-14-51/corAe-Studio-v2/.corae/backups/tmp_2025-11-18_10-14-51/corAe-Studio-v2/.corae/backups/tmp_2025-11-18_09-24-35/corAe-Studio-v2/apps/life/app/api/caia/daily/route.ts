import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const V2 = path.resolve(process.cwd());
const dir = path.join(V2, '.corae');
const file = path.join(dir, 'user-daily-check.json');

async function ensureDir() {
  try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch(e) {}
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    await ensureDir();
    const entry = { id: Date.now(), ts: new Date().toISOString(), payload };
    const arr = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,'utf8')) : [];
    arr.push(entry);
    fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(file)) return NextResponse.json({ ok: true, entries: [] });
    const data = JSON.parse(fs.readFileSync(file,'utf8'));
    return NextResponse.json({ ok: true, entries: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
