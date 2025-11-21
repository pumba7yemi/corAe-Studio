#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Wrapper that invokes the repo-level verifier directly with node to avoid recursive pnpm
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..', '..');

const env = {
	...process.env,
	CAIA_150_STRICT: process.env.CAIA_150_STRICT ?? 'true',
	CAIA_GATE_MIN: process.env.CAIA_GATE_MIN ?? '140',
};

const script = path.join(root, 'scripts', 'build-verify.mts');
console.log('> node ' + script + ` (cwd=${root})`);
const res = spawnSync('node', [script], { cwd: root, stdio: 'inherit', env });
process.exit(typeof res.status === 'number' ? res.status : 1);
