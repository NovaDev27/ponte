// Testes das contas do app. Rodar com: npm test
// Usa o executor de testes do próprio Node (sem dependências extras).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { phasesFor } from '../src/data/checklist.ts';
import { COST_LABELS, COUNTRIES, CURRENCIES, getCountry } from '../src/data/countries.ts';
import { OFFICIAL_LINKS } from '../src/data/links.ts';
import { DEFAULT_FEES, highlightOf, METHODS, quote } from '../src/data/methods.ts';
import { brl, money, num, parseNum, quoteUnit, rateLabel } from '../src/lib/format.ts';

const near = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} deveria ser ~${b}`);

// 1 real = 0,16 euro; 1 real = 0,18 dólar
const EUR = 0.16;
const USD = 0.18;

describe('quote: quanto chega em cada caminho', () => {
  test('conta global, conta própria: IOF 1,1% e spread 1,2%', () => {
    const q = quote('global', 1000, EUR, USD, DEFAULT_FEES, true);
    const base = 1000 / 1.011; // o IOF sai de dentro do valor
    near(q.iof, 1000 - base);
    near(q.spread, base * 0.012);
    near(q.received, (base - base * 0.012) * EUR);
    near(q.lostPct, 2.27, 0.01);
    near(q.lostBRL, q.iof + q.spread + q.fixed);
  });

  test('enviar para outra pessoa usa o IOF de terceiros (3,5%)', () => {
    const own = quote('global', 1000, EUR, USD, DEFAULT_FEES, true);
    const other = quote('global', 1000, EUR, USD, DEFAULT_FEES, false);
    near(other.iof, 1000 - 1000 / 1.035);
    assert.ok(other.received < own.received);
  });

  test('remessa desconta a tarifa fixa em reais', () => {
    const q = quote('remessa', 1000, EUR, USD, DEFAULT_FEES, true);
    near(q.fixed, DEFAULT_FEES.tarifaRemessa);
  });

  test('cripto converte a taxa de rede de dólar para real', () => {
    const q = quote('cripto', 1000, EUR, USD, DEFAULT_FEES, true);
    near(q.fixed, DEFAULT_FEES.redeCriptoUSD / USD);
  });

  test('com as taxas padrão, a conta global sai mais barata que cartão e espécie', () => {
    const got = (id: (typeof METHODS)[number]['id']) => quote(id, 3000, EUR, USD, DEFAULT_FEES, true).received;
    assert.ok(got('global') > got('cartao'));
    assert.ok(got('global') > got('especie'));
    assert.ok(got('remessa') > got('cartao'));
  });

  test('valor zero não gera NaN nem número negativo', () => {
    for (const m of METHODS) {
      const q = quote(m.id, 0, EUR, USD, DEFAULT_FEES, true);
      assert.ok(Number.isFinite(q.received) && Number.isFinite(q.lostPct), m.id);
      assert.equal(q.received, 0, m.id);
      assert.equal(q.lostPct, 0, m.id);
    }
  });

  test('valor menor que a tarifa fixa: chega zero, nunca negativo', () => {
    const q = quote('remessa', 30, EUR, USD, DEFAULT_FEES, true);
    assert.equal(q.received, 0);
    assert.ok(q.fixed >= 0);
    near(q.lostBRL, 30);
  });

  test('todo caminho perde algo e nunca chega mais que o valor sem taxas', () => {
    for (const m of METHODS) {
      const q = quote(m.id, 5000, EUR, USD, DEFAULT_FEES, true);
      assert.ok(q.received <= 5000 * EUR, m.id);
      assert.ok(q.lostBRL >= 0, m.id);
    }
  });
});

describe('formatação de números', () => {
  test('num usa ponto no milhar e vírgula nos centavos', () => {
    assert.equal(num(1234567.891), '1.234.567,89');
    assert.equal(num(0.5, 1), '0,5');
    assert.equal(num(-1500, 0), '-1.500');
    assert.equal(num(NaN), '0,00');
  });

  test('money e brl', () => {
    assert.equal(brl(1000), 'R$ 1.000,00');
    assert.equal(money(1500, 'EUR'), '€ 1.500,00');
    assert.equal(money(150000, 'JPY'), '¥ 150.000'); // iene sem centavos
  });

  test('parseNum entende o jeito brasileiro', () => {
    assert.equal(parseNum('1.000'), 1000);
    assert.equal(parseNum('1.000,50'), 1000.5);
    assert.equal(parseNum('R$ 2.500'), 2500);
    assert.equal(parseNum('3,5'), 3.5);
    assert.equal(parseNum(''), 0);
    assert.equal(parseNum('abc'), 0);
  });

  test('parseNum aceita ponto como decimal (teclado do celular)', () => {
    assert.equal(parseNum('1.1'), 1.1);
    assert.equal(parseNum('3.5'), 3.5);
    assert.equal(parseNum('10.25'), 10.25);
    assert.equal(parseNum('1.000.000'), 1000000);
  });
});

describe('dados dos países', () => {
  test('cada país tem cidades com todos os custos positivos', () => {
    for (const c of COUNTRIES) {
      assert.ok(c.cities.length > 0, c.code);
      for (const city of c.cities) {
        for (const k of Object.keys(COST_LABELS)) {
          const v = city.costs[k as keyof typeof city.costs];
          assert.ok(Number.isFinite(v) && v > 0, `${c.code} ${city.name} ${k}`);
        }
      }
    }
  });

  test('códigos únicos e busca por código', () => {
    const codes = COUNTRIES.map((c) => c.code);
    assert.equal(new Set(codes).size, codes.length);
    assert.equal(getCountry('IE').code, 'IE');
  });

  test('toda moeda do app tem país', () => {
    for (const cur of CURRENCIES) assert.ok(COUNTRIES.some((c) => c.currency === cur), cur);
  });

  test('checklist: tarefas com ids únicos em todos os países', () => {
    for (const c of COUNTRIES) {
      const ids = phasesFor(c).flatMap((p) => p.tasks.map((t) => t.id));
      assert.ok(ids.length > 0, c.code);
      assert.equal(new Set(ids).size, ids.length, `ids repetidos em ${c.code}`);
    }
  });
});

describe('links oficiais', () => {
  test('todo país tem links de visto e de embaixada, todos em https', () => {
    for (const c of COUNTRIES) {
      const links = OFFICIAL_LINKS[c.code];
      assert.ok(links?.length, `${c.code} sem links`);
      assert.ok(links.some((l) => l.kind === 'visto'), `${c.code} sem visto`);
      assert.ok(links.some((l) => l.kind === 'embaixada'), `${c.code} sem embaixada`);
      for (const l of links) assert.match(l.url, /^https:\/\//, `${c.code} ${l.url}`);
    }
  });
});

describe('destaque do melhor caminho', () => {
  test('nunca destaca cripto, mesmo quando é o mais barato', () => {
    const sorted = METHODS.map((m) => ({ m, q: quote(m.id, 30000, 0.16, 0.18, DEFAULT_FEES, true) })).sort((a, b) => b.q.received - a.q.received);
    assert.equal(sorted[0].m.id, 'cripto'); // em R$ 30 mil a stablecoin sai mais barata
    assert.equal(highlightOf(sorted).m.id, 'global');
  });
});

describe('cotação legível', () => {
  test('moedas fortes aparecem por 1 unidade', () => {
    assert.equal(quoteUnit(5.61), 1);
    assert.equal(rateLabel('EUR', 5.61), '€ 1 = R$ 5,61');
  });

  test('iene aparece por 100 e rand por 10', () => {
    assert.equal(rateLabel('JPY', 0.0368), '¥ 100 = R$ 3,68');
    assert.equal(rateLabel('ZAR', 0.31), 'R 10 = R$ 3,10');
  });
});
