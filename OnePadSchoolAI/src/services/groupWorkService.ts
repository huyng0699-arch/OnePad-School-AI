import { groupAssignments, student } from '../data/mockData';
import type { GroupAssignment, GroupMember, GroupTaskStatus } from '../types';

const groupStore: GroupAssignment[] = JSON.parse(JSON.stringify(groupAssignments)) as GroupAssignment[];

export function getGroupAssignments(): GroupAssignment[] {
  return JSON.parse(JSON.stringify(groupStore)) as GroupAssignment[];
}

export function getGroupAssignmentById(id: string): GroupAssignment | undefined {
  return getGroupAssignments().find((item) => item.id === id);
}

export function getActiveGroupAssignment(): GroupAssignment | undefined {
  return getGroupAssignments().find((item) => item.status !== 'submitted') ?? getGroupAssignments()[0];
}

export function addGroupMessage(groupAssignmentId: string, text: string, currentStudent?: GroupMember): GroupAssignment | null {
  const target = groupStore.find((item) => item.id === groupAssignmentId);
  if (!target) {
    return null;
  }
  const sender = currentStudent ?? { id: student.id, name: student.name, role: 'member' as const };
  target.discussion.push({
    id: `msg-${Date.now()}`,
    senderId: sender.id,
    senderName: sender.name,
    text,
    createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    source: 'local'
  });
  return JSON.parse(JSON.stringify(target)) as GroupAssignment;
}

export function updateGroupTaskStatus(
  groupAssignmentId: string,
  taskId: string,
  status: GroupTaskStatus
): GroupAssignment | null {
  const target = groupStore.find((item) => item.id === groupAssignmentId);
  if (!target) {
    return null;
  }
  const task = target.tasks.find((item) => item.id === taskId);
  if (!task) {
    return null;
  }
  task.status = status;
  return JSON.parse(JSON.stringify(target)) as GroupAssignment;
}

export function updateGroupSubmissionDraft(groupAssignmentId: string, answerText: string): GroupAssignment | null {
  const target = groupStore.find((item) => item.id === groupAssignmentId);
  if (!target) {
    return null;
  }
  target.submission = { ...(target.submission ?? { answerText: '' }), answerText };
  return JSON.parse(JSON.stringify(target)) as GroupAssignment;
}

export function submitGroupAssignment(groupAssignmentId: string, studentId: string): GroupAssignment | null {
  const target = groupStore.find((item) => item.id === groupAssignmentId);
  if (!target) {
    return null;
  }
  target.status = 'submitted';
  target.submission = {
    ...(target.submission ?? { answerText: '' }),
    submittedAt: new Date().toISOString(),
    submittedByStudentId: studentId
  };
  return JSON.parse(JSON.stringify(target)) as GroupAssignment;
}

export function getGroupWorkSummary(groupAssignmentId: string): string {
  const group = groupStore.find((item) => item.id === groupAssignmentId);
  if (!group) {
    return 'No active group assignment found.';
  }
  const doneCount = group.tasks.filter((item) => item.status === 'done').length;
  return `Group ${group.groupName}: ${doneCount}/${group.tasks.length} tasks completed. Status: ${group.status}.`;
}

