import type { PhysicalHealthProfile } from '../../types/healthTypes';

export const createPhysicalProfileSafeSummary = (profile: PhysicalHealthProfile): string => {
  const preferences = profile.activityPreference.join(', ');
  return `Grade ${profile.grade} student with consented wellness preferences: ${preferences}. Use school-appropriate light to moderate routines.`;
};
