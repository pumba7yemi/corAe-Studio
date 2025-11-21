import { NextResponse } from 'next/server';
import { routeIntent } from '@/tools/structure-router';
import { planFromOnboarding, applyBuildPlan, recordSystemBuild } from '@/tools/system-builder';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userInput = url.searchParams.get('input') || '';
    const sil = routeIntent(userInput);
    if (sil.found) {
      return NextResponse.json({
        status: 'routed-existing',
        target: sil.targetDomain,
        certainty: sil.certainty,
        reason: sil.reason,
        healing: sil.healing
      });
    }

    return NextResponse.json({
      status: 'needs-clarification',
      certainty: 0,
      reason: sil.reason
    });
  } catch (e: any) {
    return NextResponse.json({ status: 'error', message: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body || {};
    const plan = planFromOnboarding(payload as any);
    // Determine whether plan produced any actionable modules
    const hasModules = (plan.homeModules && plan.homeModules.length > 0) || (plan.businessModules && plan.businessModules.length > 0) || (plan.workModules && plan.workModules.length > 0);

    if (!hasModules || String(plan.reason || '').startsWith('needs-clarification')) {
      // record decision (clarify)
      try {
        const V2 = path.resolve(process.cwd());
        const dr = path.join(V2, 'tools', 'decision-record.mjs');
        spawnSync(process.execPath, [dr, 'record', 'onboarding-run', 'clarify', 'SIL confidence too low for auto-scaffold'], { cwd: V2, stdio: 'ignore' });
      } catch (e) { /* swallow */ }
      // also keep system builder record for traceability
      const stub = { root: '', createdFiles: [] };
      recordSystemBuild(plan as any, stub as any, 'clarify', 'SIL confidence too low, needs human follow-up');
      return NextResponse.json({ status: 'needs-clarification', reason: plan.reason, silDomain: plan.silDomain, silConfidence: plan.silConfidence });
    }

    try {
      const result = applyBuildPlan(plan as any);

      // log onboarding-run as green
      try {
        const V2 = path.resolve(process.cwd());
        const dr = path.join(V2, 'tools', 'decision-record.mjs');
        spawnSync(process.execPath, [dr, 'record', 'onboarding-run', 'green', 'onboarding scaffold created'], { cwd: V2, stdio: 'ignore' });
      } catch (e) { /* swallow */ }

      // persist system builder snapshot and decision
      recordSystemBuild(plan as any, result as any, 'green', 'system scaffold successfully created');

      // build response payload
      const slug = plan.personSlug;
      const foldersCreated = [];
      for (const s of plan.spheres) {
        foldersCreated.push(path.join('corAe-Studio-v2','persons', slug, s));
      }

      const filesCreated = Array.isArray(result.createdFiles) ? result.createdFiles : [];
      const caiaScripts = [result.caiaHomeScriptsPath, result.caiaBusinessScriptsPath, result.caiaWorkScriptsPath].filter(Boolean);
      const haveYouScripts = [result.haveYouHomePath, result.haveYouBusinessPath, result.haveYouWorkPath].filter(Boolean);

      return NextResponse.json({ slug, spheres: plan.spheres, foldersCreated, filesCreated, caiaScripts, haveYouScripts, status: 'ok' });
    } catch (e: any) {
      // log red
      try {
        const V2 = path.resolve(process.cwd());
        const dr = path.join(V2, 'tools', 'decision-record.mjs');
        spawnSync(process.execPath, [dr, 'record', 'onboarding-run', 'red', String(e?.message || e)], { cwd: V2, stdio: 'ignore' });
      } catch (err) { }
      const stub = { root: '', createdFiles: [] };
      recordSystemBuild(plan as any, stub as any, 'red', String(e?.message || e));
      return NextResponse.json({ status: 'error', message: 'failed to apply build plan' }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ status: 'error', message: String(e?.message || e) }, { status: 500 });
  }
}
