import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Schedule</h1>
      <p>Worker schedule placeholder</p>
      <p><Link href="/work/core/schedule">Open</Link></p>
    </div>
  )
}

