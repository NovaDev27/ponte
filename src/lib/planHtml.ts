import { phaseDue, phasesFor } from '../data/checklist';
import { COST_LABELS, STYLE_LABEL } from '../data/countries';
import { FEES_CHECKED, highlightOf, METHODS, quote } from '../data/methods';
import { budgetOf, COST_KEYS } from './budget';
import { brl, dateLabel, money, monthLabel, num } from './format';
import { rateOf, type Rates } from './rates';
import type { AppState } from './store';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

// Monta o HTML do "Plano do intercâmbio" com os mesmos números das telas do app.
export function planHtml(state: AppState, rates: Rates): string {
  const p = state.profile;
  const b = budgetOf(state, rates);
  const { country, city, cur, rate } = b;
  const usd = rateOf(rates, 'USD');
  const today = dateLabel(new Date());

  const costRows = COST_KEYS.map((k) => `<tr><td>${esc(COST_LABELS[k])}</td><td>${money(b.valueOf(k), cur, 0)}</td><td>${brl(b.valueOf(k) / rate, 0)}</td></tr>`).join('')
    + `<tr><td>Seguro saúde</td><td>${money(country.seguro, cur, 0)}</td><td>${brl(country.seguro / rate, 0)}</td></tr>`;

  const sendBRL = Math.round(b.monthlyBRL);
  const quotes = METHODS.map((m) => ({ m, q: quote(m.id, sendBRL, rate, usd, state.fees, true) })).sort((x, y) => y.q.received - x.q.received);
  // A estrela vai para o melhor caminho tradicional: cripto aparece só como opção, com aviso de risco.
  const bestId = highlightOf(quotes).m.id;
  const quoteRows = quotes
    .map(({ m, q }) => {
      const best = m.id === bestId;
      const name = `${esc(m.name)}${m.id === 'cripto' ? '*' : ''}${best ? ' ★' : ''}`;
      return `<tr${best ? ' class="best"' : ''}><td>${name}</td><td>${money(q.received, cur)}</td><td>${brl(q.lostBRL)} (${num(q.lostPct, 1)}%)</td></tr>`;
    })
    .join('');

  const phases = phasesFor(country)
    .map((ph) => {
      const due = phaseDue(ph.id, p.tripMonth);
      const tasks = ph.tasks.map((t) => `<li class="${state.done[t.id] ? 'done' : ''}">${state.done[t.id] ? '☑' : '☐'} ${esc(t.text)}</li>`).join('');
      return `<h3>${esc(ph.title)} <span>${esc(ph.when)}${due ? ` · até ${dateLabel(due)}` : ''}</span></h3><ul>${tasks}</ul>`;
    })
    .join('');

  const gap = b.totalBRL - p.savings;

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, Roboto, 'Segoe UI', Arial, sans-serif; color: #122033; margin: 28px; font-size: 12px; }
  header { border-bottom: 3px solid #FF7A45; padding-bottom: 10px; margin-bottom: 16px; }
  h1 { margin: 0; font-size: 24px; color: #0F2338; }
  h2 { font-size: 16px; color: #1D4E7E; margin: 22px 0 8px; }
  h3 { font-size: 13px; margin: 14px 0 4px; } h3 span { font-weight: 400; color: #4A5B70; }
  .sub { color: #4A5B70; margin: 4px 0 0; }
  .grid { display: flex; gap: 10px; flex-wrap: wrap; }
  .box { flex: 1; min-width: 130px; background: #F3F6FA; border-radius: 10px; padding: 10px; }
  .box b { display: block; font-size: 17px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; } td, th { padding: 6px 8px; border-bottom: 1px solid #DDE5EE; text-align: left; }
  th { background: #E3ECF6; } tr.best td { background: #E0F2E9; font-weight: 700; }
  ul { list-style: none; padding: 0; margin: 0; } li { padding: 2px 0; } li.done { color: #4A5B70; text-decoration: line-through; }
  footer { margin-top: 24px; color: #4A5B70; font-size: 10px; border-top: 1px solid #DDE5EE; padding-top: 8px; }
  </style></head><body>
  <header><h1>Plano do intercâmbio · ${esc(city.name)}, ${esc(country.name)}</h1>
  <p class="sub">Embarque em ${esc(monthLabel(p.tripMonth))} · ${p.months} meses · estilo ${esc(STYLE_LABEL[p.style].toLowerCase())} · gerado em ${today} pelo app Ponte</p></header>

  <div class="grid">
    <div class="box">Total da viagem<b>${brl(b.totalBRL, 0)}</b></div>
    <div class="box">Custo por mês<b>${money(b.monthly, cur, 0)}</b>≈ ${brl(b.monthlyBRL, 0)}</div>
    <div class="box">Já juntou<b>${brl(p.savings, 0)}</b>${num(Math.min(b.coverage, 9.99) * 100, 0)}% do total</div>
    <div class="box">${gap > 0 ? 'Falta juntar' : 'Folga'}<b>${brl(Math.abs(gap), 0)}</b></div>
  </div>

  <h2>Orçamento mensal em ${esc(city.name)}</h2>
  <table><tr><th>Item</th><th>${cur}</th><th>Em reais</th></tr>${costRows}
  <tr><th>Total por mês</th><th>${money(b.monthly, cur, 0)}</th><th>${brl(b.monthlyBRL, 0)}</th></tr></table>
  <p class="sub">Custos únicos: passagem ${brl(p.ticketBRL, 0)}${p.courseLocal ? ` · curso ${money(p.courseLocal, cur, 0)}` : ''}. Cotação usada: 1 ${cur} = ${brl(1 / rate)}.</p>

  <h2>Como levar o dinheiro de cada mês (${brl(sendBRL, 0)})</h2>
  <table><tr><th>Caminho</th><th>Chega</th><th>Perde</th></tr>${quoteRows}</table>
  <p class="sub">Envio para conta no seu nome. Taxas de referência conferidas em ${FEES_CHECKED}.</p>
  <p class="sub">* Stablecoin: só como meio de transferência, não é investimento. Tem riscos (rede ou endereço errado sem estorno, golpes, problemas na exchange). Leia o guia de stablecoins no app antes de usar.</p>

  <h2>Checklist</h2>${phases}

  <footer>Estimativas para planejamento, com taxas e custos médios. Confirme valores, regras de visto e IOF nos sites oficiais e no serviço que você usar. A Ponte não movimenta dinheiro e não faz recomendação de investimento.</footer>
  </body></html>`;
}
