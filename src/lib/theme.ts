// Visual da Ponte: papel creme, tinta quase preta e um laranja de pôr do sol.
// Pensado para parecer um cartão de embarque: calmo, limpo e com cara de viagem.
export const C = {
  bg: '#F5F1EA', // papel
  card: '#FFFCF7',
  sunk: '#EDE7DC', // fundo de campos e trilhos
  ink: '#171B21',
  ink2: '#2A313C',
  sub: '#6A7079',
  faint: '#A8A39A',
  line: '#E6DFD3',
  night: '#171B21',
  night2: '#2A313C',
  primary: '#171B21',
  primarySoft: '#ECE6DC',
  accent: '#EE6A3C',
  accentSoft: '#FBE5DA',
  good: '#2F7D5B',
  goodSoft: '#E1EEE5',
  bad: '#C2412D',
  badSoft: '#F8E3DD',
  warn: '#9A6512',
  warnSoft: '#F6EBD6',
  cream: '#F5F1EA', // texto claro sobre fundo escuro
  creamSub: '#B9B3A8',
};

// Cada função do app tem a sua cor, para a pessoa se localizar rápido.
export const F = {
  cambio: { color: '#2F7D5B', soft: '#E1EEE5' },
  orcamento: { color: '#3B63C4', soft: '#E3E9F6' },
  checklist: { color: '#D2702A', soft: '#F8E6D5' },
  assistente: { color: '#171B21', soft: '#E9E3D8' },
  cripto: { color: '#1F8590', soft: '#DDEFF0' },
};

// Cores das categorias do orçamento
export const CAT = {
  moradia: '#3B63C4',
  transporte: '#1F8590',
  alimentacao: '#D2702A',
  celular: '#7B61D9',
  lazer: '#D9A21B',
  seguro: '#A8A39A',
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

export const shadow = { boxShadow: '0px 10px 30px rgba(23, 27, 33, 0.07)' } as const;
export const lift = { boxShadow: '0px 18px 40px rgba(23, 27, 33, 0.16)' } as const;
