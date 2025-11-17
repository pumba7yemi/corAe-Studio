/* eslint-disable */
import AscendCard from "@/components/ascend/AscendCard";
// Local fallback/type for RoleAscendProfiles when the package types are not available
interface RoleProfile {
  roleKey: string;
  path: {
    learnings: any[];
    culturalLine?: string;
  };
}

let RoleAscendProfiles: RoleProfile[] = [];

// Try to load the real data at runtime if the package is installed; otherwise keep the empty fallback.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@corae/ascend-core');
  if (mod && Array.isArray(mod.RoleAscendProfiles)) {
    RoleAscendProfiles = mod.RoleAscendProfiles;
  }
} catch (e) {
  // ignore: package not available in this environment, use fallback
}

export function RoleStep({ roleKey }: { roleKey: string }) {
  const profile = RoleAscendProfiles.find(p => p.roleKey === roleKey);
  return profile ? (
    <AscendCard
      roleLabel={roleKey.replace(/([A-Z])/g, " $1").trim()}
      learnings={profile.path.learnings}
      culturalLine={profile.path.culturalLine}
    />
  ) : null;
}
