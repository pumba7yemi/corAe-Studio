declare module '@corae/ascend-core' {
  export interface RoleProfile {
    roleKey: string;
    path: {
      learnings: any[];
      culturalLine?: string;
    };
  }

  export const RoleAscendProfiles: RoleProfile[];
}
