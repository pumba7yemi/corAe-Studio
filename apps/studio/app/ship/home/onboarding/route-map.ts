// apps/studio/app/ship/home/onboarding/route-map.ts
export const HomeOnboardingRouteMap = {
  homefocus: "/ship/home/onboarding/wizard/homefocus",
  finance: "/ship/home/onboarding/wizard/finance",
  shopping: "/ship/home/onboarding/wizard/shopping",
  mealprep: "/ship/home/onboarding/wizard/mealprep",
  cleaning: "/ship/home/onboarding/wizard/cleaning",
  wardrobe: "/ship/home/onboarding/wizard/wardrobe",
  mindful: "/ship/home/onboarding/wizard/mindful",
  glamglow: "/ship/home/onboarding/wizard/glamglow",
  fitness: "/ship/home/onboarding/wizard/fitness",
};
export type HomeOnboardingKey = keyof typeof HomeOnboardingRouteMap;
export const getHomeOnboardingRoute = (k: HomeOnboardingKey) => HomeOnboardingRouteMap[k];