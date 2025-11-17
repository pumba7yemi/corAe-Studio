"use client";

// prefer alias:
import WizardShell from "@shared/wizard";
// fallback if alias not available:
// import WizardShell from "../../_shared/wizard/WizardShell";

import CleaningPage from "./cleaning/page";
import FinancePage from "./finance/page";
import FitnessPage from "./fitness/page";
import GlamGlowPage from "./glamglow/page";
import HomeFocusPage from "./homefocus/page";
import MealPrepPage from "./mealprep/page";
import MindfulPage from "./mindful/page";
import ShoppingPage from "./shopping/page";
import WardrobePage from "./wardrobe/page";
import MaintenancePage from "./maintenance/page";

// optional: Ethos (keep if already used)
import EthosCard from "@/app/components/EthosCard";

export default function HomeWizardPage() {
  const steps = [
    {
      key: "ethos",
      title: "Ethos",
      View: () => (
        <div>
          <EthosCard />

          <div role="region" aria-labelledby="memory-title" className="mb-4 rounded-md border p-3 bg-white/80 dark:bg-neutral-900/80">
            <h3 id="memory-title" className="text-sm font-semibold">Memory of corAe — Quick Reference</h3>
            <p className="text-xs mt-1">“We are corAe — the mother to the mother, the colleague to the worker, the silent partner to the owner.”</p>

            <div className="mt-2 text-xs">
              <strong>TOC</strong>
              <ul className="list-disc pl-5">
                <li><a href="apps/studio/docs/memory/HOME.md#20-0-corAe-home" className="underline">20.0 corAe Home</a></li>
                <li><a href="apps/studio/docs/memory/HOME.md#20-1-family-bubble" className="underline">20.1 Family Bubble Doctrine</a></li>
                <li><a href="apps/studio/docs/memory/HOME.md#20-3-home-focus" className="underline">20.3 Home Focus & Daily Snapshots</a></li>
              </ul>
            </div>

            <div className="mt-2">
              <a href="apps/studio/docs/memory/HOME.md#20-index" className="text-xs font-medium underline">Read the Home Memory →</a>
            </div>
          </div>
        </div>
      ),
    },
    { key: "homefocus", title: "Home Focus", View: HomeFocusPage as any },
    { key: "cleaning", title: "Cleaning", View: CleaningPage as any },
    { key: "mealprep", title: "Meal Prep", View: MealPrepPage as any },
    { key: "shopping", title: "Shopping", View: ShoppingPage as any },
    { key: "wardrobe", title: "Wardrobe", View: WardrobePage as any },
    { key: "fitness", title: "Fitness", View: FitnessPage as any },
    { key: "mindful", title: "Mindful", View: MindfulPage as any },
    { key: "glamglow", title: "Glam & Glow", View: GlamGlowPage as any },
    { key: "finance", title: "Finance", View: FinancePage as any },
    { key: "maintenance", title: "Home Maintenance", View: MaintenancePage as any },
  ];

  return (
    <WizardShell
      title="Home Onboarding"
      steps={steps}
      initialStepKey="ethos"
      context={{}}
    />
  );
}
