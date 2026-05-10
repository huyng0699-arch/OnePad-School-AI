import { Platform, StatusBar } from 'react-native';

export const ANDROID_NAV_FALLBACK_BOTTOM = 56;

export function getTopInset(extra = 8): number {
  return (StatusBar.currentHeight ?? 0) + extra;
}

export function getBottomInset(extra = 0): number {
  return (Platform.OS === 'android' ? ANDROID_NAV_FALLBACK_BOTTOM : 18) + extra;
}
