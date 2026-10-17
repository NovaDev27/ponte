import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

// Sentry: avisa quando o app trava no celular de alguém (tela, linha do código, modelo do aparelho).
// Só liga quando existe a chave EXPO_PUBLIC_SENTRY_DSN (no EAS) e fora do modo de desenvolvimento.
// Não envia dados pessoais: sem IP, sem e-mail, sem o que a pessoa digitou.
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
export const sentryOn = !!DSN && !__DEV__;

export function initSentry() {
  if (!sentryOn) return;
  Sentry.init({
    dsn: DSN,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    environment: Updates.channel || 'local',
  });
  // Qual atualização (EAS Update) estava rodando quando o erro aconteceu.
  Sentry.setTag('update_id', Updates.updateId ?? 'embutida');
  Sentry.setTag('update_embedded', String(Updates.isEmbeddedLaunch));
}

export function captureError(error: unknown) {
  if (sentryOn) Sentry.captureException(error);
}

export const wrapRoot = Sentry.wrap;
