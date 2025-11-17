import Link from 'next/link'

export default function Page() {
  return (
    <div style={{padding:24}}>
      <h1>Shipped</h1>
      <p>Space: Shipped — demos for Home OS, Work OS, Business Core, Business Front</p>
      <p><Link href="/ship/space/shipped">Open</Link></p>
    </div>
  )
}
