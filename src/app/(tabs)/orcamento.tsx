import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { PlanButton } from '../../components/PlanButton';
import { Card, Chip, ChipRow, Field, Hero, Label, P, Ring, Row, Screen, Section, Tap } from '../../components/ui';
import { COST_LABELS, CostKey, STYLE_LABEL } from '../../data/countries';
import { budgetOf } from '../../lib/budget';
import { brl, money, num, parseNum } from '../../lib/format';
import { Style, useApp } from '../../lib/store';
import { C, CAT, F } from '../../lib/theme';

const KEYS = Object.keys(COST_LABELS) as CostKey[];
const STYLE_HINT: Record<Style, string> = {
  eco: 'Quarto dividido, cozinha em casa',
  mod: 'Quarto compartilhado, sai às vezes',
  conf: 'Quarto individual, mais passeios',
};

export default function Orcamento() {
  const { state, setProfile, update, rates } = useApp();
  const p = state.profile;
  const { country, city, rate, cur, keyOf, valueOf, monthly, monthlyBRL, totalBRL, coverage, monthsCovered } = budgetOf(state, rates);

  const parts = [...KEYS.map((k) => ({ key: k as string, label: COST_LABELS[k], value: valueOf(k), color: CAT[k] })), { key: 'seguro', label: 'Seguro saúde', value: country.seguro, color: CAT.seguro }];

  const setOverride = (k: CostKey, v: number) => update({ overrides: { ...state.overrides, [keyOf(k)]: v } });

  return (
    <Screen title="Orçamento" eyebrow="Passo 1 · Orçamento" eyebrowColor={F.orcamento.color} subtitle={`${country.flag} ${city.name}, ${country.name}`}>
      <Hero colors={['#1A4FA8', '#2F6FD6']}>
        <Text style={{ color: '#CFE0FA', fontWeight: '700', fontSize: 13, letterSpacing: 0.6 }}>TOTAL DA VIAGEM · {p.months} MESES</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 38, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] }}>{brl(totalBRL, 0)}</Text>
        <Text style={{ color: '#E2ECFB', fontSize: 15 }}>
          {money(monthly, cur, 0)} por mês ≈ {brl(monthlyBRL, 0)}
        </Text>
        <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)' }}>
          {parts.map((x) => <View key={x.key} style={{ flex: Math.max(0.0001, x.value), backgroundColor: x.color, borderRightWidth: 2, borderRightColor: '#2F6FD6' }} />)}
        </View>
        <Text style={{ color: '#CFE0FA', fontSize: 12 }}>Para onde vai o dinheiro de cada mês</Text>
      </Hero>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring value={coverage} size={88} stroke={10} color={coverage >= 1 ? C.good : F.orcamento.color} track={F.orcamento.soft}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{num(Math.min(coverage, 9.99) * 100, 0)}%</Text>
          </Ring>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>
              {coverage >= 1 ? 'Seu dinheiro já cobre tudo!' : `Faltam ${brl(totalBRL - p.savings, 0)}`}
            </Text>
            <Text style={{ color: C.sub, fontSize: 14 }}>
              {coverage >= 1
                ? `Sobram ${brl(p.savings - totalBRL, 0)} de folga.`
                : `Com o que você tem, dá para cerca de ${num(monthsCovered, 1)} meses lá.`}
            </Text>
          </View>
        </View>
        <Label>Quanto você já juntou</Label>
        <NumField value={p.savings} prefix="R$" onChange={(v) => setProfile({ savings: v })} />
      </Card>

      <Section title="Seu perfil" />
      <Card>
        <Label>Cidade</Label>
        <ChipRow>
          {country.cities.map((c, i) => <Chip key={c.name} label={c.name} active={i === p.city} color={F.orcamento.color} onPress={() => setProfile({ city: i })} />)}
        </ChipRow>
        <Label style={{ marginTop: 6 }}>Estilo de vida</Label>
        <View style={{ gap: 8 }}>
          {(Object.keys(STYLE_LABEL) as Style[]).map((st) => {
            const on = st === p.style;
            return (
              <Tap
                key={st}
                onPress={() => setProfile({ style: st })}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 2, borderColor: on ? F.orcamento.color : C.line, backgroundColor: on ? F.orcamento.soft : C.card }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? F.orcamento.color : C.faint, alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: F.orcamento.color }} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: C.ink }}>{STYLE_LABEL[st]}</Text>
                  <Text style={{ color: C.sub, fontSize: 13 }}>{STYLE_HINT[st]}</Text>
                </View>
              </Tap>
            );
          })}
        </View>
        <Label style={{ marginTop: 6 }}>Duração</Label>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Step label="−" onPress={() => setProfile({ months: Math.max(1, p.months - 1) })} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, minWidth: 100, textAlign: 'center' }}>{p.months} meses</Text>
          <Step label="+" onPress={() => setProfile({ months: Math.min(36, p.months + 1) })} />
        </View>
      </Card>

      <Section title="Gastos por mês" hint="Estimativas. Toque num valor para trocar pelo seu." />
      <Card style={{ gap: 14 }}>
        {KEYS.map((k) => (
          <CostRow key={k} label={COST_LABELS[k]} color={CAT[k]} cur={cur} value={valueOf(k)} rate={rate} onChange={(v) => setOverride(k, v)} />
        ))}
        <Row left="Seguro saúde (estimado)" right={money(country.seguro, cur, 0)} dot={CAT.seguro} />
        <View style={{ height: 1, backgroundColor: C.line }} />
        <Row left="Total por mês" right={money(monthly, cur, 0)} strong />
      </Card>

      <Section title="Gastos únicos" />
      <Card>
        <Label>Passagem (R$)</Label>
        <NumField value={p.ticketBRL} prefix="R$" onChange={(v) => setProfile({ ticketBRL: v })} />
        <Label style={{ marginTop: 6 }}>Curso ou escola ({cur})</Label>
        <NumField value={p.courseLocal} prefix={cur} onChange={(v) => setProfile({ courseLocal: v })} />
      </Card>

      <P muted style={{ fontSize: 13 }}>
        Convertido pela cotação comercial ({brl(1 / rate)} por {cur}). Na prática, some de 1% a 8% de custo de câmbio, conforme o caminho escolhido na aba Câmbio.
      </P>
      <PlanButton color={F.orcamento.color} />
    </Screen>
  );
}

function Step({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: F.orcamento.soft, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: F.orcamento.color }}>{label}</Text>
    </Tap>
  );
}

function NumField({ value, prefix, onChange }: { value: number; prefix: string; onChange: (v: number) => void }) {
  const [text, setText] = useState(num(value, 0));
  // Mostra o que a pessoa digitou; se o valor mudar por fora (ex.: trocar de cidade), mostra o novo valor.
  const shown = parseNum(text) === value ? text : num(value, 0);
  return <Field value={shown} prefix={prefix} onChangeText={(t) => { setText(t); onChange(parseNum(t)); }} />;
}

function CostRow({ label, color, cur, value, rate, onChange }: { label: string; color: string; cur: string; value: number; rate: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: C.ink, fontWeight: '700' }}>{label}</Text>
        <Text style={{ fontSize: 12, color: C.sub }}>≈ {brl(value / rate, 0)}</Text>
      </View>
      <View style={{ width: 140 }}>
        <NumField value={value} prefix={cur} onChange={onChange} />
      </View>
    </View>
  );
}
