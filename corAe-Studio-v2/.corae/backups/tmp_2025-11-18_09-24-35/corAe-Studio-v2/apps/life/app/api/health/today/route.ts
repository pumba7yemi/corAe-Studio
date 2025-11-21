import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DM_DIR = path.resolve(process.cwd(), '.corae');
const DM_PATH = path.join(DM_DIR, 'decision-memory.json');

async function ensureDir() {
  try {
    await fs.promises.mkdir(DM_DIR, { recursive: true });
  } catch (e) {}
}

export async function GET() {
  try {
    const raw = await fs.promises.readFile(DM_PATH, 'utf8');
    const lines = raw.trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj?.type === 'human-health') return NextResponse.json({ ok: true, entry: obj });
      } catch (e) {}
    }
    return NextResponse.json({ ok: true, entry: null });
  } catch (e) {
    return NextResponse.json({ ok: true, entry: null });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    await ensureDir();
    const entry = { type: 'human-health', ts: new Date().toISOString(), payload };
    await fs.promises.appendFile(DM_PATH, JSON.stringify(entry) + '\n', 'utf8');
    return NextResponse.json({ ok: true, entry });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
