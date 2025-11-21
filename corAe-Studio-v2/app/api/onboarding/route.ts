import { NextResponse } from 'next/server';
import { routeIntent } from '@/tools/structure-router';
import { planFromOnboarding, applyBuildPlan, recordSystemBuild } from '@/tools/system-builder';
import { buildPersonScripts, buildMergedPersonScripts, type PersonaCore } from '@/tools/person-script-builder.mts';
import { listRoles } from '@/tools/role-script-builder.mts';
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
      // After successful scaffold, attempt to run the v2 person script builder
      try {
        const core: PersonaCore & { roles?: string[] } = {
          slug,
          fullName: payload?.fullName || payload?.name || slug,
          roleTitle: payload?.roleTitle || undefined,
          employerName: payload?.employerName || undefined,
          spheres: (payload?.spheres && Array.isArray(payload.spheres) && payload.spheres.length > 0) ? payload.spheres : (payload?.employerName ? ['home', 'work', 'business'] : ['home']),
          roles: Array.isArray(payload?.roles) ? payload.roles : []
        } as PersonaCore;

        try {
          // validate roles
          const known = listRoles();
          const unknown = (core as any).roles?.filter((r: string) => !known.includes(r)) || [];
          if (unknown.length) {
            try {
              const V2 = path.resolve(process.cwd());
              const dr = path.join(V2, 'tools', 'decision-record.mjs');
              spawnSync(process.execPath, [dr, 'record', 'onboarding-build', 'amber', `unknown roles: ${unknown.join(',')}`], { cwd: V2, stdio: 'ignore' });
            } catch (e) {}
          }
          const scriptsSummary = await buildMergedPersonScripts(core as any);
          // record that generator ran
          try {
            const V2 = path.resolve(process.cwd());
            const dr = path.join(V2, 'tools', 'decision-record.mjs');
            spawnSync(process.execPath, [dr, 'record', 'onboarding-build', 'green', `person-script-builder ran for ${slug}`], { cwd: V2, stdio: 'ignore' });
          } catch (e) { /* swallow */ }

          // include scripts in response
          return NextResponse.json({ slug, spheres: plan.spheres, foldersCreated, filesCreated, caiaScripts, haveYouScripts, scripts: scriptsSummary, status: 'ok' });
        } catch (err: any) {
          // generator failed, log but don't fail onboarding
          try {
            const V2 = path.resolve(process.cwd());
            const dr = path.join(V2, 'tools', 'decision-record.mjs');
            spawnSync(process.execPath, [dr, 'record', 'onboarding-build', 'amber', String(err?.message || err)], { cwd: V2, stdio: 'ignore' });
          } catch (e) { /* swallow */ }
          // fall through to return base response
        }
      } catch (e) { /* swallow overall errors */ }

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
