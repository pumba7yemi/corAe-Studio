// Minimal AscendProfile type used by Ascend integration scaffolds
export type AscendLevel = 'home' | 'work' | 'business';

export type AscendProfile = {
  id: string;
  displayName?: string;
  level?: AscendLevel;
  createdAt?: string; // ISO timestamp
};

export default AscendProfile;
