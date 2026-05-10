import type { AuditLog } from '../../types/reportTypes';
import type { VisibleRole } from '../../types/wellbeingTypes';

export const createAuditLog = (input: {
  actorRole: VisibleRole;
  action: string;
  studentId: string;
  visibleFields: string[];
  hiddenFields: string[];
}): AuditLog => ({
  id: `audit_${Date.now()}`,
  actorRole: input.actorRole,
  action: input.action,
  studentId: input.studentId,
  visibleFields: input.visibleFields,
  hiddenFields: input.hiddenFields,
  createdAt: new Date().toISOString()
});
