// Public Survey Page â€” BTDO â–¸ site survey + quote
// Route: /business/oms/obari/deal/btdo/survey/[token]
//
// - Reads token from the URL
// - Submits responses to /api/.../survey/submit
// - Optional "Accept Quote" to /api/.../survey/accept
// - No aliases; zero red squiggles
// - No aliases; zero red squiggles

import ClientSurveyForm from "@/components/BTDOSurveyClient";
type PageParams = { params: Promise<{ token: string }> };

export default async function Page({ params }: PageParams) {
  const p = await params;
  const token = p?.token ?? "";

  return (
    <main className="min-h-[80vh] p-6 bg-slate-900 text-slate-100">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          BTDO Survey & Quote <span className="text-slate-400 text-sm">({token.slice(0, 10)}â€¦)</span>
        </h1>
        <span className="text-sm text-slate-400">
          {new Date().toLocaleString()}
        </span>
      </header>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60">
          <ClientSurveyForm token={token} />
        </div>

        <aside className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
          <h3 className="text-sm font-semibold mb-2">What happens?</h3>
          <ol className="text-sm list-decimal ml-5 space-y-1 text-slate-300">
            <li>Fill the site details and your quote numbers.</li>
            <li>Click <span className="font-medium">Submit</span> to save a draft.</li>
            <li>Click <span className="font-medium">Accept Quote</span> to lock and create a BDO-ready preset.</li>
          </ol>
          <p className="text-xs text-slate-400 mt-3">
            Your link is secured by a one-time token. Submissions overwrite the same draft until accepted.
          </p>
        </aside>
      </section>
    </main>
  );

}

