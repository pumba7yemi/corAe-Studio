import Link from "next/link";

export default function BusinessPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Business OS</h1>
      <Link href="/" className="underline text-sky-400">Back to Corridor</Link>
    </div>
  );
}
