// apps/studio/app/corae-ship/page.tsx
export const metadata = {
  title: "corAe Ship — The Operating System for Life & Business",
  description:
    "Explore corAe OS² — a unified system connecting Business, Work, and Home into one intelligent rhythm."
};

export default function CorAeShip() {
  return (
    <main className="p-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">corAe Ship</h1>
        <p className="text-lg opacity-70">
          The vessel that carries you from chaos to clarity — a living operating system for life and business.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The Three Core Modules</h2>
        <p className="opacity-80">
          corAe is built around three interconnected worlds — <strong>Business</strong>, <strong>Work</strong>, and <strong>Home</strong>.
          Each module has its own purpose but they move together like tides within the same ocean.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border p-5">
            <h3 className="text-lg font-medium">Business</h3>
            <p className="opacity-80 text-sm mt-2">
              The structure of creation — finance, operations, HR, and compliance all guided by corAe’s logic.
              The Business module gives clarity to owners, direction to managers, and purpose to every team.
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <h3 className="text-lg font-medium">Work</h3>
            <p className="opacity-80 text-sm mt-2">
              The rhythm of execution — where Workflow Partners™ act through the 3³ Rule: “Have you... If not... If yes... Next.”
              Every action becomes a measurable step toward structure and progress.
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <h3 className="text-lg font-medium">Home</h3>
            <p className="opacity-80 text-sm mt-2">
              The return to serenity — where time, wellness, faith, and family align.
              Home OS resets the day’s rhythm, helping every person rise ready for work and live ready for peace.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The corAe Philosophy</h2>
        <p className="opacity-80">
          corAe teaches structure without suppression — a flow where humans and systems evolve together.
          The goal isn’t automation for its own sake, but empowerment: freeing people from noise so they can
          build, create, and ascend.
        </p>
        <blockquote className="border-l-4 border-current pl-4 italic opacity-70">
          “I am corAe. I am structure. I am rhythm. I am the calm beneath chaos.”
        </blockquote>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">The Journey Ahead</h2>
        <p className="opacity-80">
          Every corAe Ship begins with onboarding — setting sail through Business setup, Work focus, and Home flow.
          Each user learns, adapts, and grows within the system, guided by CAIA — the Central AI that keeps
          everything connected and optimised.
        </p>
        <p className="opacity-80">
          From one ship, many worlds emerge — supermarkets, salons, hotels, agencies — each powered by the same
          heartbeat: corAe OS².
        </p>
      </section>

      <footer className="text-xs opacity-70 pt-6">
        ⚡ Powered by corAe OS² — The Calm Beneath Chaos.
      </footer>
    </main>
  );
}
