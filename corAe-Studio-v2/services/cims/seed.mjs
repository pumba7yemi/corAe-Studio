#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const root = process.cwd(); const D=(...p)=>path.join(root,"data","cims",...p);
fs.mkdirSync(D("drafts"),{recursive:true});
const id = "cims_"+Math.random().toString(36).slice(2,9);
const draft = {
  id, template_id: "invoice-reminder", channel:"whatsapp", to:"+971500000000",
  subject: `Invoice ${Math.floor(Math.random()*9000)+1000} — status update`,
  body: "Finance update: queued for payment, bank account on file."
};
fs.writeFileSync(D("drafts", id+".json"), JSON.stringify(draft,null,2));
console.log("Seeded:", id);
