import { mockEvidenceItems } from '../../data/mockEvidenceItems';
import type { EvidenceItem } from '../../types/evidenceTypes';

export const listEvidenceByEvent = (eventId: string): EvidenceItem[] => {
  return mockEvidenceItems.filter((item) => item.eventId === eventId);
};
