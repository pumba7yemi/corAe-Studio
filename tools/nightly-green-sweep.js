#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function log(s){ console.log(s); }
function step(name, cmd, opts = {}){
  log(`▶ ${name}`);
  try{
    execSync(cmd, { stdio: 'inherit', shell: true });
    log(`✓ ${name}`);
  }catch(e){
    if(opts.nonBlocking){
      log(`⚠ ${name} failed (non-blocking). Continuing.`);
      return e.status || 1;
    }
    throw new Error(`${name} failed: ${e && e.message ? e.message : e}`);
  }
}

function fileExists(p){ try{ return fs.existsSync(p); }catch(e){ return false; } }

// CLI flags
const failOnLint = process.argv.includes('--failOnLint');

// Ensure navigation shim exists (idempotent)
const shim = path.join(__dirname, '..', 'apps', 'studio', 'src', 'types', 'next-navigation-augment.d.ts');
if(!fileExists(shim)){
  fs.mkdirSync(path.dirname(shim), { recursive: true });
  fs.writeFileSync(shim, `declare module 'next/navigation' {
 export * from 'next/dist/client/components/navigation';
 export interface Router { push(h:string):void;replace(h:string):void;back():void;refresh?():void; }
 export function useRouter():Router;
 export function usePathname():string|null;
 export function useSearchParams():URLSearchParams;
 export function redirect(u:string):never;
 export function notFound():never;
}
`, { encoding: 'utf8' });
  console.log('Created shim', shim);
}

try{
  step('Prisma format/generate', 'pnpm --filter @corae/studio prisma:format && pnpm --filter @corae/studio prisma:generate');
  step('TypeScript check', 'pnpm -w exec -- tsc -b --noEmit');
  // ESLint non-blocking by default
  try{
    log('▶ ESLint (non-blocking)');
    execSync('pnpm --filter @corae/studio lint', { stdio: 'inherit', shell: true });
    log('✓ ESLint');
  }catch(e){
    if(failOnLint){
      process.exit(3);
    } else {
      log('⚠ ESLint failed (non-blocking).');
    }
  }

  step('Next build (Studio)', 'pnpm --filter @corae/studio build');
  console.log('\x1b[32m✅ Nightly Green-Sweep OK\x1b[0m');
}catch(e){
  console.error('\x1b[31mNightly Green-Sweep failed:\x1b[0m', e && e.message ? e.message : e);
  process.exit(1);
}
