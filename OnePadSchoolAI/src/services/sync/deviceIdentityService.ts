import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'onepad_device_id_v1';
const SESSION_ID_KEY = 'onepad_session_id_v1';

const randomId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export async function getOrCreateDeviceId() {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const next = randomId('dev');
    await AsyncStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return randomId('dev_fallback');
  }
}

export async function refreshSessionId() {
  const sessionId = randomId('sess');
  try {
    await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch {}
  return sessionId;
}

export async function getSessionId() {
  try {
    const existing = await AsyncStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    return refreshSessionId();
  } catch {
    return randomId('sess_fallback');
  }
}
