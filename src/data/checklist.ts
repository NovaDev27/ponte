import type { Country } from './countries';

export type Task = { id: string; text: string };
export type Phase = { id: string; title: string; when: string; tasks: Task[] };

// Prazo de cada fase em dias a partir do embarque (negativo = antes).
export const PHASE_OFFSET_DAYS: Record<string, number> = { p6: -180, p3: -90, p1: -30, p0: -7, pa: 7 };

// Embarque considerado no dia 1 do mês escolhido ("2027-02").
export function tripDate(tripMonth: string): Date {
  const [y, m] = tripMonth.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

export function phaseDue(phaseId: string, tripMonth: string): Date | null {
  const offset = PHASE_OFFSET_DAYS[phaseId];
  if (offset === undefined) return null;
  const d = tripDate(tripMonth);
  d.setDate(d.getDate() + offset);
  return d;
}

const BASE: Phase[] = [
  {
    id: 'p6', title: 'Planejamento', when: '6 meses ou mais antes',
    tasks: [
      { id: 'destino', text: 'Definir destino, cidade e tempo de intercâmbio' },
      { id: 'orcamento', text: 'Montar o orçamento na aba Orçamento' },
      { id: 'escola', text: 'Pesquisar e comparar escolas ou universidades' },
      { id: 'passaporte', text: 'Tirar ou renovar o passaporte (validade de 6 meses além da volta)' },
      { id: 'contaglobal', text: 'Abrir uma conta global e acompanhar o câmbio' },
    ],
  },
  {
    id: 'p3', title: 'Documentos e visto', when: '3 meses antes',
    tasks: [
      { id: 'matricula', text: 'Fazer a matrícula e receber a carta da escola' },
      { id: 'visto', text: 'Pedir o visto ou a autorização de entrada' },
      { id: 'seguro', text: 'Contratar seguro saúde que atenda às exigências do país' },
      { id: 'passagem', text: 'Comprar a passagem' },
      { id: 'traducoes', text: 'Traduzir diplomas, históricos e carta de motorista, se precisar' },
    ],
  },
  {
    id: 'p1', title: 'Reta final', when: '1 mês antes',
    tasks: [
      { id: 'hospedagem', text: 'Reservar hospedagem para as primeiras 2 a 4 semanas' },
      { id: 'esim', text: 'Comprar eSIM ou chip para chegar já conectado' },
      { id: 'cambio', text: 'Converter parte do dinheiro aos poucos (preço médio)' },
      { id: 'banco', text: 'Avisar o banco e ativar o uso internacional do cartão' },
      { id: 'copias', text: 'Salvar cópias digitais de todos os documentos' },
      { id: 'saida', text: 'Ficando mais de 12 meses: avaliar a Declaração de Saída Definitiva com um contador' },
    ],
  },
  {
    id: 'p0', title: 'Semana da viagem', when: 'Últimos dias',
    tasks: [
      { id: 'mala', text: 'Fechar a mala conferindo o limite da companhia aérea' },
      { id: 'impressos', text: 'Levar impressos: passaporte, carta da escola, seguro, comprovantes' },
      { id: 'dinheiro', text: 'Ter dinheiro para os primeiros dias em dois meios diferentes' },
    ],
  },
];

export function phasesFor(country: Country): Phase[] {
  const arrival: Phase = {
    id: 'pa', title: 'Primeira semana lá', when: 'Ao chegar',
    tasks: [
      ...country.arrival.map((text, i) => ({ id: `${country.code}-a${i}`, text })),
      { id: 'contalocal', text: 'Abrir conta em banco local' },
      { id: 'curriculo', text: 'Adaptar o currículo ao formato do país' },
      { id: 'emergencia', text: `Salvar o número de emergência: ${country.emergency}` },
    ],
  };
  return [...BASE, arrival];
}
