"use client";
import useSWR from "swr";
import { approveStep, getInstance } from "@/lib/workflows/client";

export default function Runner({ params:{ id } }: any) {
  const { data, mutate } = useSWR(id, () => getInstance(id), { refreshInterval: 1500 });
  if (!data) return null;
  const cp = data.currentCheckpoint;

  return (
    <div className="grid gap-3">
      <div className="text-lg font-semibold">{data.specId}</div>
      <div className="rounded border p-4">
        <div className="font-medium">Checkpoint: {cp?.id}</div>
        <p className="opacity-80">{cp?.desc}</p>
        {cp?.gate === "human-approve" && (
          <button className="btn btn-success mt-2" onClick={async()=>{
            await approveStep(id); await mutate();
          }}>Approve & Continue</button>
        )}
        {data.done && <div className="text-green-600 font-semibold">Done ✅</div>}
      </div>
    </div>
  );
}