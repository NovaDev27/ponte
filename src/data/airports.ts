// Código de 3 letras de cada cidade, para o "cartão de embarque" do app.
// Cidades com mais de um aeroporto usam o código da cidade (LON, NYC, PAR, TYO).
const CODES: Record<string, string> = {
  Dublin: 'DUB', Cork: 'ORK', Galway: 'GWY',
  Toronto: 'YYZ', Vancouver: 'YVR', Montreal: 'YUL',
  Lisboa: 'LIS', Porto: 'OPO', Coimbra: 'COI',
  Sydney: 'SYD', Melbourne: 'MEL', Brisbane: 'BNE',
  Londres: 'LON', Manchester: 'MAN', Edimburgo: 'EDI',
  'Nova York': 'NYC', Boston: 'BOS', Miami: 'MIA',
  Auckland: 'AKL', Wellington: 'WLG',
  "St. Julian's / Sliema": 'MLA', Valletta: 'MLA',
  Madri: 'MAD', Barcelona: 'BCN', 'Valência': 'VLC',
  Berlim: 'BER', Munique: 'MUC',
  Paris: 'PAR', Lyon: 'LYS',
  'Tóquio': 'TYO', Osaka: 'OSA',
  'Cidade do Cabo': 'CPT', Joanesburgo: 'JNB',
};

export function cityCode(name: string): string {
  return CODES[name] ?? name.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
}
