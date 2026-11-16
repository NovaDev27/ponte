import type { AppState } from './store';

// Produto único (não consumível) cadastrado no Play Console.
export const COMPLETO_SKU = 'ponte_completo';

// Durante o teste fechado o Completo fica liberado para todos os testadores darem opinião.
// Controlado por EXPO_PUBLIC_COMPLETO_GRATIS=1 no .env e nas variáveis do EAS.
export const COMPLETO_GRATIS = process.env.EXPO_PUBLIC_COMPLETO_GRATIS === '1';

export function hasCompleto(state: AppState): boolean {
  return state.premium || COMPLETO_GRATIS;
}

// Tempo mínimo entre duas respostas "sem compra" da loja antes de tirar o Completo.
export const PREMIUM_GRACE_MS = 24 * 60 * 60 * 1000;

type PremiumState = { premium: boolean; premiumMissAt?: number | null };

// Decide o Completo depois de conferir com a loja (Google Play ou App Store). Devolve o que mudar, ou null se nada muda.
// - owned null (sem loja ou sem internet): não mexe.
// - owned true: libera e esquece qualquer "não achei".
// - owned false: só tira depois de a loja dizer "não tem" duas vezes, com pelo menos 24 h entre elas.
//   Assim um engano pontual (ex.: outra conta Google ativa no Play) não tira o Completo de quem pagou,
//   e um reembolso de verdade tira na próxima conferência depois de um dia.
export function nextPremium(prev: PremiumState, owned: boolean | null, now: number): Required<PremiumState> | null {
  if (owned === null) return null;
  if (owned) return prev.premium && !prev.premiumMissAt ? null : { premium: true, premiumMissAt: null };
  if (!prev.premium) return prev.premiumMissAt ? { premium: false, premiumMissAt: null } : null;
  if (!prev.premiumMissAt) return { premium: true, premiumMissAt: now };
  if (now - prev.premiumMissAt >= PREMIUM_GRACE_MS) return { premium: false, premiumMissAt: null };
  return null;
}

export const COMPLETO_BENEFITS: { icon: 'file-text' | 'bell' | 'calendar' | 'trending-up' | 'message-circle'; title: string; text: string }[] = [
  { icon: 'file-text', title: 'Plano do intercâmbio em PDF', text: 'Orçamento, melhor forma de levar o dinheiro e checklist com datas, para mostrar aos pais ou imprimir.' },
  { icon: 'bell', title: 'Alerta de cotação', text: 'Escolha um valor e receba um aviso quando a moeda do seu destino ficar mais barata.' },
  { icon: 'calendar', title: 'Checklist com prazos', text: 'Datas calculadas a partir do seu embarque e lembretes antes de cada etapa.' },
  { icon: 'trending-up', title: 'Simulação de envios mensais', text: 'Quanto chega e quanto se perde quando alguém manda dinheiro todo mês.' },
  { icon: 'message-circle', title: 'Orbi com mais perguntas', text: 'O triplo do limite diário de perguntas.' },
];
