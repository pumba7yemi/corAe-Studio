import Link from 'next/link';

export const metadata = {
  title: 'corAe Life — Corridor',
  description: 'Entry corridor to Home, Work and Business apps'
};

export default function CorridorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">corAe Life — Corridor</h1>
      <p className="text-neutral-600 dark:text-neutral-300 mb-6">Choose a destination to enter the respective app.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/home" className="block rounded-lg border border-neutral-200 p-6 text-center hover:shadow-lg bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-medium">Home</h2>
          <p className="text-sm text-neutral-500 mt-2">Open the Home app (personal workspace).</p>
        </Link>

        <Link href="/work" className="block rounded-lg border border-neutral-200 p-6 text-center hover:shadow-lg bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-medium">Work</h2>
          <p className="text-sm text-neutral-500 mt-2">Open the Work app (projects & tasks).</p>
        </Link>

        <Link href="/business" className="block rounded-lg border border-neutral-200 p-6 text-center hover:shadow-lg bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-medium">Business</h2>
          <p className="text-sm text-neutral-500 mt-2">Open the Business app (org & customers).</p>
        </Link>
      </div>
    </div>
  );
}
