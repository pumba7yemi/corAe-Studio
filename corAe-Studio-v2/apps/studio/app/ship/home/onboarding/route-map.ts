// apps/studio/app/home/onboarding/route-map.ts
export const HomeOnboardingRouteMap = {
  homefocus: "/home/onboarding/wizard/homefocus",
  finance: "/home/onboarding/wizard/finance",
  shopping: "/home/onboarding/wizard/shopping",
  mealprep: "/home/onboarding/wizard/mealprep",
  cleaning: "/home/onboarding/wizard/cleaning",
  wardrobe: "/home/onboarding/wizard/wardrobe",
  mindful: "/home/onboarding/wizard/mindful",
  glamglow: "/home/onboarding/wizard/glamglow",
  fitness: "/home/onboarding/wizard/fitness",
};
export type HomeOnboardingKey = keyof typeof HomeOnboardingRouteMap;
export const getHomeOnboardingRoute = (k: HomeOnboardingKey) => HomeOnboardingRouteMap[k];
