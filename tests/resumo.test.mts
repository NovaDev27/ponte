// Testes do resumo diário. Rodar com: npm test
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { phasesFor } from '../src/data/checklist.ts';
import { COUNTRIES } from '../src/data/countries.ts';
import { dailySummary, isRouteUrl, routeUrl } from '../src/lib/daily.ts';
import { budgetOf } from '../src/lib/budget.ts';
import { money } from '../src/lib/format.ts';

const country = COUNTRIES[0];
const rates = { values: { [country.currency]: 0.2 }, live: true, updated: 1 };
const state = {
  profile: { country: country.code, city: 0, tripMonth: '2027-02', style: 'mod', months: 6, savings: 25000, ticketBRL: 5000, courseLocal: 0, homeAddress: '' },
  done: {},
  overrides: {},
} as never;

describe('resumo diário', () => {
  test('traz cotação, orçamento do dia e a primeira tarefa aberta', () => {
    const b = budgetOf(state, rates as never);
    const lines = dailySummary(state, rates as never).split('\n');
    assert.equal(lines.length, 3);
    assert.match(lines[0], /R\$/);
    assert.equal(lines[1], `Hoje: até ${money(Math.round(b.monthly / 30), b.cur, 0)}`);
    assert.equal(lines[2], `Falta: ${phasesFor(country)[0].tasks[0].text}`);
  });

  test('com o cadastro feito, não pede para definir o destino', () => {
    const text = dailySummary({ ...(state as object), onboarded: true } as never, rates as never);
    assert.ok(!text.includes(phasesFor(country)[0].tasks[0].text));
    assert.ok(text.includes(`Falta: ${phasesFor(country)[0].tasks[1].text}`));
  });

  test('sem tarefas abertas, não fala de tarefa', () => {
    const done = Object.fromEntries(phasesFor(country).flatMap((p) => p.tasks).map((t) => [t.id, true]));
    const text = dailySummary({ ...(state as object), done } as never, rates as never);
    assert.equal(text.split('\n').length, 2);
    assert.ok(!text.includes('Falta:'));
  });

  test('a rota codifica o endereço e só aceita o link do Maps', () => {
    const url = routeUrl('Rua Ação, 10 & apto 2');
    assert.ok(url.includes('destination=Rua%20A%C3%A7%C3%A3o%2C%2010%20%26%20apto%202'));
    assert.ok(isRouteUrl(url));
    assert.ok(!isRouteUrl('https://exemplo.com'));
    assert.ok(!isRouteUrl(undefined));
  });
});
