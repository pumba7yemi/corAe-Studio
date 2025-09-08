import fs from "fs"; import path from "path";
const P=(...a)=>path.join(process.cwd(),...a);
const id="eml_"+Math.random().toString(36).slice(2,9);

const email={
  id, from:"vendor@example.com", to:["ap@corae.com"],
  subject:"Invoice INV-"+(1000+Math.floor(Math.random()*9000)),
  text:"Please process this invoice.",
  tags:["finance","vendor"], received_at:new Date().toISOString()
};

fs.mkdirSync(P("data/inbox/emails"),{recursive:true});
fs.writeFileSync(P("data/inbox/emails",id+".json"), JSON.stringify(email,null,2));
console.log("📥 Email ingested:", id);