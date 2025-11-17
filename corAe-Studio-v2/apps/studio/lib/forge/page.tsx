import { enqueueSelfTest, devPassChecks, builderConfirm } from "../../lib/forge/actions";

export default function ForgePage() {
  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-semibold">Forge Control</h1>

      <div className="grid gap-4 mt-4 md:grid-cols-3">
        <form action="" className="rounded-2xl border border-ring bg-card p-4 shadow-card">
          <h2 className="font-semibold">Agent</h2>
          <p className="text-sm text-muted mb-3">Enqueue self-test job</p>
          <button type="submit" className="px-3 py-2 rounded-lg border border-ring bg-surface hover:bg-card">
            Enqueue
          </button>
        </form>

        <form action="" className="rounded-2xl border border-ring bg-card p-4 shadow-card">
          <h2 className="font-semibold">Developer</h2>
          <p className="text-sm text-muted mb-3">Mark checks PASS + Ribbon GREEN</p>
          <button type="submit" className="px-3 py-2 rounded-lg border border-ring bg-surface hover:bg-card">
            Pass Checks
          </button>
        </form>

        <form action="" className="rounded-2xl border border-ring bg-card p-4 shadow-card">
          <h2 className="font-semibold">Builder</h2>
          <p className="text-sm text-muted mb-3">Write Confirm tag</p>
          <button type="submit" className="px-3 py-2 rounded-lg border border-ring bg-surface hover:bg-card">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
