const SYMBOL: Record<string, string> = {
  BRL: 'R$', EUR: '€', USD: 'US$', CAD: 'C$', AUD: 'A$', GBP: '£', NZD: 'NZ$', JPY: '¥', ZAR: 'R',
};

function group(int: string): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function num(n: number, decimals = 2): string {
  if (!isFinite(n)) n = 0;
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(decimals);
  const [i, d] = fixed.split('.');
  return (neg ? '-' : '') + group(i) + (d ? ',' + d : '');
}

export function money(n: number, cur: string, decimals?: number): string {
  const dec = decimals ?? (cur === 'JPY' ? 0 : 2);
  return `${SYMBOL[cur] ?? cur} ${num(n, dec)}`;
}

export const brl = (n: number, decimals = 2) => money(n, 'BRL', decimals);

export function parseNum(s: string): number {
  let clean = s.replace(/[^\d,.-]/g, '');
  // Sem vírgula e com um único ponto que não separa milhar (ex.: "1.5", teclado do celular): o ponto é decimal.
  if (!clean.includes(',') && /^-?\d*\.(\d{1,2}|\d{4,})$/.test(clean)) return parseFloat(clean) || 0;
  clean = clean.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(clean);
  return isFinite(n) ? n : 0;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[(m - 1) % 12]} ${y}`;
}

export function daysUntil(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  const target = new Date(y, m - 1, 1).getTime();
  return Math.ceil((target - Date.now()) / 86400000);
}

export function nextMonths(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() + i, 1);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

export function dateLabel(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
