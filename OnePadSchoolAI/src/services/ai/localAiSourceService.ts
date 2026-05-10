export type LocalAiManualSource = {
  remoteUrl: string;
  localPath: string;
};

let manualSource: LocalAiManualSource = { remoteUrl: '', localPath: '' };

export function getManualLocalAiSource(): LocalAiManualSource {
  return { ...manualSource };
}

export function setManualLocalAiSource(next: Partial<LocalAiManualSource>): LocalAiManualSource {
  manualSource = {
    remoteUrl: (next.remoteUrl ?? manualSource.remoteUrl) || '',
    localPath: (next.localPath ?? manualSource.localPath) || ''
  };
  return getManualLocalAiSource();
}

export function clearManualLocalAiSource(): LocalAiManualSource {
  manualSource = { remoteUrl: '', localPath: '' };
  return getManualLocalAiSource();
}

