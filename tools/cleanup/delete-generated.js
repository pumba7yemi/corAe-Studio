const fs = require('fs');
const path = require('path');

function walk(dir, cb){
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch(e){ return; }
  for(const e of entries){
    const full = path.join(dir, e.name);
    if(e.isDirectory()){
      cb(full, true);
      walk(full, cb);
    } else {
      cb(full, false);
    }
  }
}

const repo = process.cwd();
const roots = [path.join(repo, 'apps'), path.join(repo, 'packages')];
const toRemove = new Set();
const tsbuilds = new Set();

for(const root of roots){
  if(!fs.existsSync(root)) continue;
  walk(root, (full, isDir)=>{
    if(isDir){
      if(path.basename(full) === '.next') toRemove.add(full);
      if(full.indexOf(path.sep + '.ship' + path.sep + 'payload') !== -1) toRemove.add(full);
    } else {
      const base = path.basename(full).toLowerCase();
      if(base === 'tsconfig.tsbuildinfo' || base.endsWith('.tsbuildinfo')) tsbuilds.add(full);
    }
  });
}

// Also collect tsbuildinfo in repo root (non node_modules)
walk(repo, (full, isDir)=>{
  if(!isDir){
    const base = path.basename(full).toLowerCase();
    if((base === 'tsconfig.tsbuildinfo' || base.endsWith('.tsbuildinfo')) && full.indexOf(path.sep + 'node_modules' + path.sep) === -1){
      tsbuilds.add(full);
    }
  }
});

console.log('Found: ' + toRemove.size + ' directories to remove, ' + tsbuilds.size + ' tsbuildinfo files');
if(toRemove.size){ console.log('--- dirs:'); for(const d of toRemove) console.log(d); }
if(tsbuilds.size){ console.log('--- tsbuildinfo:'); for(const f of tsbuilds) console.log(f); }

let removedCount = 0;
for(const d of toRemove){
  try{ fs.rmSync(d, { recursive: true, force: true }); removedCount++; } catch(e){ console.error('Failed remove', d, e.message); }
}
for(const f of tsbuilds){
  try{ fs.unlinkSync(f); removedCount++; } catch(e){ console.error('Failed remove', f, e.message); }
}
console.log('Removed total items: ' + removedCount);
