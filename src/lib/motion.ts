import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const SPRING = { damping: 18, stiffness: 280, mass: 0.7 };
export const SOFT_SPRING = { damping: 20, stiffness: 160, mass: 0.9 };
export const SNAP = { damping: 14, stiffness: 340, mass: 0.55 };
export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.cubic);

const haptics = Platform.OS !== 'web';

export function tap() {
  if (haptics) Haptics.selectionAsync().catch(() => {});
}

export function bump() {
  if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function success() {
  if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
