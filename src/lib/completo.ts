import type { AppState } from './store';

// Produto único (não consumível) cadastrado no Play Console.
export const COMPLETO_SKU = 'ponte_completo';

// Durante o teste fechado o Completo fica liberado para todos os testadores darem opinião.
// Controlado por EXPO_PUBLIC_COMPLETO_GRATIS=1 no .env e nas variáveis do EAS.
export const COMPLETO_GRATIS = process.env.EXPO_PUBLIC_COMPLETO_GRATIS === '1';

export function hasCompleto(state: AppState): boolean {
  return state.premium || COMPLETO_GRATIS;
}

export const COMPLETO_BENEFITS: { icon: 'file-text' | 'bell' | 'calendar' | 'trending-up' | 'message-circle'; title: string; text: string }[] = [
  { icon: 'file-text', title: 'Plano do intercâmbio em PDF', text: 'Orçamento, melhor forma de levar o dinheiro e checklist com datas, para mostrar aos pais ou imprimir.' },
  { icon: 'bell', title: 'Alerta de cotação', text: 'Escolha um valor e receba um aviso quando a moeda do seu destino ficar mais barata.' },
  { icon: 'calendar', title: 'Checklist com prazos', text: 'Datas calculadas a partir do seu embarque e lembretes antes de cada etapa.' },
  { icon: 'trending-up', title: 'Simulação de envios mensais', text: 'Quanto chega e quanto se perde quando alguém manda dinheiro todo mês.' },
  { icon: 'message-circle', title: 'Assistente com mais perguntas', text: 'O triplo do limite diário de perguntas.' },
];
