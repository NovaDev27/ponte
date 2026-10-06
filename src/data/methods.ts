// Taxas de referência. IOF segundo as regras vigentes em 2025; spreads e tarifas
// são médias de mercado. Tudo pode ser ajustado na tela de Ajustes.
export type Fees = {
  iofCartao: number;
  iofEspecie: number;
  iofPropria: number;
  iofTerceiros: number;
  iofCripto: number;
  spreadCartao: number;
  spreadGlobal: number;
  spreadEspecie: number;
  spreadRemessa: number;
  tarifaRemessa: number; // R$
  spreadCripto: number;
  saidaCripto: number;
  redeCriptoUSD: number; // US$
};

// Data da última conferência das taxas padrão com simulações reais.
export const FEES_CHECKED = '05/10/2026';

export const DEFAULT_FEES: Fees = {
  iofCartao: 3.5,
  iofEspecie: 3.5,
  iofPropria: 1.1,
  iofTerceiros: 3.5,
  iofCripto: 0,
  spreadCartao: 5,
  spreadGlobal: 1.2,
  spreadEspecie: 6,
  spreadRemessa: 3,
  tarifaRemessa: 60,
  spreadCripto: 1,
  saidaCripto: 1,
  redeCriptoUSD: 1,
};

export const FEE_FIELDS: { key: keyof Fees; label: string; unit: '%' | 'R$' | 'US$' }[] = [
  { key: 'iofCartao', label: 'IOF cartão internacional', unit: '%' },
  { key: 'iofEspecie', label: 'IOF compra de dinheiro em espécie', unit: '%' },
  { key: 'iofPropria', label: 'IOF envio para conta própria', unit: '%' },
  { key: 'iofTerceiros', label: 'IOF envio para outra pessoa', unit: '%' },
  { key: 'iofCripto', label: 'IOF compra de cripto', unit: '%' },
  { key: 'spreadCartao', label: 'Spread do cartão do banco', unit: '%' },
  { key: 'spreadGlobal', label: 'Spread da conta global', unit: '%' },
  { key: 'spreadEspecie', label: 'Spread da casa de câmbio', unit: '%' },
  { key: 'spreadRemessa', label: 'Spread da remessa bancária', unit: '%' },
  { key: 'tarifaRemessa', label: 'Tarifa fixa da remessa', unit: 'R$' },
  { key: 'spreadCripto', label: 'Spread + taxa ao comprar USDC', unit: '%' },
  { key: 'saidaCripto', label: 'Taxa para vender USDC lá fora', unit: '%' },
  { key: 'redeCriptoUSD', label: 'Taxa da rede na transferência', unit: 'US$' },
];

export type MethodId = 'global' | 'cripto' | 'remessa' | 'cartao' | 'especie';

export type Method = {
  id: MethodId;
  name: string;
  short: string;
  icon: 'globe' | 'link' | 'send' | 'credit-card' | 'dollar-sign';
  steps: string[];
  watch: string[];
};

export const METHODS: Method[] = [
  {
    id: 'global',
    name: 'Conta global',
    short: 'Conta digital em moeda estrangeira (ex.: Wise, Nomad e similares)',
    icon: 'globe',
    steps: [
      'Abra uma conta global pelo app, ainda no Brasil.',
      'Transfira reais e converta para a moeda do destino.',
      'Use o cartão de débito da conta lá fora ou transfira para sua conta local.',
    ],
    watch: ['Confira a cotação mostrada antes de confirmar.', 'Alguns saques em caixa eletrônico cobram tarifa.'],
  },
  {
    id: 'cripto',
    name: 'Stablecoin (USDC)',
    short: 'Comprar dólar digital numa exchange e vender no destino',
    icon: 'link',
    steps: [
      'Compre USDC numa exchange brasileira autorizada, pagando com Pix.',
      'Envie para uma exchange do país de destino, na mesma rede (ex.: Polygon, Base, Solana).',
      'Venda o USDC pela moeda local e saque para sua conta de lá.',
    ],
    watch: [
      'Enviar na rede errada pode fazer você perder o dinheiro para sempre.',
      'Use só exchanges reguladas e ative a autenticação em dois fatores.',
      'Isto é um meio de transferência, não um investimento.',
    ],
  },
  {
    id: 'remessa',
    name: 'Remessa bancária',
    short: 'Transferência internacional pelo banco ou empresa de remessa',
    icon: 'send',
    steps: ['Peça a cotação ao banco ou empresa de remessa.', 'Informe os dados da conta de destino (IBAN, SWIFT etc.).', 'O dinheiro chega em 1 a 5 dias úteis.'],
    watch: ['A tarifa fixa pesa muito em valores pequenos.', 'O banco de destino pode cobrar taxa de recebimento.'],
  },
  {
    id: 'cartao',
    name: 'Cartão de crédito do banco',
    short: 'Pagar lá fora com o cartão brasileiro comum',
    icon: 'credit-card',
    steps: ['Avise o banco da viagem.', 'Pague em moeda local, nunca aceite a conversão para reais na maquininha.'],
    watch: ['A cotação é a do dia do fechamento da fatura em muitos bancos.', 'É o jeito mais caro para gastos do dia a dia.'],
  },
  {
    id: 'especie',
    name: 'Dinheiro em espécie',
    short: 'Comprar notas numa casa de câmbio no Brasil',
    icon: 'dollar-sign',
    steps: ['Compare cotações em casas de câmbio autorizadas pelo Banco Central.', 'Leve só o necessário para os primeiros dias.'],
    watch: ['Risco de perda ou roubo.', 'Notas ruins ou antigas podem ser recusadas.'],
  },
];

export type Quote = {
  id: MethodId;
  received: number;
  lostBRL: number;
  lostPct: number;
  iof: number;
  spread: number;
  fixed: number;
};

// rate = unidades da moeda de destino por 1 real; usdPerBRL = dólares por 1 real
export function quote(id: MethodId, amount: number, rate: number, usdPerBRL: number, f: Fees, own: boolean): Quote {
  let iofPct = 0;
  let spreadPct = 0;
  let fixed = 0;
  switch (id) {
    case 'global':
      iofPct = own ? f.iofPropria : f.iofTerceiros;
      spreadPct = f.spreadGlobal;
      break;
    case 'cripto':
      iofPct = f.iofCripto;
      spreadPct = f.spreadCripto + f.saidaCripto;
      fixed = usdPerBRL > 0 ? f.redeCriptoUSD / usdPerBRL : 0;
      break;
    case 'remessa':
      iofPct = own ? f.iofPropria : f.iofTerceiros;
      spreadPct = f.spreadRemessa;
      fixed = f.tarifaRemessa;
      break;
    case 'cartao':
      iofPct = f.iofCartao;
      spreadPct = f.spreadCartao;
      break;
    case 'especie':
      iofPct = f.iofEspecie;
      spreadPct = f.spreadEspecie;
      break;
  }
  const base = amount / (1 + iofPct / 100);
  const iof = amount - base;
  const spread = (base * spreadPct) / 100;
  const net = Math.max(0, base - spread - fixed);
  const lostBRL = amount - net;
  return {
    id,
    received: net * rate,
    lostBRL,
    lostPct: amount > 0 ? (lostBRL / amount) * 100 : 0,
    iof,
    spread,
    fixed: Math.min(fixed, Math.max(0, base - spread)),
  };
}
