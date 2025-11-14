#!/usr/bin/env node
import { spawnSync } from 'child_process';
import path from 'path';
const root = path.resolve(path.join(process.cwd(), '..'));

console.log('corAe Maintenance (Node replacement)');
function run(cmd){ console.log('> ' + cmd); return spawnSync(cmd, { shell: true, stdio: 'inherit' }); }

try { run('pnpm install'); } catch(e) {}
try { run('pnpm run typecheck:all'); } catch(e) { console.log('typecheck:all may not exist; continuing'); }
try { run('pnpm run lint:all'); } catch(e) { console.log('lint:all may not exist; continuing'); }
try { run('pnpm run prisma:gen'); } catch(e) { console.log('prisma:gen may not be configured; continuing'); }
try { run('pnpm run prisma:migrate:dev'); } catch(e) { console.log('prisma migrate may not apply; continuing'); }

// default builds
run('pnpm --filter @corae/studio build');
run('pnpm --filter @corae/ship build');

try { run('pnpm run seed:home'); } catch(e) {}
try { run('pnpm run seed:work'); } catch(e) {}

console.log('Maintenance complete');
process.exit(0);
