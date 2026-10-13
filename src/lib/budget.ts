import { COST_LABELS, getCountry, STYLE_FACTOR, type CostKey } from '../data/countries';
import { rateOf, type Rates } from './rates';
import type { AppState } from './store';

export const COST_KEYS = Object.keys(COST_LABELS) as CostKey[];

// Conta do orçamento usada no Início, no Orçamento e no PDF (uma só, para os números baterem).
export function budgetOf(state: AppState, rates: Rates) {
  const p = state.profile;
  const country = getCountry(p.country);
  const city = country.cities[p.city] ?? country.cities[0];
  const rate = rateOf(rates, country.currency);
  const keyOf = (k: CostKey) => `${country.code}-${p.city}-${k}`;
  const valueOf = (k: CostKey) => state.overrides[keyOf(k)] ?? Math.round(city.costs[k] * STYLE_FACTOR[p.style]);

  const monthly = COST_KEYS.reduce((a, k) => a + valueOf(k), 0) + country.seguro; // moeda local
  const monthlyBRL = monthly / rate;
  const totalBRL = monthlyBRL * p.months + p.ticketBRL + p.courseLocal / rate;
  const coverage = totalBRL > 0 ? p.savings / totalBRL : 0;
  const monthsCovered = Math.max(0, (p.savings - p.ticketBRL - p.courseLocal / rate) / monthlyBRL);

  return { country, city, cur: country.currency, rate, keyOf, valueOf, monthly, monthlyBRL, totalBRL, coverage, monthsCovered };
}
