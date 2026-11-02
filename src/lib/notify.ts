import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { phaseDue, phasesFor, tripDate } from '../data/checklist';
import { getCountry } from '../data/countries';
import { dailySummary, isRouteUrl, routeUrl } from './daily';
import type { AppState, Rates } from './store';

// Notificações locais (sem servidor de push). Na web não existem.
export const notifySupported = Platform.OS !== 'web';

if (notifySupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// No Android 13+ o pedido de permissão só aparece depois que existe um canal.
async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Avisos da Ponte',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function ensurePermission(): Promise<boolean> {
  if (!notifySupported) return false;
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.status === 'granted';
}

export async function notifyNow(title: string, body: string) {
  if (!notifySupported) return;
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
}

async function cancelScheduled(prefix: string) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all.filter((n) => n.identifier.startsWith(prefix)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/* ---------- lembretes de prazo do checklist ---------- */
const REMINDER_PREFIX = 'lembrete-';
const REMIND_DAYS_BEFORE = 7;

// Reagenda tudo do zero: um lembrete por fase que ainda tem tarefas, 7 dias antes do prazo, às 10h.
export async function syncReminders(state: AppState, enabled: boolean) {
  if (!notifySupported) return;
  await cancelScheduled(REMINDER_PREFIX);
  if (!enabled) return;
  await ensureChannel();
  const now = Date.now();
  for (const phase of phasesFor(getCountry(state.profile.country))) {
    const due = phaseDue(phase.id, state.profile.tripMonth);
    if (!due) continue;
    const left = phase.tasks.filter((t) => !state.done[t.id]).length;
    if (!left) continue;
    const at = new Date(due);
    at.setDate(at.getDate() - REMIND_DAYS_BEFORE);
    at.setHours(10, 0, 0, 0);
    if (at.getTime() <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `${REMINDER_PREFIX}${phase.id}`,
      content: {
        title: `Prazo chegando: ${phase.title}`,
        body: `Faltam ${REMIND_DAYS_BEFORE} dias. Ainda ${left === 1 ? 'tem 1 tarefa' : `tem ${left} tarefas`} nessa etapa do checklist.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  }
}

/* ---------- resumo diário e "Voltar pra casa" ---------- */
const DAILY_PREFIX = 'resumo-';
const DAILY_DAYS = 3; // poucos dias: sem abrir o app por mais tempo, a cotação ficaria velha
const SUMMARY_HOUR = 9;
const HOME_HOUR = 19;

// Reagenda os próximos dias com os dados de agora. O aviso de casa só vale depois do embarque.
export async function syncDaily(state: AppState, rates: Rates, enabled: boolean) {
  if (!notifySupported) return;
  await cancelScheduled(DAILY_PREFIX);
  if (!enabled || !state.onboarded) return;
  await ensureChannel();
  const now = Date.now();
  const body = dailySummary(state, rates);
  const home = state.profile.homeAddress;
  const trip = tripDate(state.profile.tripMonth).getTime();

  for (let day = 0; day < DAILY_DAYS; day++) {
    const summaryAt = new Date();
    summaryAt.setDate(summaryAt.getDate() + day);
    summaryAt.setHours(SUMMARY_HOUR, 0, 0, 0);
    if (summaryAt.getTime() > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${DAILY_PREFIX}${day}`,
        content: { title: 'Ponte hoje', body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: summaryAt },
      });
    }

    const homeAt = new Date(summaryAt);
    homeAt.setHours(HOME_HOUR, 0, 0, 0);
    if (home && homeAt.getTime() > now && homeAt.getTime() >= trip) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${DAILY_PREFIX}casa-${day}`,
        content: { title: 'Voltar pra casa', body: 'Toque no celular para abrir a rota.', data: { url: routeUrl(home) } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: homeAt },
      });
    }
  }
}

// Abre a rota ao tocar no aviso, com o app aberto ou fechado.
export function listenRouteTaps(): () => void {
  if (!notifySupported) return () => {};
  let handled = '';
  const open = (r: Notifications.NotificationResponse | null) => {
    if (!r || r.notification.request.identifier === handled) return;
    handled = r.notification.request.identifier;
    const url = r.notification.request.content.data?.url;
    if (isRouteUrl(url)) Linking.openURL(url).catch(() => {});
  };
  Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}
