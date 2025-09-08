#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const root=process.cwd(), D=(...p)=>path.join(root,"data","oms",...p);
fs.mkdirSync(D("logs"),{recursive:true});
setInterval(()=>{ fs.appendFileSync(D("logs","oms.log"), new Date().toISOString()+" heartbeat\n"); }, 4000);
console.log("OMS daemon: heartbeat logging to data/oms/logs/oms.log");
