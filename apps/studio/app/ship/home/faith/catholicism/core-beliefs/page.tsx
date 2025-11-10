// @ts-ignore: JSON import, intentionally permissive for content files
import data from "@/content/faith/catholic/core-beliefs.v1.json";

export const metadata = {
  title: "Core Beliefs — Catholic",
  description: "Owner-editable landing into the Catechism with a direct path to Discern.",
};

export default function Page() {
  const { title, intro, beliefs, ctas } = data as any;

  return (
    <div className="max-w-3xl mx-auto py-10 prose">
      <h1 className="mb-2">{title}</h1>
      <p className="text-sm opacity-80">{intro}</p>

      <div className="mt-8 space-y-6">
        {beliefs.map((b: any) => (
          <section key={b.title} className="rounded-2xl border p-4">
            <h2 className="m-0">{b.title}</h2>
            <p className="mt-2">{b.summary}</p>
            <div className="mt-3 text-sm">
              {b.scriptures?.length > 0 && (
                <p>
                  <strong>Scripture:</strong> {b.scriptures.join(", ")}
                </p>
              )}
              {b.catechismRefs?.length > 0 && (
                <p>
                  <strong>CCC:</strong> {b.catechismRefs.join(", ")}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <a className="px-4 py-2 rounded-xl border" href={ctas.discernPath}>
          Start Discern
        </a>
        <a className="px-4 py-2 rounded-xl border" href={ctas.catechismPath}>
          Open Catechism
        </a>
      </div>
    </div>
  );
}
