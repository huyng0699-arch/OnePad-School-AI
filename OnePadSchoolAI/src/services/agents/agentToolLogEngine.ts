import type { AgentToolCall } from '../../types/agentToolLogTypes';

const MAX_LOG_ITEMS = 200;
const runtimeAgentToolCalls: AgentToolCall[] = [];

export const recordAgentToolCall = (call: Omit<AgentToolCall, 'id' | 'createdAt'>): AgentToolCall => {
  const next: AgentToolCall = {
    ...call,
    id: `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  };
  runtimeAgentToolCalls.unshift(next);
  if (runtimeAgentToolCalls.length > MAX_LOG_ITEMS) {
    runtimeAgentToolCalls.length = MAX_LOG_ITEMS;
  }
  return next;
};

export const listAgentToolCallsByEvent = (eventId: string): AgentToolCall[] =>
  runtimeAgentToolCalls
    .filter((item) => item.eventId === eventId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const listRecentAgentToolCalls = (limit = 12): AgentToolCall[] =>
  runtimeAgentToolCalls
    .slice(0, Math.max(1, limit))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const clearAgentToolCalls = () => {
  runtimeAgentToolCalls.length = 0;
};
