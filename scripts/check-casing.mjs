#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function fatal(msg) { console.error('[check-casing] ERROR', msg); process.exit(2); }

function listFiles(dir, exts = ['.ts','.tsx','.js','.jsx','.mjs']){
  const out = [];
  const walk = d=>{
    for(const f of fs.readdirSync(d,{withFileTypes:true})){ 
      const p = path.join(d,f.name);
      if(f.isDirectory()){ if(f.name === 'node_modules' || f.name === '.git' || f.name === '.next') continue; walk(p); }
      else if(exts.includes(path.extname(f.name))) out.push(p);
    }
  };
  walk(dir); return out;
}

function extractImports(src){
  const re = /(?:from|import)\s+['"]([^'"]+)['"]/g;
  const res=[]; let m; while((m=re.exec(src))){ res.push(m[1]); } return res;
}

const root = process.cwd();
const apps = path.join(root,'apps');
const pkgs = path.join(root,'packages');

for(const base of [apps, pkgs]){
  if(!fs.existsSync(base)) continue;
  const files = listFiles(base);
  for(const file of files){
    const src = fs.readFileSync(file,'utf8');
    const imports = extractImports(src);
    for(const imp of imports){
      if(!imp.startsWith('.') ) continue; // only check relative
      const abs = path.resolve(path.dirname(file), imp);
      // try file ext variants
      const candidates = [abs, abs + '.ts', abs + '.tsx', abs + '.js', abs + '.jsx', path.join(abs,'index.ts')];
      const found = candidates.find(c => fs.existsSync(c));
      if(!found) continue;
      const parent = path.dirname(found);
      const want = path.basename(found);
      const realList = fs.readdirSync(parent);
      const real = realList.find(n => n.toLowerCase() === want.toLowerCase());
      if(real && real !== want){
        fatal(`${file}: import ${imp} resolves to ${found} but actual case is ${real} (mismatch)`);
      }
    }
  }
}

console.log('[check-casing] OK');
process.exit(0);
