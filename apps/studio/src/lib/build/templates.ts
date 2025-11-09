// During development the local shim is used; re-export the canonical templates
// from the repo-root `lib/build/templates.ts` so imports like
// `@/lib/build/templates` expose `corAeTemplates` as expected.
// Lightweight copy of repo templates for build-time when the root import
// may not resolve during monorepo compilation.
export const corAeTemplates = [
	{
		id: "corae-page",
		name: "corAe Page Template",
		description: "Universal CSR-safe layout for new module pages",
		path: "/templates/corae-page/page.tsx",
		type: "page",
		tags: ["UI", "module", "frontend"],
	},
];

export default corAeTemplates;
