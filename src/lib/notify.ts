import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { phaseDue, phasesFor } from '../data/checklist';
import { getCountry } from '../data/countries';
import type { AppState } from './store';

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

/* ---------- lembretes de prazo do checklist ---------- */
const REMINDER_PREFIX = 'lembrete-';
const REMIND_DAYS_BEFORE = 7;

async function cancelReminders() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all.filter((n) => n.identifier.startsWith(REMINDER_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

// Reagenda tudo do zero: um lembrete por fase que ainda tem tarefas, 7 dias antes do prazo, às 10h.
export async function syncReminders(state: AppState, enabled: boolean) {
  if (!notifySupported) return;
  await cancelReminders();
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
