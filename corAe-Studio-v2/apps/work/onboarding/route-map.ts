// corAe Work Onboarding Route Map
// Provides a single source for linking all Work onboarding wizards.

export const WorkOnboardingRouteMap = {
  operations: "/work/onboarding/wizard/operations",
  finance: "/work/onboarding/wizard/finance",
  partners: "/work/onboarding/wizard/partners",
};

export type WorkOnboardingKey = keyof typeof WorkOnboardingRouteMap;

export function getWorkOnboardingRoute(key: WorkOnboardingKey): string {
  return WorkOnboardingRouteMap[key];
}
