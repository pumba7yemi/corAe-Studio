"use client";
import Link from "next/link";
import { MorningExecData } from "@/types/morning-exec";

export default function MorningExecView({ data }: { data: MorningExecData }) {
  const date = new Date(data.date).toLocaleString();

  return (
    <div className="p-4 border rounded-xl">
      <h2 className="text-lg font-semibold">{data.title}</h2>
      <p className="text-sm text-gray-500">{date}</p>
      {data.notes && <p className="mt-2">{data.notes}</p>}
      <Link href={`/exec/${data.id}`} className="text-blue-500 underline mt-2 block">
        View Details
      </Link>
    </div>
  );
}