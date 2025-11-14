import Link from 'next/link'
import { HOME_CORE, WORK_CORE, BUSINESS_CORE, BUSINESS_FRONT } from '@/src/caia/modules'

export default async function Page() {
  const [home, work, bizCore, bizFront] = await Promise.all([
    HOME_CORE(),
    WORK_CORE(),
    BUSINESS_CORE(),
    BUSINESS_FRONT(),
  ]);

  return (
    <div style={{padding:24}}>
      <h1>Module Map (Dev)</h1>
      <section>
        <h2>Home Core</h2>
        <ul>
          {home.map((m) => (
            <li key={m.id}><Link href={m.path}>{m.label} — {m.path}</Link></li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Work Core</h2>
        <ul>
          {work.map((m) => (
            <li key={m.id}><Link href={m.path}>{m.label} — {m.path}</Link></li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Business Core</h2>
        <ul>
          {bizCore.map((m) => (
            <li key={m.id}><Link href={m.path}>{m.label} — {m.path}</Link></li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Business Front</h2>
        <ul>
          {bizFront.map((m) => (
            <li key={m.id}><Link href={m.path}>{m.label} — {m.path}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
