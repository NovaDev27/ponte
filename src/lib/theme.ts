// Visual da Ponte: papel claro, preto e azul-escuro. Nada de outras cores:
// o que muda entre as funções é o tom (azul, preto ou o azul bem clarinho).
const NAVY = '#1A3263';

export const C = {
  bg: '#F4F2EE', // papel
  card: '#FFFFFF',
  sunk: '#EAE7E1', // fundo de campos e trilhos
  ink: '#121418',
  ink2: '#262A31',
  sub: '#666B73',
  faint: '#A4A6AA',
  line: '#E4E1DA',
  night: '#121418',
  night2: '#262A31',
  navy: NAVY,
  navy2: '#28457E',
  navyLight: '#9DB3DA', // azul para texto sobre fundo escuro
  navySoft: '#E3E8F1',
  primary: '#121418',
  primarySoft: '#E9E6E0',
  accent: NAVY,
  accentSoft: '#E3E8F1',
  good: NAVY,
  goodSoft: '#E3E8F1',
  bad: '#121418',
  badSoft: '#E9E6E0',
  warn: '#28457E',
  warnSoft: '#E3E8F1',
  alert: '#B3261E', // só para "atrasado" e erros
  alertSoft: '#F6E2E0',
  cream: '#F4F2EE', // texto claro sobre fundo escuro
  creamSub: '#A9ACB2',
};

// Cada função alterna entre azul-escuro e preto.
export const F = {
  cambio: { color: NAVY, soft: '#E3E8F1' },
  orcamento: { color: '#121418', soft: '#E9E6E0' },
  checklist: { color: NAVY, soft: '#E3E8F1' },
  assistente: { color: '#121418', soft: '#E9E6E0' },
  cripto: { color: NAVY, soft: '#E3E8F1' },
};

// Cores das categorias do orçamento: degradê do azul ao cinza (aparecem sobre o fundo escuro).
export const CAT = {
  moradia: '#F4F2EE',
  transporte: '#C3D0E6',
  alimentacao: '#8BA4CF',
  celular: '#5677AE',
  lazer: '#34528A',
  seguro: '#6B6F77',
};

// Tipografia: Bricolage Grotesque nos títulos, DM Sans no texto e DM Mono nos "códigos" de viagem.
export const FONT = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  display: 'BricolageGrotesque_700Bold',
  heavy: 'BricolageGrotesque_800ExtraBold',
  mono: 'DMMono_500Medium',
};

export const R = { sm: 12, md: 16, lg: 24, pill: 999 };

export const shadow = { boxShadow: '0px 10px 30px rgba(18, 20, 24, 0.07)' } as const;
export const lift = { boxShadow: '0px 18px 40px rgba(18, 20, 24, 0.16)' } as const;
