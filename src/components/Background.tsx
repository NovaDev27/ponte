import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { checkAlert, syncAlertTask } from '../lib/alerts';
import { listenPurchases, ownsCompleto } from '../lib/billing';
import { hasCompleto, nextPremium } from '../lib/completo';
import { listenRouteTaps, syncDaily, syncReminders } from '../lib/notify';
import { useApp } from '../lib/store';

// Trabalhos sem tela: compras, alerta de cotação e lembretes. Fica dentro do AppProvider.
export function Background() {
  const { ready, state, rates, update } = useApp();
  const completo = hasCompleto(state);

  // Compra: escuta o Google Play e, ao abrir o app, confere com a loja.
  // Recupera compras feitas antes (reinstalação) e tira o Completo se a compra sumiu (reembolso),
  // com a regra de segurança de nextPremium (duas conferências com 24 h entre elas).
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });
  useEffect(() => {
    if (!ready) return;
    let stop = () => {};
    let alive = true;
    listenPurchases(() => update({ premium: true, premiumMissAt: null }), () => {}).then((s) => {
      if (alive) stop = s;
      else s();
    });
    ownsCompleto().then((owned) => {
      if (!alive) return;
      const change = nextPremium(latest.current, owned, Date.now());
      if (change) update(change);
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

  // Resumo diário e "Voltar pra casa": reagenda quando mudam os dados que aparecem no aviso
  // e toda vez que o app volta para a tela. A troca de fuso (chegou no destino ou voltou) não gera
  // evento no Android, então o syncDaily lê o fuso na hora; a tarefa em segundo plano cobre o app fechado.
  const [awake, setAwake] = useState(0);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setAwake((n) => n + 1);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (ready) syncDaily(state, rates, state.daily).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.daily, state.onboarded, state.done, state.overrides, state.profile, rates.updated, awake]);

  useEffect(() => listenRouteTaps(), []);

  return null;
}
