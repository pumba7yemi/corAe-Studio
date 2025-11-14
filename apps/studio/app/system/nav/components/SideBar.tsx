"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getIcon } from "../registry";
import { ROUTES } from "../routes";

export default function SideBar() {
  const pathname = usePathname();

  const sections = [
    {
      title: "Home / Work / Business",
      items: [ROUTES.home, ROUTES.work, ROUTES.business],
    },
    {
      title: "System / Dev",
      items: [ROUTES.system, ROUTES.dev],
    },
    {
      title: "Space",
      items: [ROUTES.spaceStudio, ROUTES.spaceShip, ROUTES.spaceShipped, ROUTES.spaceDockyard],
    },
  ];

  return (
    <aside
      className="hidden w-64 shrink-0 border-r bg-white/60 p-3 dark:border-neutral-800 dark:bg-neutral-950/50 md:block"
      role="navigation"
      aria-label="Primary"
    >
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              {s.title}
            </h2>
            <ul className="space-y-1">
              {s.items.map((r: any) => {
                const Icon = getIcon(r.icon);
                const isActive = !!pathname && (pathname === r.path || (r.path !== "/" && pathname.startsWith(r.path)));
                return (
                  <li key={r.path}>
                    <Link
                      href={r.path as unknown as any}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
                        isActive
                          ? "bg-neutral-900 text-white shadow dark:bg-white dark:text-neutral-950"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      <span>{r.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}