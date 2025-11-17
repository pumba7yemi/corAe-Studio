import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Cleaning</h1>
      <p>Home OS — Home cleaning placeholder</p>
      <p><Link href="/ship/home/core/cleaning">Open</Link></p>
    </div>
  )
}
