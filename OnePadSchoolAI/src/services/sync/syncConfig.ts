export function getBackendBaseUrl() {
  return process.env.EXPO_PUBLIC_ONEPAD_API_BASE_URL?.trim() ?? '';
}

export function getSyncConfigError() {
  if (!getBackendBaseUrl()) {
    return 'Missing EXPO_PUBLIC_ONEPAD_API_BASE_URL in .env';
  }
  return null;
}
