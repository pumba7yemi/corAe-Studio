import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Work Dashboard</h1>
      <p>Worker-facing dashboard (placeholder)</p>
      <p><Link href="/ship/work/core/dashboard">Open</Link></p>
    </div>
  )
}
