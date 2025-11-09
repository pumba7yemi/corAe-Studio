import { RoleAscendProfiles } from "./roles";
import type { CreatorTrack } from "./types";

type UpsertRoleAssignment = (input: {
  userId: string;
  roleKey: string;
  moduleKey: string;
  creatorTrack?: CreatorTrack;
}) => Promise<void>;

export function createAscendAttacher(upsert: UpsertRoleAssignment) {
  return async function attachAscendProfile(args: {
    userId: string;
    roleKey: string;
    moduleKey: string;
  }) {
    const profile = RoleAscendProfiles.find(p => p.roleKey === args.roleKey);
    if (!profile) return;

    await upsert({
      userId: args.userId,
      roleKey: args.roleKey,
      moduleKey: args.moduleKey,
      creatorTrack: profile.path.track
    });
  };
}