// corAe Work Onboarding Route Map
// Provides a single source for linking all Work onboarding wizards.

export const WorkOnboardingRouteMap = {
  operations: "/ship/work/onboarding/wizard/operations",
  finance: "/ship/work/onboarding/wizard/finance",
  partners: "/ship/work/onboarding/wizard/partners",
};

export type WorkOnboardingKey = keyof typeof WorkOnboardingRouteMap;

export function getWorkOnboardingRoute(key: WorkOnboardingKey): string {
  return WorkOnboardingRouteMap[key];
}