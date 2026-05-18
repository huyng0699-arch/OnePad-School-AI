import { Platform } from 'react-native';

export function getBackendBaseUrl() {
  const raw = process.env.EXPO_PUBLIC_ONEPAD_API_BASE_URL?.trim() ?? '';
  if (Platform.OS === 'android' && (raw.includes('localhost') || raw.includes('127.0.0.1'))) {
    return raw.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return raw;
}

export function getSyncConfigError() {
  if (!getBackendBaseUrl()) {
    return 'Missing EXPO_PUBLIC_ONEPAD_API_BASE_URL in .env';
  }
  return null;
}
