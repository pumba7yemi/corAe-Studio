import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Retail</h1>
      <p>Front door — Retail / HomeGro</p>
      <p><Link href="/ship/business/front/retail">Open</Link></p>
    </div>
  )
}
