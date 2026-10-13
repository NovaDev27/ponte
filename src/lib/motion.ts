import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

// Molas e curvas usadas em todo o app, para os movimentos terem o mesmo "jeito".
export const SPRING = { damping: 16, stiffness: 320, mass: 0.6 };
export const SOFT_SPRING = { damping: 18, stiffness: 180, mass: 0.8 };
export const EASE_OUT = Easing.out(Easing.cubic);

// Vibração leve ao tocar. No navegador não existe, então é ignorada.
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
