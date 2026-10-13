import { CURRENCIES } from '../data/countries';

// Cotações de reserva (unidades por 1 real) caso o app esteja offline.
export const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.16, USD: 0.18, CAD: 0.25, AUD: 0.28, GBP: 0.135, NZD: 0.31, JPY: 27, ZAR: 3.2,
};

export type Rates = { values: Record<string, number>; updated: number | null; live: boolean };

export function rateOf(rates: Rates, cur: string): number {
  return rates.values[cur] ?? FALLBACK_RATES[cur] ?? 1;
}

export async function fetchRates(): Promise<Rates | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/BRL');
    const json = await res.json();
    if (json?.result !== 'success') return null;
    const values: Record<string, number> = {};
    for (const c of [...CURRENCIES, 'USD']) if (json.rates[c]) values[c] = json.rates[c];
    return { values, updated: Date.now(), live: true };
  } catch {
    return null;
  }
}
