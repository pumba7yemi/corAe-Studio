import Link from 'next/link'

export default function HomeDemo() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-semibold">corAe Home OS Demo</h1>
      <p className="mt-4 text-sm text-zinc-600">This is a demo shell only — static examples for Home OS pages.</p>

      <section className="mt-6">
        <h2 className="text-xl font-medium">Planned demo items</h2>
        <ul className="list-disc ml-5 mt-2 text-sm">
          <li>Household bookings</li>
          <li>Service history and receipts</li>
          <li>Profile and preferences</li>
        </ul>
      </section>

      <div className="mt-6">
        <Link href="/ship/space" className="text-blue-600 underline">Back to corAe Space</Link>
      </div>
    </div>
  )
}
