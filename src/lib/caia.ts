import fs from "node:fs/promises";
import path from "node:path";

export const CAIA = {
  engineRoot: process.env.CAIA_ENGINE_ROOT!,
  memoryFile: process.env.CAIA_MEMORY_FILE!,
  indexFile: process.env.CAIA_INDEX_FILE!,
  beatFile: process.env.CAIA_HEARTBEAT_FILE!,
};

async function ensureDirs() {
  await fs.mkdir(path.dirname(CAIA.memoryFile), { recursive: true });
  await fs.mkdir(path.dirname(CAIA.indexFile), { recursive: true });
  await fs.mkdir(path.dirname(CAIA.beatFile), { recursive: true });
}

export type MemoryItem = {
  id: string; ts: string; who: "owner"|"agent"; type: "note"|"fact"|"todo"|"event"; text: string; tags?: string[];
};

export async function appendMemory(item: MemoryItem) {
  await ensureDirs();
  const line = JSON.stringify(item) + "\n";
  await fs.appendFile(CAIA.memoryFile, line, "utf8");
  const idxRaw = await fs.readFile(CAIA.indexFile, "utf8").catch(()=>"{\"lastRebuild\":null,\"count\":0,\"terms\":{}}");
  const idx = JSON.parse(idxRaw);
  const tokens = (item.text.toLowerCase().match(/[a-z0-9]+/g) || []);
  for (const t of tokens) idx.terms[t] = (idx.terms[t] || 0) + 1;
  idx.count = (idx.count || 0) + 1;
  idx.lastRebuild = new Date().toISOString();
  await fs.writeFile(CAIA.indexFile, JSON.stringify(idx, null, 2), "utf8");
}

export async function searchMemory(query: string, limit = 50) {
  await ensureDirs();
  const q = (query || "").toLowerCase().match(/[a-z0-9]+/g) || [];
  const content = await fs.readFile(CAIA.memoryFile, "utf8").catch(()=> "");
  const lines = content.split("\n").filter(Boolean);
  const out: any[] = [];
  for (const line of lines) { try { out.push(JSON.parse(line)); } catch {} }
  const scored = out.map(o => {
    const text = String(o.text||"").toLowerCase();
    let s = 0; for (const t of q) if (text.includes(t)) s++;
    return { s, o };
  }).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0, limit).map(x=>x.o);
  return scored;
}

export async function heartbeat(status: "online"|"offline"|"busy"="online") {
  await ensureDirs();
  const beat = { agent:"CAIA", status, lastBeat: new Date().toISOString() };
  await fs.writeFile(CAIA.beatFile, JSON.stringify(beat, null, 2), "utf8");
  return beat;
}

export async function dailySummarize(): Promise<{summary:string, count:number}> {
  await ensureDirs();
  const content = await fs.readFile(CAIA.memoryFile, "utf8").catch(()=> "");
  const today = new Date().toISOString().slice(0,10);
  const lines = content.split("\n").filter(Boolean);
  const todays = lines.map(l=>{ try { return JSON.parse(l);} catch { return null; } })
                      .filter(x=>x && String(x.ts).startsWith(today));
  const summary = [
    `CAIA Daily — ${today}`,
    `Items: ${todays.length}`,
    ...todays.slice(-10).map((x:any)=>`- [${x.type}] ${x.text}`) // last 10
  ].join("\n");
  const item: MemoryItem = { id: today+"_summary", ts: new Date().toISOString(), who:"agent", type:"event", text: summary, tags:["daily","summary"] };
  await appendMemory(item);
  return { summary, count: todays.length };
}
