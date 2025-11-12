#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..', '..'); // repo root

const PORT = process.argv[2] || process.env.PORT || '3001';
const KEEP = process.argv.includes('--keep');

function wait(ms){return new Promise(r=>setTimeout(r,ms));}

async function tryFetch(url, timeout = 3000){
  try{
    const controller = new AbortController();
    const id = setTimeout(()=>controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return { ok: res.ok, status: res.status, text: await res.text().catch(()=>undefined) };
  }catch(err){
    return { error: String(err) };
  }
}

console.log(`Workspace root: ${workspaceRoot}`);
console.log(`Starting @corae/studio dev on PORT=${PORT} (keep=${KEEP})`);

let child;
if (process.platform === 'win32'){
  // use cmd to ensure pnpm is resolved in shell context
  child = spawn('cmd.exe', ['/c', 'pnpm --filter @corae/studio dev'], {
    cwd: workspaceRoot,
    env: { ...process.env, PORT },
    stdio: ['ignore','pipe','pipe']
  });
} else {
  child = spawn('pnpm', ['--filter', '@corae/studio', 'dev'], {
    cwd: workspaceRoot,
    env: { ...process.env, PORT },
    stdio: ['ignore','pipe','pipe']
  });
}

let stdout = '';
let stderr = '';
let localUrl;
let networkUrl;

child.stdout.on('data', (b)=>{
  const s = b.toString();
  stdout += s;
  process.stdout.write(s);
  // try parse Local and Network URLs
  const localMatch = s.match(/Local:\s*(https?:\/\/[^\s]+)/i);
  const netMatch = s.match(/Network:\s*(https?:\/\/[^\s]+)/i);
  if(localMatch) localUrl = localMatch[1];
  if(netMatch) networkUrl = netMatch[1];
});
child.stderr.on('data', (b)=>{ const s=b.toString(); stderr+=s; process.stderr.write(s); });

function shutdown(){
  try{ child.kill(); }catch(e){}
}

async function runChecks(){
  // wait until either localUrl or networkUrl appears or child exits
  const start = Date.now();
  while(!localUrl && !networkUrl && (Date.now()-start)<20000){
    if(child.killed) break;
    await wait(200);
  }

  // give the server a moment
  await wait(400);

  const hostCandidates = [];
  if(localUrl) hostCandidates.push(localUrl.replace(/:\d+$/, `:${PORT}`));
  if(networkUrl) hostCandidates.push(networkUrl.replace(/:\d+$/, `:${PORT}`));
  // also ensure localhost entry
  hostCandidates.push(`http://localhost:${PORT}`);

  console.log('\nChecking endpoints:');
  const results = {};
  for(const base of hostCandidates){
    const obari = base.replace(/\/$/, '') + '/api/obari/demo';
    const email = base.replace(/\/$/, '') + '/api/email/3x3dtd';
    if(results[base]) continue;
    results[base] = { obari: await tryFetch(obari), email: await tryFetch(email) };
    console.log(`  ${base} -> obari: ${results[base].obari.error? 'ERR': results[base].obari.status}, email: ${results[base].email.error? 'ERR': results[base].email.status}`);
  }

  // analyze
  const localhostOk = results[`http://localhost:${PORT}`] && !results[`http://localhost:${PORT}`].obari.error;
  let networkOk = false;
  if(networkUrl){
    const netBase = networkUrl.replace(/:\d+$/, `:${PORT}`);
    networkOk = results[netBase] && !results[netBase].obari.error;
  }

  console.log('\nSummary:');
  console.log(`  localhost:${PORT} reachable: ${localhostOk}`);
  if(networkUrl) console.log(`  reported network binding ${networkUrl} reachable: ${networkOk}`);

  if(!localhostOk && networkOk){
    console.log('\nDiagnosis: The dev server is bound to a non-loopback interface (network IP) but not to localhost.');
    console.log('Suggestion: bind dev server to 0.0.0.0 so localhost and other interfaces work.');
    console.log('Quick fixes:');
    console.log(`  1) Start dev with HOST=0.0.0.0: \n     $env:HOST='0.0.0.0'; $env:PORT=${PORT}; pnpm --filter @corae/studio dev`);
    console.log('  2) Or add HOST=0.0.0.0 to your dev script in package.json (use cross-env on Windows).');
    // optionally detect next.config and suggest entry
    const nextConfigPath = path.resolve(workspaceRoot, 'apps','studio','next.config.mjs');
    console.log(`Detected Next config: ${nextConfigPath}`);
    console.log('Automated patch is NOT applied by this script; please apply one of the quick fixes above.');
  } else if(!localhostOk && !networkOk){
    console.log('\nDiagnosis: No HTTP listener responded on the candidate addresses.');
    console.log('Action: inspect the dev server stderr and the terminal where it runs. The server may have crashed after startup or a firewall may be blocking connections.');
    console.log('Captured stderr excerpt:');
    console.log(stderr.split('\n').slice(-30).join('\n'));
  } else {
    console.log('\nBoth localhost and network addresses responded — endpoints appear reachable.');
  }

  if(!KEEP) shutdown();
}

runChecks().catch((e)=>{ console.error('Run failed', e); shutdown(); process.exit(1); });
