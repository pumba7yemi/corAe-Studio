export async function sendEmail(msg){
  const fs = await import('node:fs'); const path = await import('node:path');
  const out = path.join(process.cwd(),'data','cims','outbox', msg.id+'.eml');
  const raw = ["To: "+msg.to, "Subject: "+msg.subject, "", msg.body].join("\n");
  fs.writeFileSync(out, raw); return {ok:true, path:out};
}