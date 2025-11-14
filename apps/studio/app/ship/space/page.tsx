import Link from 'next/link'
import { MODULES } from '../../../src/caia/modules-map'

export const dynamic = 'force-static'

function corePath(layer: 'home' | 'work' | 'business') {
  const m = MODULES[layer].find((x: any) => x.id.endsWith('.core'))
  return m?.path ?? (`/ship/${layer}`)
}

export default function SpacePage() {
  const homePath = corePath('home')
  const workPath = corePath('work')
  const businessPath = corePath('business')

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">corAe Space</h1>
      <p className="text-sm text-zinc-600 mb-6">A calm hub for Studio, Ship (Back Office), Shipped (Demos), and Dockyard (Ops).</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <article className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-medium">Studio</h2>
          <p className="text-sm text-zinc-600 mt-2">Design, Dev, CAIA tools, Atlas, patterns.</p>
          <div className="mt-4">
            <Link href="/ship/dev/atlas" className="text-blue-600 underline">Open Atlas →</Link>
          </div>
        </article>

        <article className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-medium">Ship (Back Office)</h2>
          <p className="text-sm text-zinc-600 mt-2">corAe OS control: Business, Work, Home back-office.</p>
          <ul className="mt-3 list-disc ml-5 text-sm">
            <li><Link href={businessPath} className="text-blue-600 underline">Business OS →</Link></li>
            <li><Link href={workPath} className="text-blue-600 underline">Work OS →</Link></li>
            <li><Link href={homePath} className="text-blue-600 underline">Home OS →</Link></li>
          </ul>
        </article>

        <article className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-medium">Shipped (Demos)</h2>
          <p className="text-sm text-zinc-600 mt-2">Public-facing demo front pages for corAe modules.</p>
          <ul className="mt-3 list-disc ml-5 text-sm">
            <li><Link href="/ship/shipped/business-demo" className="text-blue-600 underline">Business Demo →</Link></li>
            <li><Link href="/ship/shipped/work-demo" className="text-blue-600 underline">Work Demo →</Link></li>
            <li><Link href="/ship/shipped/home-demo" className="text-blue-600 underline">Home Demo →</Link></li>
          </ul>
        </article>

        <article className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-medium">Dockyard (Ops)</h2>
          <p className="text-sm text-zinc-600 mt-2">Nightly checks, health, CAIA preflight, logs.</p>
          <ul className="mt-3 list-disc ml-5 text-sm">
            <li><Link href="/ship/dev/gate-logs" className="text-blue-600 underline">Dev Gate Logs →</Link></li>
            <li><Link href="/ship/dev/patterns" className="text-blue-600 underline">Patterns →</Link></li>
            <li><Link href="/ship/dev/atlas" className="text-blue-600 underline">Atlas →</Link></li>
            <li><Link href="/ship/dev/health" className="text-blue-600 underline">Health Summary →</Link></li>
          </ul>
        </article>
      </div>
    </div>
  )
}
