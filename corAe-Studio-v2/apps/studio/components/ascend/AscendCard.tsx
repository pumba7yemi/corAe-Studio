"use client";
import { Card } from "@/ui/card";

// types for '@corae/ascend-core/src/stages' have been moved to a project declaration file (../../../../types/ascend-core-stages.d.ts)

// Fallback value when the external module is unavailable.
// Replace this with the correct import when the package path or types are fixed.
const NewAgeLine = "New Age Line";

export default function AscendCard(props: {
  roleLabel: string;
  learnings: string[];
  culturalLine?: string;
}) {
  const line = props.culturalLine ?? NewAgeLine;
  return (
    <Card className="p-5 rounded-2xl shadow-sm grid gap-2">
      <div className="text-xl font-semibold">{props.roleLabel} · Ascend Path</div>
      <p className="text-sm opacity-80">{line}</p>
      <div className="mt-2">
        <div className="text-sm font-medium">Learn this flow:</div>
        <ul className="list-disc pl-6 text-sm">
          {props.learnings.map((l, i) => (<li key={i}>{l}</li>))}
        </ul>
      </div>
      <div className="text-xs opacity-60 mt-2">
        “This role is your checkpoint into Creator potential. Today you oversee flows; tomorrow you own them.”
      </div>
    </Card>
  );
}
