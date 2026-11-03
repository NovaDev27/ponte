import { phasesFor } from '../data/checklist';
import { budgetOf } from './budget';
import { money, rateLabel } from './format';
import type { Rates } from './rates';
import type { AppState } from './store';

// Tarefas que o próprio cadastro já resolve: sem marcar no checklist, o resumo mandaria definir o destino já definido.
const SET_BY_PROFILE = new Set(['destino']);

// Texto curto, para caber na tela de qualquer relógio que mostra as notificações do celular.
export function dailySummary(state: AppState, rates: Rates): string {
  const b = budgetOf(state, rates);
  const next = phasesFor(b.country)
    .flatMap((p) => p.tasks)
    .find((t) => !state.done[t.id] && !(state.onboarded && SET_BY_PROFILE.has(t.id)));
  const lines = [rateLabel(b.cur, 1 / b.rate), `Hoje: até ${money(Math.round(b.monthly / 30), b.cur, 0)}`];
  if (next) lines.push(`Falta: ${next.text}`);
  return lines.join('\n');
}

const MAPS_DIR = 'https://www.google.com/maps/dir/?api=1';

export function routeUrl(address: string): string {
  return `${MAPS_DIR}&destination=${encodeURIComponent(address)}&travelmode=transit`;
}

export const isRouteUrl = (url: unknown): url is string => typeof url === 'string' && url.startsWith(MAPS_DIR);
