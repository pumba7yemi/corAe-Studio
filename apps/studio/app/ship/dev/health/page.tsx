import fs from 'fs'
import path from 'path'

async function readJsonIfExists(filePath: string) {
  try {
    const s = await fs.promises.readFile(filePath, 'utf-8')
    return JSON.parse(s)
  } catch (e) {
    return null
  }
}

export default async function HealthPage() {
  const repoRoot = path.resolve(process.cwd())
  const devGateGlob = path.join(repoRoot, '.corae', 'logs', 'dev-gate')
  const modulesCheckPath = path.join(repoRoot, '.corae', 'logs', 'modules-check.json')
  const rulePath = path.join(repoRoot, '.corae', 'caia.rule.build.json')

  // Read one file from dev-gate (most recent) if available
  let devGateSummary: any = null
  try {
    const files = await fs.promises.readdir(devGateGlob)
    const jsons = files.filter(f => f.endsWith('.json')).sort().reverse()
    if (jsons.length > 0) {
      devGateSummary = await readJsonIfExists(path.join(devGateGlob, jsons[0]))
    }
  } catch {
    devGateSummary = null
  }

  const modulesCheck = await readJsonIfExists(modulesCheckPath)
  const rules = await readJsonIfExists(rulePath)

  const lastGate = devGateSummary ? { ok: !!devGateSummary.ok, ts: devGateSummary.timestamp ?? null } : null

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-semibold">Dockyard — Health Summary</h1>
      <p className="text-sm text-zinc-600 mt-2">Summary of recent dev-gate runs and module checks.</p>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Dev Gate</h2>
        {lastGate ? (
          <ul className="list-disc ml-5 mt-2">
            <li>Last run: {lastGate.ok ? 'OK' : 'FAILED'} {lastGate.ts ? `(${new Date(lastGate.ts).toISOString()})` : ''}</li>
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 mt-2">No dev-gate logs found.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Modules Check</h2>
        {modulesCheck ? (
          <ul className="list-disc ml-5 mt-2">
            <li>Modules: {modulesCheck.ok ? 'OK' : 'FAILED'}</li>
            <li>Checked: {modulesCheck.checked?.length ?? 'N/A'}</li>
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 mt-2">No modules-check log present.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Build Rules</h2>
        {rules ? (
          <ul className="list-disc ml-5 mt-2">
            <li>noPS1: {rules.enforce?.noPS1 ? 'true' : 'false'}</li>
            <li>atlasOnly: {rules.actions?.atlasOnly ? 'true' : 'false'}</li>
            <li>noVerticals: {rules.actions?.noVerticals ? 'true' : 'false'}</li>
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 mt-2">No rule file found at <code>.corae/caia.rule.build.json</code>.</p>
        )}
      </section>

    </div>
  )
}
