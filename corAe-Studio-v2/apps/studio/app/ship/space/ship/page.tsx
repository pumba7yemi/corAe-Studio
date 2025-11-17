import Link from 'next/link'

export default function Page() {
  return (
    <div style={{padding:24}}>
      <h1>Ship</h1>
      <p>Space: Ship — admin / back-office tools</p>
      <p><Link href="/ship/space/ship">Open</Link></p>
    </div>
  )
}
