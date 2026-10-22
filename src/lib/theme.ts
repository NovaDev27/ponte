// Ponte — visual minimalista de intercâmbio
// Papel quente, navy vivo, um accent de "céu" e tipografia de viagem.

const NAVY = '#1B3A6B';
const SKY = '#4A7AB5';

export const C = {
  bg: '#F6F4F0',
  card: '#FFFFFF',
  sunk: '#ECEAE4',
  ink: '#121418',
  ink2: '#2A2E36',
  sub: '#5C6169',
  faint: '#8B8F97',
  line: '#E6E3DC',
  night: '#121418',
  night2: '#1E2229',
  navy: NAVY,
  navy2: '#2A5080',
  navyLight: '#A8BDD9',
  navySoft: '#E8EEF6',
  sky: SKY,
  skySoft: '#EAF1F8',
  primary: '#121418',
  primarySoft: '#EDEBE6',
  accent: NAVY,
  accentSoft: '#E8EEF6',
  good: NAVY,
  goodSoft: '#E8EEF6',
  bad: '#121418',
  badSoft: '#EDEBE6',
  warn: '#2A5080',
  warnSoft: '#E8EEF6',
  alert: '#B3261E',
  alertSoft: '#F7E6E4',
  cream: '#F6F4F0',
  creamSub: '#A8ABB2',
};

export const F = {
  cambio: { color: NAVY, soft: '#E8EEF6' },
  orcamento: { color: '#121418', soft: '#EDEBE6' },
  checklist: { color: NAVY, soft: '#E8EEF6' },
  assistente: { color: '#121418', soft: '#EDEBE6' },
  cripto: { color: NAVY, soft: '#E8EEF6' },
};

export const CAT = {
  moradia: '#F6F4F0',
  transporte: '#C5D4EA',
  alimentacao: '#8FA8D0',
  celular: '#5A7BB0',
  lazer: '#3A5A8C',
  seguro: '#6E727A',
};

export const FONT = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  display: 'BricolageGrotesque_700Bold',
  heavy: 'BricolageGrotesque_800ExtraBold',
  mono: 'DMMono_500Medium',
};

export const R = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

export const shadow = { boxShadow: '0px 8px 24px rgba(18, 20, 24, 0.06)' } as const;
export const lift = { boxShadow: '0px 14px 36px rgba(18, 20, 24, 0.12)' } as const;
