// Minimal stub to unblock builds.
// Wraps children; replace with real gating logic when ready.

import React from "react";

type Props = {
  children?: React.ReactNode;
};

export function OnboardingGate({ children }: Props) {
  // TODO: inject real checks (e.g., user profile complete, org connected, etc.)
  return <>{children}</>;
}

export default OnboardingGate;
