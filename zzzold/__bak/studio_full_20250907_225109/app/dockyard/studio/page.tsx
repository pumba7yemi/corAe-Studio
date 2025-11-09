// apps/studio/app/studio/page.tsx
import Link from 'next/link';

export default function StudioPage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-3xl font-bold">Studio</h1>
      <p className="opacity-70">
        Developer studio, Dev Agent, and configuration.
      </p>
      <Link
        href="/agent"
        className="inline-block rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-500"
      >
        Open Dev Agent
      </Link>
    </div>
  );
}