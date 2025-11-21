import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Property</h1>
      <p>Front door â€” Property / lettings</p>
      <p><Link href="/business/front/property">Open</Link></p>
    </div>
  )
}

