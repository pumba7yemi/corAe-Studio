import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Fitness</h1>
      <p>Front door â€” Fit+ services</p>
      <p><Link href="/business/front/fitness">Open</Link></p>
    </div>
  )
}

