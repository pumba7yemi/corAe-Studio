import Link from 'next/link'

export default function Page() {
  return (
    <div style={{padding:24}}>
      <h1>Dockyard</h1>
      <p>Space: Dockyard — tools, scripts, maintenance</p>
      <p><Link href="/ship/space/dockyard">Open</Link></p>
    </div>
  )
}
