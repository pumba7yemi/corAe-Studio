import Link from 'next/link'

export default function Page() {
  return (
    <div style={{padding:24}}>
      <h1>Studio</h1>
      <p>Space: Studio — overview (you are here)</p>
      <p><Link href="/ship/space/studio">Open</Link></p>
    </div>
  )
}
