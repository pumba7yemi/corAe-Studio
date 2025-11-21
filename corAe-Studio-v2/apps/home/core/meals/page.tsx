import Link from 'next/link'

export default function Page(){
  return (
    <div style={{padding:24}}>
      <h1>Meals / Kitchen</h1>
      <p>Home OS â€” Meals and kitchen placeholder</p>
      <p><Link href="/home/core/meals">Open</Link></p>
    </div>
  )
}

