#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const root=process.cwd(), D=(...p)=>path.join(root,"data","obari",...p);
fs.mkdirSync(D("logs"),{recursive:true});
setInterval(()=>{ fs.appendFileSync(D("logs","obari.log"), new Date().toISOString()+" heartbeat\n"); }, 5000);
console.log("OBARI daemon: heartbeat logging to data/obari/logs/obari.log");
