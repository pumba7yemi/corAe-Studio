import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Home OS</h1>
      <Link href="/" className="underline text-sky-400">Back to Corridor</Link>
    </div>
  );
}
