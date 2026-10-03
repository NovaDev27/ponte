// Custos mensais estimados em moeda local, estilo "moderado" (quarto compartilhado).
// São referências aproximadas para planejamento, não preços oficiais.
export type CostKey = 'moradia' | 'transporte' | 'alimentacao' | 'celular' | 'lazer';
export type City = { name: string; costs: Record<CostKey, number> };
export type Country = {
  code: string;
  name: string;
  flag: string;
  currency: string;
  cities: City[];
  seguro: number; // seguro saúde/viagem, por mês, moeda local
  visa: string;
  work: string;
  arrival: string[]; // registros e números para tirar ao chegar
  emergency: string;
  site: { label: string; url: string };
  tip: string;
};

const c = (moradia: number, transporte: number, alimentacao: number, celular: number, lazer: number) => ({
  moradia, transporte, alimentacao, celular, lazer,
});

export const COUNTRIES: Country[] = [
  {
    code: 'IE', name: 'Irlanda', flag: '🇮🇪', currency: 'EUR', seguro: 40,
    cities: [
      { name: 'Dublin', costs: c(900, 100, 300, 15, 120) },
      { name: 'Cork', costs: c(650, 70, 280, 15, 100) },
      { name: 'Galway', costs: c(650, 60, 280, 15, 100) },
    ],
    visa: 'Brasileiros entram sem visto. Para curso de inglês de 25 semanas em escola credenciada, você registra a permissão de estudante (Stamp 2) depois de chegar.',
    work: 'Com Stamp 2: até 20 h por semana durante as aulas e 40 h nas férias oficiais.',
    arrival: ['Agendar registro de imigração (IRP)', 'Tirar o PPS Number (número fiscal)', 'Comprar o Leap Card (transporte)'],
    emergency: '112 ou 999',
    site: { label: 'irishimmigration.ie', url: 'https://www.irishimmigration.ie' },
    tip: 'Aluguel em Dublin é o maior gasto. Reserve 2 a 4 semanas de hospedagem temporária e procure quarto já lá.',
  },
  {
    code: 'CA', name: 'Canadá', flag: '🇨🇦', currency: 'CAD', seguro: 90,
    cities: [
      { name: 'Toronto', costs: c(1200, 156, 450, 45, 150) },
      { name: 'Vancouver', costs: c(1250, 110, 450, 45, 150) },
      { name: 'Montreal', costs: c(800, 97, 400, 45, 130) },
    ],
    visa: 'Cursos de mais de 6 meses exigem Study Permit. Para entrar, brasileiros precisam de visto de visitante ou eTA, conforme o histórico de vistos.',
    work: 'Alunos de college e universidade elegíveis podem trabalhar fora do campus em meio período. Curso só de idioma geralmente não dá direito a trabalho.',
    arrival: ['Tirar o SIN (Social Insurance Number)', 'Abrir conta em banco local', 'Contratar seguro saúde provincial, se aplicável'],
    emergency: '911',
    site: { label: 'canada.ca', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
    tip: 'O inverno pede roupa adequada. Compre lá, em brechós ou lojas de desconto, que sai mais barato que levar do Brasil.',
  },
  {
    code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', seguro: 35,
    cities: [
      { name: 'Lisboa', costs: c(600, 40, 250, 12, 100) },
      { name: 'Porto', costs: c(450, 40, 230, 12, 90) },
      { name: 'Coimbra', costs: c(300, 30, 220, 12, 80) },
    ],
    visa: 'Para estudar por mais de 90 dias, peça o visto de estudo no consulado antes de viajar.',
    work: 'Estudantes com autorização de residência podem trabalhar, desde que a atividade seja comunicada às autoridades.',
    arrival: ['Tirar o NIF (número fiscal)', 'Pedir o NISS (Segurança Social)', 'Registrar-se no centro de saúde (número de utente)'],
    emergency: '112',
    site: { label: 'vistos.mne.gov.pt', url: 'https://vistos.mne.gov.pt' },
    tip: 'O passe Navegante em Lisboa custa pouco e cobre metrô, ônibus e trens da região.',
  },
  {
    code: 'AU', name: 'Austrália', flag: '🇦🇺', currency: 'AUD', seguro: 70,
    cities: [
      { name: 'Sydney', costs: c(1300, 200, 500, 35, 200) },
      { name: 'Melbourne', costs: c(1100, 180, 480, 35, 180) },
      { name: 'Brisbane', costs: c(1000, 150, 470, 35, 170) },
    ],
    visa: 'Student Visa (subclass 500), com seguro saúde OSHC obrigatório pelo período do visto.',
    work: 'Durante as aulas: até 48 h por quinzena. Nas férias oficiais, sem limite.',
    arrival: ['Pedir o TFN (Tax File Number)', 'Abrir conta em banco local', 'Comprar o cartão de transporte (Opal, Myki, go card)'],
    emergency: '000',
    site: { label: 'immi.homeaffairs.gov.au', url: 'https://immi.homeaffairs.gov.au' },
    tip: 'Aluguel costuma ser anunciado por semana. Multiplique por 4,33 para ter o valor mensal.',
  },
  {
    code: 'GB', name: 'Reino Unido', flag: '🇬🇧', currency: 'GBP', seguro: 40,
    cities: [
      { name: 'Londres', costs: c(950, 180, 280, 12, 150) },
      { name: 'Manchester', costs: c(600, 80, 250, 12, 120) },
      { name: 'Edimburgo', costs: c(650, 70, 250, 12, 120) },
    ],
    visa: 'Curso de inglês de até 11 meses: Short-term Study Visa, sem direito a trabalho. Graduação e pós: Student Visa. Visitas curtas exigem a autorização eletrônica ETA.',
    work: 'Com Student Visa de nível superior: até 20 h por semana durante as aulas.',
    arrival: ['Ativar o eVisa (status digital)', 'Pedir o National Insurance Number, se for trabalhar', 'Registrar-se num médico local (GP)'],
    emergency: '999',
    site: { label: 'gov.uk', url: 'https://www.gov.uk/browse/visas-immigration' },
    tip: 'Em Londres, um cartão contactless de débito funciona direto no metrô, sem precisar de Oyster.',
  },
  {
    code: 'US', name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD', seguro: 120,
    cities: [
      { name: 'Nova York', costs: c(1500, 132, 500, 40, 200) },
      { name: 'Boston', costs: c(1300, 90, 450, 40, 180) },
      { name: 'Miami', costs: c(1100, 110, 450, 40, 180) },
    ],
    visa: 'Para estudar, visto F-1, com o formulário I-20 da escola e a taxa SEVIS. O visto de turista não permite curso regular.',
    work: 'Com F-1: trabalho limitado, em geral no próprio campus, até 20 h por semana durante as aulas.',
    arrival: ['Validar o I-20 com a escola', 'Abrir conta em banco local', 'Contratar plano de celular pré-pago'],
    emergency: '911',
    site: { label: 'travel.state.gov', url: 'https://travel.state.gov' },
    tip: 'Seguro saúde é caro e essencial. Uma consulta sem seguro pode custar centenas de dólares.',
  },
  {
    code: 'NZ', name: 'Nova Zelândia', flag: '🇳🇿', currency: 'NZD', seguro: 60,
    cities: [
      { name: 'Auckland', costs: c(1100, 200, 450, 40, 160) },
      { name: 'Wellington', costs: c(1000, 180, 430, 40, 150) },
    ],
    visa: 'Turismo: isenção de visto com a autorização eletrônica NZeTA. Estudo de longa duração: Student Visa.',
    work: 'Depende do curso. Muitos cursos só de inglês não dão direito a trabalho. Confira as condições do seu visto.',
    arrival: ['Pedir o IRD Number (número fiscal)', 'Abrir conta em banco local', 'Comprar o cartão de transporte (AT HOP, Snapper)'],
    emergency: '111',
    site: { label: 'immigration.govt.nz', url: 'https://www.immigration.govt.nz' },
    tip: 'Supermercados de desconto e feiras de bairro ajudam muito no custo de comida.',
  },
  {
    code: 'MT', name: 'Malta', flag: '🇲🇹', currency: 'EUR', seguro: 30,
    cities: [
      { name: "St. Julian's / Sliema", costs: c(550, 20, 250, 15, 120) },
      { name: 'Valletta', costs: c(500, 20, 240, 15, 110) },
    ],
    visa: 'Turismo: até 90 dias sem visto. Cursos mais longos pedem visto de estudo nacional.',
    work: 'Estudantes de inglês de longa duração podem pedir permissão de trabalho em meio período depois de um período mínimo de curso.',
    arrival: ['Pedir a residência e o ID card (Identità)', 'Ativar o cartão de transporte Tallinja', 'Abrir conta em banco local'],
    emergency: '112',
    site: { label: 'identita.gov.mt', url: 'https://identita.gov.mt' },
    tip: 'Com o cartão Tallinja personalizado, o transporte público para residentes é gratuito.',
  },
  {
    code: 'ES', name: 'Espanha', flag: '🇪🇸', currency: 'EUR', seguro: 35,
    cities: [
      { name: 'Madri', costs: c(500, 20, 250, 12, 100) },
      { name: 'Barcelona', costs: c(550, 22, 260, 12, 110) },
      { name: 'Valência', costs: c(400, 20, 230, 12, 90) },
    ],
    visa: 'Para cursos de mais de 90 dias, visto de estudante (estância por estudos) pedido no consulado.',
    work: 'Estudantes podem trabalhar em meio período, dentro dos limites da autorização de estudos.',
    arrival: ['Tirar o NIE e o cartão TIE', 'Fazer o empadronamiento (registro de endereço)', 'Pedir o passe de transporte jovem'],
    emergency: '112',
    site: { label: 'exteriores.gob.es', url: 'https://www.exteriores.gob.es' },
    tip: 'O empadronamiento abre portas: saúde pública, transporte com desconto e outros serviços.',
  },
  {
    code: 'DE', name: 'Alemanha', flag: '🇩🇪', currency: 'EUR', seguro: 120,
    cities: [
      { name: 'Berlim', costs: c(650, 58, 280, 15, 110) },
      { name: 'Munique', costs: c(800, 58, 300, 15, 120) },
    ],
    visa: 'Visto de estudante ou de curso de idioma, normalmente com comprovação financeira por conta bloqueada (Sperrkonto).',
    work: 'Universitários podem trabalhar um número limitado de dias por ano. Curso só de idioma tem regras mais restritas.',
    arrival: ['Fazer o Anmeldung (registro de endereço)', 'Receber o Steuer-ID (número fiscal)', 'Contratar seguro saúde alemão'],
    emergency: '112',
    site: { label: 'make-it-in-germany.com', url: 'https://www.make-it-in-germany.com' },
    tip: 'O Deutschlandticket dá acesso ao transporte regional do país inteiro por um preço mensal fixo.',
  },
  {
    code: 'FR', name: 'França', flag: '🇫🇷', currency: 'EUR', seguro: 35,
    cities: [
      { name: 'Paris', costs: c(750, 88, 300, 15, 130) },
      { name: 'Lyon', costs: c(500, 70, 270, 15, 110) },
    ],
    visa: 'Visto de estudante de longa duração (VLS-TS), que precisa ser validado online depois da chegada.',
    work: 'Estudantes podem trabalhar até um limite anual de horas, em torno de 60% do tempo integral.',
    arrival: ['Validar o VLS-TS online', 'Pedir auxílio-moradia na CAF', 'Abrir conta em banco local'],
    emergency: '112',
    site: { label: 'france-visas.gouv.fr', url: 'https://france-visas.gouv.fr' },
    tip: 'Estudantes podem receber auxílio de moradia da CAF. Vale pedir logo nas primeiras semanas.',
  },
  {
    code: 'JP', name: 'Japão', flag: '🇯🇵', currency: 'JPY', seguro: 3000,
    cities: [
      { name: 'Tóquio', costs: c(80000, 10000, 45000, 3000, 15000) },
      { name: 'Osaka', costs: c(60000, 8000, 40000, 3000, 12000) },
    ],
    visa: 'Turismo curto: isenção de visto para brasileiros. Estudo de longa duração: visto de estudante, com o Certificado de Elegibilidade (COE) emitido pela escola.',
    work: 'Com permissão especial: até 28 h por semana durante as aulas.',
    arrival: ['Receber o Residence Card no aeroporto', 'Registrar o endereço na prefeitura', 'Receber o My Number e aderir ao seguro nacional'],
    emergency: '110 (polícia) · 119 (bombeiros e ambulância)',
    site: { label: 'mofa.go.jp', url: 'https://www.mofa.go.jp/j_info/visit/visa/' },
    tip: 'Share houses saem bem mais baratas que apartamentos e já vêm mobiliadas.',
  },
  {
    code: 'ZA', name: 'África do Sul', flag: '🇿🇦', currency: 'ZAR', seguro: 600,
    cities: [
      { name: 'Cidade do Cabo', costs: c(7000, 1200, 4000, 400, 1500) },
      { name: 'Joanesburgo', costs: c(6500, 1500, 4000, 400, 1500) },
    ],
    visa: 'Turismo: até 90 dias sem visto. Estudo mais longo exige visto de estudante.',
    work: 'Estudantes de nível superior podem trabalhar em meio período, conforme as condições do visto.',
    arrival: ['Comprar chip local (RICA)', 'Abrir conta em banco local', 'Combinar transporte seguro com a escola'],
    emergency: '10111 (polícia) · 112 (celular)',
    site: { label: 'dha.gov.za', url: 'http://www.dha.gov.za' },
    tip: 'O custo de vida é baixo, mas segurança pede atenção: use transporte por aplicativo à noite.',
  },
];

export const COST_LABELS: Record<CostKey, string> = {
  moradia: 'Moradia',
  transporte: 'Transporte',
  alimentacao: 'Alimentação',
  celular: 'Celular',
  lazer: 'Lazer e extras',
};

export const STYLE_FACTOR = { eco: 0.8, mod: 1, conf: 1.35 } as const;
export const STYLE_LABEL = { eco: 'Econômico', mod: 'Moderado', conf: 'Confortável' } as const;

export function getCountry(code: string): Country {
  return COUNTRIES.find((x) => x.code === code) ?? COUNTRIES[0];
}

export const CURRENCIES = Array.from(new Set(COUNTRIES.map((x) => x.currency)));
