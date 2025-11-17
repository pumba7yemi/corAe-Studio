import Link from "next/link";

export default function SchedulingHome() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Scheduling</h1>
      <ul className="list-disc pl-6">
        <li><Link href="./calendar">Calendar</Link></li>
        <li><Link href="./meetings">Meetings</Link></li>
      </ul>
    </div>
  );
}
