import fs from "node:fs"; import path from "node:path";
const P=(...a)=>path.join(process.cwd(),...a);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const inbox=P("data","inbox","emails");
const queue=P("data","workbrain","queue");
const decided=P("data","workbrain","decided");
const drafts=P("data","cims","drafts");
[queue,decided,drafts].forEach(d=>fs.mkdirSync(d,{recursive:true}));

function decide(email){
  const isInvoice=/\binvoice\b|\binv[- ]?\d+/i.test(email.subject||"");
  return {
    id:"w_"+email.id, source:"email",
    kind:isInvoice?"invoice_followup":"note",
    priority:isInvoice?0.7:0.3,
    evidence:{email_id:email.id, subject:email.subject},
    action:isInvoice?"create_comm_draft":"file_note"
  };
}

function toDraft(work){
  return {
    id:"cims_"+work.id,
    template_id: work.kind==="invoice_followup" ? "invoice-reminder" : "note",
    channel: work.kind==="invoice_followup" ? "email" : "note",
    to: "vendor@example.com",
    subject: work.kind==="invoice_followup" ? "Invoice — status update" : "Internal note",
    body: work.kind==="invoice_followup" ? "Reminder: your invoice is under processing." : "Filed note.",
    tags:["workbrain","auto"]
  };
}

async function loop(){
  console.log("🧠 WorkBrain triage running…");
  while(true){
    const files = fs.existsSync(inbox) ? fs.readdirSync(inbox).filter(f=>f.endsWith(".json")) : [];
    for(const f of files){
      const e = JSON.parse(fs.readFileSync(path.join(inbox,f),"utf-8"));
      const w = decide(e);
      fs.writeFileSync(path.join(queue, w.id+".json"), JSON.stringify(w,null,2));
      if(w.action==="create_comm_draft"){
        const d = toDraft(w);
        fs.writeFileSync(path.join(drafts, d.id+".json"), JSON.stringify(d,null,2));
        console.log("→ Draft created:", d.id);
      }
      // remove from inbox after triage
      fs.unlinkSync(path.join(inbox,f));
    }
    await sleep(1500);
  }
}
loop();