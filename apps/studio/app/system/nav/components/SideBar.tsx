"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getIcon } from "../registry";
import { ROUTES, ROUTE_META } from "../routes";

export default function SideBar() {
  const pathname = usePathname();

  const sections = [
    {
      title: "Home / Work / Business",
      items: ["home", "work", "business"],
    },
    {
      title: "System / Dev",
      items: ["system", "dev"],
    },
    {
      title: "Space",
      items: ["spaceStudio", "spaceShip", "spaceShipped", "spaceDockyard"],
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
              {s.items.map((k: any) => {
                const path = (ROUTES as any)[k];
                const meta = (ROUTE_META as any)[k];
                const Icon = getIcon(meta?.icon);
                const isActive = !!pathname && (pathname === path || (path !== "/" && pathname.startsWith(path)));
                return (
                  <li key={path}>
                    <Link
                      href={path as unknown as any}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
                        isActive
                          ? "bg-neutral-900 text-white shadow dark:bg-white dark:text-neutral-950"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
                      ].join(" ")}
                    >
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      <span>{meta?.label ?? path}</span>
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