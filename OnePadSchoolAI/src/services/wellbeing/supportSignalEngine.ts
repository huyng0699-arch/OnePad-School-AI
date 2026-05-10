import type { SupportSignal, VisibleRole } from '../../types/wellbeingTypes';

export const getVisibleSupportSignals = (
  signals: SupportSignal[],
  role: VisibleRole
): SupportSignal[] => signals.filter((signal) => signal.visibleToRoles.includes(role));

export const summarizeSupportSignals = (signals: SupportSignal[]): string =>
  signals.length === 0
    ? 'No active support request was detected.'
    : signals.map((signal) => signal.safeSummary).join(' ');

export const redactSignalForRole = (signal: SupportSignal, role: VisibleRole): SupportSignal | null => {
  if (!signal.visibleToRoles.includes(role)) return null;
  return {
    ...signal,
    rawDataLocked: true
  };
};

export const getVisibleSupportSignalsForRole = (
  signals: SupportSignal[],
  role: VisibleRole
): SupportSignal[] => signals.map((signal) => redactSignalForRole(signal, role)).filter((item): item is SupportSignal => !!item);

export const buildRoleSafeSummary = (signals: SupportSignal[], role: VisibleRole): string =>
  summarizeSupportSignals(getVisibleSupportSignalsForRole(signals, role));
