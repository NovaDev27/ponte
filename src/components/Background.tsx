import { useEffect } from 'react';
import { checkAlert, syncAlertTask } from '../lib/alerts';
import { listenPurchases, ownsCompleto } from '../lib/billing';
import { hasCompleto } from '../lib/completo';
import { listenRouteTaps, syncDaily, syncReminders } from '../lib/notify';
import { useApp } from '../lib/store';

// Trabalhos sem tela: compras, alerta de cotação e lembretes. Fica dentro do AppProvider.
export function Background() {
  const { ready, state, rates, update } = useApp();
  const completo = hasCompleto(state);

  // Compra: escuta o Google Play e recupera compras feitas antes (reinstalação).
  useEffect(() => {
    if (!ready) return;
    let stop = () => {};
    let alive = true;
    listenPurchases(() => update({ premium: true }), () => {}).then((s) => {
      if (alive) stop = s;
      else s();
    });
    ownsCompleto().then((owned) => {
      if (owned && alive) update({ premium: true });
    });
    return () => {
      alive = false;
      stop();
    };
  }, [ready, update]);

  // Alerta de cotação: tarefa em segundo plano + conferência quando as cotações atualizam.
  // A mesma tarefa mantém o resumo diário em dia.
  const alert = completo ? state.rateAlert : null;
  useEffect(() => {
    if (ready) syncAlertTask(!!alert || state.daily);
  }, [ready, alert, state.daily]);
  useEffect(() => {
    if (ready) checkAlert(alert, rates).catch(() => {});
  }, [ready, alert, rates]);

  // Lembretes do checklist: reagenda quando muda o embarque, o destino ou as tarefas feitas.
  const remind = completo && state.reminders;
  useEffect(() => {
    if (ready) syncReminders(state, remind).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, remind, state.done, state.profile.tripMonth, state.profile.country]);

  // Resumo diário e "Voltar pra casa": reagenda quando mudam os dados que aparecem no aviso.
  useEffect(() => {
    if (ready) syncDaily(state, rates, state.daily).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.daily, state.onboarded, state.done, state.overrides, state.profile, rates.updated]);

  useEffect(() => listenRouteTaps(), []);

  return null;
}
