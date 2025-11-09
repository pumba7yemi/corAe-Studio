// apps/studio/src/components/SchemaBuilder.tsx
"use client";

import { useState } from "react";

export default function SchemaBuilder() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const buildSchema = async () => {
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/build-schema", { method: "POST" });
      const data = await res.json();
      setOutput(data.ok ? data.output : `❌ Error: ${data.error}`);
    } catch (e: any) {
      setOutput(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={buildSchema}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        {loading ? "Building..." : "🧩 Build Schema"}
      </button>

      {output && (
        <pre className="bg-gray-900 text-green-300 p-3 rounded-lg mt-3 overflow-x-auto text-sm">
          {output}
        </pre>
      )}
    </div>
  );
}