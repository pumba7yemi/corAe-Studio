// apps/studio/app/lib/home/familyGraph.ts
// Minimal familyGraph helper for corAe Home
// Schema: memberId, relation, type ("active" | "passive"), permissions, pulseState

export type Relation = "parent" | "child" | "partner" | "sibling" | string;
export type MemberType = "active" | "passive";

export type PulseState = {
  lastSeen?: string; // ISO timestamp
  mood?: string;
  score?: number; // 0-100
};

export type FamilyMember = {
  memberId: string;
  name?: string;
  relation?: Relation;
  type?: MemberType;
  permissions?: string[];
  pulse?: PulseState;
};

export type FamilyLink = {
  from: string;
  to: string;
  relation?: Relation;
};

// Simple in-memory family graph. This is intentionally minimal and sync.
// For production, replace with persistent storage or expose adapters.
const MEMBERS = new Map<string, FamilyMember>();
const LINKS: FamilyLink[] = [];

export function addMember(m: FamilyMember) {
  MEMBERS.set(m.memberId, { ...m });
  return MEMBERS.get(m.memberId)!;
}

export function getMember(memberId: string): FamilyMember | undefined {
  return MEMBERS.get(memberId);
}

export function listMembers(): FamilyMember[] {
  return Array.from(MEMBERS.values());
}

export function linkMembers(from: string, to: string, relation: Relation = "parent") {
  LINKS.push({ from, to, relation });
  return { from, to, relation } as FamilyLink;
}

export function listLinks(): FamilyLink[] {
  return LINKS.slice();
}

export function serialize(): { members: FamilyMember[]; links: FamilyLink[] } {
  return { members: listMembers(), links: listLinks() };
}

export function clearGraph() {
  MEMBERS.clear();
  LINKS.length = 0;
}

// Usage example (commented):
// addMember({ memberId: 'm1', name: 'Alice', type: 'active' });
// addMember({ memberId: 'm2', name: 'Bob', type: 'passive' });
// linkMembers('m1','m2','partner');

export default {
  addMember,
  getMember,
  listMembers,
  linkMembers,
  listLinks,
  serialize,
  clearGraph,
};
