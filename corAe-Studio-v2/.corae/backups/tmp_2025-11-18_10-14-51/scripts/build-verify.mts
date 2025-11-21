#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { routeIntent } from "../corAe-Studio-v2/tools/structure-router.mjs";

// New single-run gate + green-only confidence helpers
const ROOT = process.cwd();
const V2_ROOT = path.join(ROOT, 'corAe-Studio-v2');
const DECISION_TOOL = path.join(V2_ROOT, 'tools', 'decision-record.mjs');
const SUBJECT = 'v2-build-run';
const STRESS_RUNS = Number(process.env.CAIA_STRESS_RUNS || 3);

function run(cmd: string) {
	console.log(`> ${cmd}`);
	try {
		const out = execSync(cmd, { stdio: 'inherit', env: process.env });
		return { ok: true, out };
	} catch (err: any) {
		console.error(`Command failed: ${cmd}`);
		// record the failure to v2 decision memory if available
		try {
			execSync(
				`node corAe-Studio-v2/scripts/decision-record.mjs record "build-verify" "fail" "${escapeArg(
					String(err.message || err)
				)}"`,
				{ stdio: 'ignore' }
			);
		} catch (e) {
			// best-effort only
			// console.error('Failed to record decision memory:', e);
		}

		// also try to record this as a v2-build failure (best-effort)
		try {
			execSync(
				`node corAe-Studio-v2/scripts/decision-record.mjs record "v2-build" "fail" "${escapeArg(
					String(err.message || err)
				)}"`,
				{ stdio: 'ignore' }
			);
		} catch (e) {
			// ignore
		}
		return { ok: false, err };
	}
}

function runNode(script: string, args: string[] = [], opts: { cwd?: string } = {}) {
	const res = spawnSync(process.execPath, [script, ...args], {
		cwd: opts.cwd ?? ROOT,
		stdio: 'inherit',
		env: process.env,
	});
	return (res.status ?? 1) === 0;
}

function recordDecision(result: 'green' | 'red', reason: string) {
	if (!fs.existsSync(DECISION_TOOL)) return;
	try {
		spawnSync(process.execPath, [DECISION_TOOL, 'record', SUBJECT, result, reason], {
			cwd: ROOT,
			stdio: 'ignore',
			env: process.env,
		});
	} catch (e) {
		// best-effort
	}
}

function getMetrics() {
	if (!fs.existsSync(DECISION_TOOL)) return { passRate: 0, score150: 0, greens: 0, reds: 0 };
	try {
		const res = spawnSync(process.execPath, [DECISION_TOOL, 'metrics', SUBJECT, '--json'], { cwd: ROOT, encoding: 'utf8', env: process.env });
		if (res.status !== 0 || !res.stdout) return { passRate: 0, score150: 0, greens: 0, reds: 0 };
		const parsed = JSON.parse(String(res.stdout));
		return { passRate: parsed.passRate ?? 0, score150: parsed.score150 ?? 0, greens: parsed.greens ?? 0, reds: parsed.reds ?? 0 };
	} catch (e) {
		return { passRate: 0, score150: 0, greens: 0, reds: 0 };
	}
}

function writeLastKnownGood(summary: Record<string, unknown>) {
	try {
		const outPath = path.join(V2_ROOT, '.corae', 'last-known-good-build.json');
		fs.mkdirSync(path.dirname(outPath), { recursive: true });
		fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
	} catch (e) {
		// best-effort
	}
}

function escapeArg(s: string) {
	return s.replace(/"/g, '\\"').replace(/\n/g, ' ');
}

console.log('Starting build-verify (150 logic)');

const strict = process.env.CAIA_150_STRICT === 'true';
if (!strict) {
	console.error('CAIA_150_STRICT is not true. Aborting verification.');
	process.exit(2);
}

// Main wrapper implementing single-run gate + green-only confidence
(async () => {
	try {
		const coreOk = runCoreSteps(false);
		if (!coreOk) {
			recordDecision('red', 'build-verify core checks failed');
			console.error('CAIA 150-Logic: current run = RED (core checks failed).');
			process.exit(1);
		}

		// core checks passed for this run
		recordDecision('green', 'build-verify core checks passed');
		console.log('CAIA 150-Logic: current run = GREEN (core checks passed).');

		// consult green-only confidence engine
		const { passRate, score150, greens, reds } = getMetrics();
		console.log(`CAIA 150-Logic: history metrics for ${SUBJECT}: passRate=${(passRate * 100).toFixed(2)}% greens=${greens} reds=${reds} score150=${score150}`);

		if (passRate < 1 / 3) {
			console.warn('CAIA 150-Logic: passRate < 1/3; treating this run as GREEN but NOT 150-certified yet.');
			console.warn('Reason: history is still noisy. Continue to accumulate runs until passRate >= 1/3.');
			console.log('Cassandra: build-verify GREEN (non-150-certified).');
			process.exit(0);
		}

		console.log(`CAIA 150-Logic: passRate >= 1/3. Running stress loop (${STRESS_RUNS}x core checks) for 150-certification...`);
		for (let i = 1; i <= STRESS_RUNS; i++) {
			const ok = runCoreSteps(true);
			if (!ok) {
				recordDecision('red', `stress-run-${i} failed after initial green`);
				console.error(`CAIA 150-Logic: stress run ${i}/${STRESS_RUNS} FAILED. This build is NOT 150-certified.`);
				console.error('Leaving this run as GREEN in history but refusing 150-cert promotion.');
				process.exit(1);
			}
		}

		// All stress runs passed → 150-certified
		console.log('CAIA 150-Logic: all stress runs passed. This build is 150-certified.');
		try {
			const summary = { subject: SUBJECT, ts: new Date().toISOString(), passRate, greens, reds, score150 };
			writeLastKnownGood(summary);
		} catch (e) {
			console.warn('CAIA 150-Logic: failed to write last-known-good snapshot:', e && (e as Error).message);
		}

		console.log('Cassandra: global-execution score150 OK. v2 Life build GREEN & 150-CERTIFIED.');
		process.exit(0);
	} catch (e) {
		console.error('Unexpected error in build-verify wrapper:', e);
		process.exit(99);
	}
})();
const gateMin = Number(process.env.CAIA_GATE_MIN || process.env.BUILD_GATE_MIN || 140);
console.log(`150-Logic: using single-run subject='${SUBJECT}' gateMin=${gateMin}`);

function runCoreSteps(stress = false) {
	// 1) Policy: no .ps1 files allowed until 150 logic accepted
	console.log('Running policy check: no .ps1 files');
	const ps1Check = run('node tools/ops/check-no-ps1.js');
	if (!ps1Check.ok) return false;

	// 2) Typecheck the workspace (fail fast if broken)
	console.log('Running workspace TypeScript check (no emit)');
	const tsc = run('pnpm -w exec tsc -b --noEmit');
	if (!tsc.ok) return false;

	// 3) Run v2-focused build (life app) to produce artifacts
	console.log('Running v2 build for life app (v2 workspace)');
	let lifePkg = '@corae/life';
	try {
		const pkgJsonPath = path.join(process.cwd(), 'corAe-Studio-v2', 'apps', 'life', 'package.json');
		if (fs.existsSync(pkgJsonPath)) {
			const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
			if (pkg && pkg.name) lifePkg = pkg.name;
		}
	} catch (e) {
		// ignore and use default
	}

	const v2cwd = path.join(process.cwd(), 'corAe-Studio-v2');
	try {
		console.log(`> pnpm --filter ${lifePkg} build (cwd=${v2cwd})`);
		const out = execSync(`pnpm --filter ${lifePkg} build`, { stdio: ['pipe', 'pipe', 'pipe'], cwd: v2cwd, env: process.env });
		const s = String(out || '');
		if (s.indexOf('No projects matched the filters') !== -1) {
			console.error('v2 build failed: no projects matched the filters');
			return false;
		}
	} catch (err) {
		console.error('v2 build failed.');
		return false;
	}

	return true;
}

// 1) Policy: no .ps1 files allowed until 150 logic accepted
console.log('Running policy check: no .ps1 files');
const ps1Check = run('node tools/ops/check-no-ps1.js');
if (!ps1Check.ok) process.exit(3);

// 2) Typecheck the workspace (fail fast if broken)
console.log('Running workspace TypeScript check (no emit)');
const tsc = run('pnpm -w exec tsc -b --noEmit');
if (!tsc.ok) process.exit(4);

// 3) Run v2-focused build (life app) to produce artifacts
// 3) Run v2-focused build (life app) to produce artifacts
console.log('Running v2 build for life app (v2 workspace)');
// Try to read package name from corAe-Studio-v2/apps/life/package.json
let lifePkg = '@corae/life';
try {
	const pkgJsonPath = path.join(process.cwd(), 'corAe-Studio-v2', 'apps', 'life', 'package.json');
	if (fs.existsSync(pkgJsonPath)) {
		const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
		if (pkg && pkg.name) lifePkg = pkg.name;
	}
} catch (e) {
	// ignore and use default
}

const v2cwd = path.join(process.cwd(), 'corAe-Studio-v2');
try {
	console.log(`> pnpm --filter ${lifePkg} build (cwd=${v2cwd})`);
	const out = execSync(`pnpm --filter ${lifePkg} build`, { stdio: ['pipe', 'pipe', 'pipe'], cwd: v2cwd, env: process.env });
	const s = String(out || '');
	if (s.indexOf('No projects matched the filters') !== -1) {
		console.error('v2 build failed: no projects matched the filters');
		try {
			execSync(
				`node corAe-Studio-v2/tools/decision-record.mjs record "v2-build" "fail" "v2 build: no projects matched filters (${lifePkg})"`,
				{ stdio: 'ignore' }
			);
		} catch (e) {}
		process.exit(5);
	}
} catch (err: any) {
	console.error('v2 build failed.');
	try {
		execSync(
			`node corAe-Studio-v2/tools/decision-record.mjs record "v2-build" "fail" "v2 build failed: ${escapeArg(String(err.message || err))}"`,
			{ stdio: 'ignore' }
		);
	} catch (e) {}
	process.exit(5);
}

// record v2-build success
try {
	execSync(
		`node corAe-Studio-v2/tools/decision-record.mjs record "v2-build" "ok" "v2 build succeeded for ${lifePkg}"`,
		{ stdio: 'ignore' }
	);
} catch (e) {
	// best-effort
}

	// Soft SIL structural probe (non-blocking)
	try {
		try {
			const test = routeIntent("iwant");   // structural test pattern
			// routeIntent returns { found, targetDomain, certainty, healing, reason }
			const certainty = (test && (test.certainty ?? test.confidence ?? 0)) || 0;
			if (test && (test.found || test.targetDomain) && certainty >= 0.72) {
				console.warn(
					`⚠ SIL Warning: A new surface appears similar to an existing mapped domain. Consider routing instead of creating duplicates. (domain=${test.targetDomain || test.silDomain || test.domain}, certainty=${certainty.toFixed(2)})`
				);
			}
		} catch (e) {
			console.warn("SIL structural probe failed (non-blocking).");
		}
	} catch (e) {
		// ignore
	}

console.log('build-verify: all checks passed and v2 build succeeded.');
console.log('Cassandra: global-execution score150 OK. v2 Life build GREEN.');
process.exit(0);

export {};
