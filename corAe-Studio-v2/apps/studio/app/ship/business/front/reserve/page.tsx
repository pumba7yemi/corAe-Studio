import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Reserve</h1>
      <p>Front door â€” corAe Reserve / bookings</p>
      <p><Link href="/business/front/reserve">Open</Link></p>
    </div>
  )
}

