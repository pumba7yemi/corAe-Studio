import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const V2 = path.resolve(process.cwd());
const healthFile = path.join(V2, '.corae', 'caia-health.json');
const healthScript = path.join(V2, 'tools', 'caia-health.mjs');

function safeRead(file) {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    let health = safeRead(healthFile);
    if (!health && fs.existsSync(healthScript)) {
      try {
        spawnSync(process.execPath, [healthScript, 'status'], { cwd: V2, stdio: 'inherit' });
        health = safeRead(healthFile);
      } catch (e) {
        // ignore
      }
    }

    if (!health) {
      return NextResponse.json({ status: 'RED', error: 'no health data' }, { status: 500 });
    }

    return NextResponse.json(health);
  } catch (e) {
    return NextResponse.json({ status: 'RED', error: String(e) }, { status: 500 });
  }
}
