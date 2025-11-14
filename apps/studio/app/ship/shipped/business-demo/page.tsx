import Link from 'next/link'

export default function BusinessDemo() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-semibold">corAe Business OS Demo</h1>
      <p className="mt-4 text-sm text-zinc-600">This is a demo shell only — no full white-label logic included yet.</p>

      <section className="mt-6">
        <h2 className="text-xl font-medium">What this demo will show</h2>
        <ul className="list-disc ml-5 mt-2 text-sm">
          <li>Bookings and schedules</li>
          <li>OBARI integration examples</li>
          <li>FileLogic and governance workflows</li>
          <li>POS and tracking hooks (mocked)</li>
        </ul>
      </section>

      <div className="mt-6">
        <Link href="/ship/space" className="text-blue-600 underline">Back to corAe Space</Link>
      </div>
    </div>
  )
}
