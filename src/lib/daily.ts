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

/* ---------- "Voltar pra casa": quando o aviso vale ---------- */

// Fusos do Brasil no banco de fusos (IANA). Com o celular num deles, a pessoa ainda não está no destino.
const BRAZIL_TZ = /^(America\/(Sao_Paulo|Araguaina|Bahia|Belem|Boa_Vista|Campo_Grande|Cuiaba|Eirunepe|Fortaleza|Maceio|Manaus|Noronha|Porto_Acre|Porto_Velho|Recife|Rio_Branco|Santarem)|Brazil\/)/;

export const inBrazilTz = (tz: string | null | undefined): boolean => !!tz && BRAZIL_TZ.test(tz);

// O app guarda só o mês do embarque. Então o aviso liga a partir do dia 1 desse mês
// e, quando o celular informa o fuso, só fora do Brasil: assim não avisa antes de a pessoa viajar
// nem depois que ela voltar. Sem fuso conhecido (na prática, só na web, onde não há aviso), vale só o mês.
export function homeAlertActive(tripMonth: string, now: number, tz: string | null | undefined): boolean {
  const [y, m] = tripMonth.split('-').map(Number);
  if (!y || !m || m > 12 || now < new Date(y, m - 1, 1).getTime()) return false;
  return !inBrazilTz(tz);
}
