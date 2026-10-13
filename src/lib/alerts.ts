import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { brl } from './format';
import { notifyNow } from './notify';
import { fetchRates, KEY, type AppState, type RateAlert, type Rates } from './store';

// Alerta de cotação: confere a cotação de tempos em tempos (em segundo plano no celular
// e toda vez que o app abre) e avisa uma vez quando 1 unidade da moeda fica no valor escolhido ou abaixo.

export const RATE_TASK = 'ponte-alerta-cotacao';
const FIRED_KEY = 'ponte:alerta-disparado'; // assinatura do último alerta já avisado

const signature = (a: RateAlert) => `${a.cur}:${a.target}:${a.createdAt}`;

export function priceOf(rates: Rates, cur: string): number | null {
  const v = rates.values[cur];
  return v ? 1 / v : null;
}

export async function alertFired(a: RateAlert | null): Promise<boolean> {
  if (!a) return false;
  return (await AsyncStorage.getItem(FIRED_KEY).catch(() => null)) === signature(a);
}

// Confere um alerta contra as cotações e avisa se bateu. Devolve true se avisou agora.
export async function checkAlert(a: RateAlert | null, rates: Rates | null): Promise<boolean> {
  if (!a || !rates?.live) return false;
  const price = priceOf(rates, a.cur);
  if (price === null || price > a.target) return false;
  if (await alertFired(a)) return false;
  await AsyncStorage.setItem(FIRED_KEY, signature(a));
  await notifyNow(`${a.cur} chegou no seu alerta 📉`, `1 ${a.cur} está ${brl(price)} (seu alvo era ${brl(a.target)}). Confira a aba Câmbio da Ponte.`);
  return true;
}

// A tarefa em segundo plano precisa ser definida no escopo global, fora de componentes.
if (Platform.OS !== 'web') {
  TaskManager.defineTask(RATE_TASK, async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const state = raw ? (JSON.parse(raw) as Partial<AppState>) : null;
      await checkAlert(state?.rateAlert ?? null, await fetchRates());
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

// Liga ou desliga a checagem em segundo plano (no Android, no mínimo a cada 15 min; o sistema decide o momento exato).
export async function syncAlertTask(active: boolean) {
  if (Platform.OS === 'web') return;
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(RATE_TASK);
    if (active && !registered) await BackgroundTask.registerTaskAsync(RATE_TASK, { minimumInterval: 60 });
    if (!active && registered) await BackgroundTask.unregisterTaskAsync(RATE_TASK);
  } catch {
    // sem suporte a tarefas em segundo plano: o alerta ainda funciona ao abrir o app
  }
}
