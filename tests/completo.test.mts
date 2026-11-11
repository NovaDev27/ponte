// Testes das funções do Ponte Completo que não dependem do celular.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { phaseDue, phasesFor, tripDate } from '../src/data/checklist.ts';
import { getCountry } from '../src/data/countries.ts';
import { DEFAULT_FEES } from '../src/data/methods.ts';
import { budgetOf } from '../src/lib/budget.ts';
import { dateLabel } from '../src/lib/format.ts';
import { planHtml } from '../src/lib/planHtml.ts';
import type { Rates } from '../src/lib/rates.ts';

const rates: Rates = { values: { EUR: 0.16, USD: 0.18, CAD: 0.25 }, updated: 0, live: true };

const state = {
  onboarded: true,
  profile: { country: 'IE', city: 0, tripMonth: '2027-02', months: 6, style: 'mod' as const, savings: 25000, ticketBRL: 5000, courseLocal: 0 },
  done: { destino: true } as Record<string, boolean>,
  fees: DEFAULT_FEES,
  overrides: {} as Record<string, number>,
  serverUrl: '',
  deviceId: 'x',
  premium: false,
  rateAlert: null,
  reminders: false,
};

describe('prazos do checklist', () => {
  test('embarque no dia 1 do mês escolhido', () => {
    assert.equal(dateLabel(tripDate('2027-02')), '01/02/2027');
  });

  test('cada fase tem prazo em relação ao embarque', () => {
    assert.equal(dateLabel(phaseDue('p3', '2027-02') as Date), dateLabel(new Date(2027, 1, 1 - 90)));
    assert.equal(dateLabel(phaseDue('p0', '2027-02') as Date), '25/01/2027');
    assert.equal(dateLabel(phaseDue('pa', '2027-02') as Date), '08/02/2027');
  });

  test('todas as fases do checklist têm prazo, e em ordem', () => {
    const dues = phasesFor(getCountry('IE')).map((p) => phaseDue(p.id, '2027-02'));
    assert.ok(dues.every(Boolean));
    for (let i = 1; i < dues.length; i++) assert.ok((dues[i] as Date) > (dues[i - 1] as Date));
  });
});

describe('orçamento compartilhado', () => {
  test('soma custos de Dublin + seguro no estilo moderado', () => {
    const b = budgetOf(state, rates);
    assert.equal(b.monthly, 900 + 100 + 300 + 15 + 120 + 40);
    assert.equal(Math.round(b.totalBRL), Math.round((1475 / 0.16) * 6 + 5000));
  });

  test('valor editado pela pessoa substitui a estimativa', () => {
    const b = budgetOf({ ...state, overrides: { 'IE-0-moradia': 700 } }, rates);
    assert.equal(b.monthly, 1475 - 200);
  });
});

describe('plano em PDF', () => {
  test('traz cidade, total, melhor caminho e checklist com datas', () => {
    const html = planHtml(state, rates);
    assert.match(html, /Dublin, Irlanda/);
    assert.match(html, /Total da viagem/);
    assert.match(html, /class="best"/);
    assert.match(html, /até 05\/08\/2026/); // planejamento: 180 dias antes de 01/02/2027
    assert.match(html, /☑ Definir destino/);
  });

  test('a estrela de melhor caminho nunca vai para cripto, e a stablecoin vem com aviso', () => {
    const html = planHtml(state, rates);
    assert.match(html, /<tr class="best"><td>Conta global ★/);
    assert.match(html, /Stablecoin \(USDC\)\*/);
    assert.match(html, /\* Stablecoin: só como meio de transferência/);
  });
});

describe('nextPremium (conferência da compra com o Google Play)', async () => {
  const { nextPremium, PREMIUM_GRACE_MS } = await import('../src/lib/completo.ts');
  const now = 1_800_000_000_000;

  test('sem resposta da loja (null) não muda nada', () => {
    assert.equal(nextPremium({ premium: true }, null, now), null);
    assert.equal(nextPremium({ premium: false }, null, now), null);
  });

  test('a loja acha a compra: libera e esquece o "não achei"', () => {
    assert.deepEqual(nextPremium({ premium: false }, true, now), { premium: true, premiumMissAt: null });
    assert.deepEqual(nextPremium({ premium: true, premiumMissAt: now - 1000 }, true, now), { premium: true, premiumMissAt: null });
    assert.equal(nextPremium({ premium: true, premiumMissAt: null }, true, now), null);
  });

  test('primeiro "não tem" só anota, não tira o Completo', () => {
    assert.deepEqual(nextPremium({ premium: true }, false, now), { premium: true, premiumMissAt: now });
  });

  test('segundo "não tem" antes de 24 h não tira', () => {
    assert.equal(nextPremium({ premium: true, premiumMissAt: now - PREMIUM_GRACE_MS + 60_000 }, false, now), null);
  });

  test('segundo "não tem" depois de 24 h tira (reembolso)', () => {
    assert.deepEqual(nextPremium({ premium: true, premiumMissAt: now - PREMIUM_GRACE_MS }, false, now), { premium: false, premiumMissAt: null });
  });

  test('quem nunca comprou continua sem o Completo', () => {
    assert.equal(nextPremium({ premium: false }, false, now), null);
  });
});
