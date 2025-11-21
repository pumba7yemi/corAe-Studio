import RuntimeEditor from "../../../../components/RuntimeEditor";

export default function RuntimeConsolePage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">Runtime Governance Editor</h1>
      <p className="text-sm text-gray-600 mb-6">
        Edit core runtime governance JSON (toggles, flags, limits).
      </p>
      <RuntimeEditor />
    </div>
  );
}
