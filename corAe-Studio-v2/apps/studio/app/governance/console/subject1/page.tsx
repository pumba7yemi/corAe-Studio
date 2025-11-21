import Subject1Editor from "../../../../components/Subject1Editor";

export default function Subject1ConsolePage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">Subject 1 Governance Editor</h1>
      <p className="text-sm text-gray-600 mb-6">
        Edit authoritative governance markdown under Subject 1 authority.
      </p>
      <Subject1Editor />
    </div>
  );
}
