export async function sendWhats(msg){
  const fs = await import('node:fs'); const path = await import('node:path');
  const out = path.join(process.cwd(),'data','cims','outbox', msg.id+'.txt');
  const raw = ["WA to "+msg.to, msg.body].join("\n");
  fs.writeFileSync(out, raw); return {ok:true, path:out};
}