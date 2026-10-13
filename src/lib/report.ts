import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiHeaders } from './api';
import { DEFAULT_SERVER } from './store';

// Envia um relatório técnico de erro ao servidor (sem dados do planejamento nem conversas).
// Usa o servidor padrão de propósito: o erro pode ter acontecido antes do app carregar os ajustes.
export function reportError(error: unknown, where: string, deviceId = '') {
  if (__DEV__) return; // em desenvolvimento o erro já aparece na tela
  const e = error instanceof Error ? error : new Error(String(error));
  fetch(`${DEFAULT_SERVER}/erro`, {
    method: 'POST',
    headers: apiHeaders(deviceId),
    body: JSON.stringify({
      message: e.message,
      stack: e.stack ?? '',
      where,
      platform: Platform.OS,
      version: Constants.expoConfig?.version ?? '?',
    }),
  }).catch(() => {});
}

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsLike = { getGlobalHandler: () => GlobalHandler; setGlobalHandler: (h: GlobalHandler) => void };

// Erros fora da tela (ex.: em funções assíncronas) também viram relatório.
export function installGlobalErrorReporter() {
  const eu = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (!eu) return;
  const previous = eu.getGlobalHandler();
  eu.setGlobalHandler((error, isFatal) => {
    reportError(error, isFatal ? 'global-fatal' : 'global');
    previous(error, isFatal);
  });
}
