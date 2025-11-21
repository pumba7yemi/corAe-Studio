#!/usr/bin/env node
/*
 tools/rebuild-image.mjs
 Node-based rebuild helper (no PowerShell)
 Usage:
   node tools/rebuild-image.mjs --tag myregistry/corae-studio:tag --push
*/
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

function run(cmd, args, opts = {}){
  return new Promise((resolve, reject)=>{
    const ps = spawn(cmd, args, { stdio: "inherit", shell: false, ...opts });
    ps.on("close", (code)=> code===0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)));
  });
}

async function main(){
  const argv = process.argv.slice(2);
  const tagIdx = argv.indexOf("--tag");
  const push = argv.includes("--push");
  const tag = tagIdx!==-1 && argv[tagIdx+1] ? argv[tagIdx+1] : null;

  const repoRoot = path.resolve(process.cwd());
  console.log("Rebuild helper starting in:", repoRoot);

  try{
    console.log("1) Running typecheck");
    await run("pnpm", ["-w","exec","tsc","-b","--noEmit"]);

    console.log("2) Running build:verify");
    await run("pnpm", ["run","-w","build:verify"]);

    if(!tag){
      console.log("No image tag provided; skipping docker build. Use --tag <name> to build an image.");
      return;
    }

    console.log("3) Building Docker image:", tag);
    await run("docker", ["build","-f","Dockerfile","-t",tag,repoRoot]);

    if(push){
      console.log("4) Pushing image:", tag);
      await run("docker", ["push",tag]);
    }

    console.log("Rebuild completed: ", tag || "(no-image)");
  }catch(err){
    console.error("Rebuild failed:", err?.message ?? err);
    process.exit(1);
  }
}

if(require.main===module) main();
