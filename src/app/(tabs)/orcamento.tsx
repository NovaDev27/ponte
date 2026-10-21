import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, ZoomIn } from 'react-native-reanimated';
import { PlanButton } from '../../components/PlanButton';
import { Card, Chip, ChipRow, CountUp, Field, Hero, Label, P, Ring, Row, Screen, Section, Stepper, Tap, Txt } from '../../components/ui';
import { COST_LABELS, CostKey, STYLE_LABEL } from '../../data/countries';
import { budgetOf } from '../../lib/budget';
import { brl, money, num, parseNum } from '../../lib/format';
import { EASE_OUT } from '../../lib/motion';
import { Style, useApp } from '../../lib/store';
import { C, CAT, F, FONT, R } from '../../lib/theme';

const COLOR = F.orcamento.color;
const KEYS = Object.keys(COST_LABELS) as CostKey[];
const STYLE_HINT: Record<Style, string> = {
  eco: 'Quarto dividido, cozinha em casa',
  mod: 'Quarto compartilhado, sai às vezes',
  conf: 'Quarto individual, mais passeios',
};
const STYLE_EMOJI: Record<Style, string> = { eco: '🎒', mod: '☕', conf: '🛋️' };

export default function Orcamento() {
  const { state, setProfile, update, rates } = useApp();
  const p = state.profile;
  const { country, city, rate, cur, keyOf, valueOf, monthly, monthlyBRL, totalBRL, coverage, monthsCovered } = budgetOf(state, rates);

  const parts = [...KEYS.map((k) => ({ key: k as string, label: COST_LABELS[k], value: valueOf(k), color: CAT[k] })), { key: 'seguro', label: 'Seguro', value: country.seguro, color: CAT.seguro }];
  const sum = parts.reduce((a, x) => a + x.value, 0) || 1;

  const setOverride = (k: CostKey, v: number) => update({ overrides: { ...state.overrides, [keyOf(k)]: v } });

  return (
    <Screen title="Orçamento" eyebrow="Passo 1 · Orçamento" eyebrowColor={COLOR} subtitle={`${country.flag} ${city.name}, ${country.name}`}>
      <Hero>
        <Txt w="mono" size={11} color={C.creamSub} style={{ letterSpacing: 1.2 }}>TOTAL DA VIAGEM · {p.months} MESES</Txt>
        <CountUp value={totalBRL} fromZero format={(v) => brl(v, 0)} style={{ color: C.cream, fontSize: 42, fontFamily: FONT.heavy, letterSpacing: -1 }} />
        <Txt size={15} color={C.cream}>{money(monthly, cur, 0)} por mês ≈ {brl(monthlyBRL, 0)}</Txt>
        <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 12, backgroundColor: 'rgba(245,241,234,0.1)', gap: 2 }}>
          {parts.map((x, i) => <Slice key={x.key} share={x.value / sum} color={x.color} delay={200 + i * 70} />)}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4, marginTop: 4 }}>
          {parts.map((x) => (
            <View key={x.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: x.color, }} />
              <Txt size={12} color={C.creamSub}>{x.label}</Txt>
            </View>
          ))}
        </View>
      </Hero>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring value={coverage} size={92} stroke={10} color={coverage >= 1 ? C.good : COLOR} track={F.orcamento.soft}>
            <Txt w="heavy" size={21}>{num(Math.min(coverage, 9.99) * 100, 0)}%</Txt>
          </Ring>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt w="display" size={18}>{coverage >= 1 ? 'Seu dinheiro já cobre tudo! 🎉' : `Faltam ${brl(totalBRL - p.savings, 0)}`}</Txt>
            <Txt size={14} color={C.sub}>
              {coverage >= 1 ? `Sobram ${brl(p.savings - totalBRL, 0)} de folga.` : `Com o que você tem, dá para cerca de ${num(monthsCovered, 1)} meses lá.`}
            </Txt>
          </View>
        </View>
        <Label style={{ marginTop: 4 }}>Quanto você já juntou</Label>
        <NumField value={p.savings} prefix="R$" onChange={(v) => setProfile({ savings: v })} />
      </Card>

      <Section title="Seu perfil" />
      <Card style={{ gap: 12 }}>
        <Label>Cidade</Label>
        <ChipRow>
          {country.cities.map((c, i) => <Chip key={c.name} label={c.name} active={i === p.city} color={COLOR} onPress={() => setProfile({ city: i })} />)}
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
                scaleTo={0.97}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.md, borderWidth: 1.5, borderColor: on ? COLOR : C.line, backgroundColor: on ? F.orcamento.soft : C.card }}
              >
                <Txt size={24} style={{ lineHeight: 30 }}>{STYLE_EMOJI[st]}</Txt>
                <View style={{ flex: 1 }}>
                  <Txt w="bold">{STYLE_LABEL[st]}</Txt>
                  <Txt size={13} color={C.sub}>{STYLE_HINT[st]}</Txt>
                </View>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: on ? COLOR : C.faint, backgroundColor: on ? COLOR : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {on ? (
                    <Animated.View entering={ZoomIn.springify().damping(12)}>
                      <Feather name="check" size={13} color="#FFFFFF" />
                    </Animated.View>
                  ) : null}
                </View>
              </Tap>
            );
          })}
        </View>
        <Label style={{ marginTop: 6 }}>Duração</Label>
        <Stepper value={p.months} onChange={(v) => setProfile({ months: v })} format={(v) => `${v} ${v === 1 ? 'mês' : 'meses'}`} color={COLOR} soft={F.orcamento.soft} />
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
      <PlanButton color={COLOR} />
    </Screen>
  );
}

// Fatia da barra do mês: cresce do zero até a sua parte.
function Slice({ share, color, delay }: { share: number; color: string; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withDelay(delay, withTiming(share, { duration: 700, easing: EASE_OUT })));
  }, [share, delay, v]);
  const st = useAnimatedStyle(() => ({ width: `${v.get() * 100}%` as `${number}%` }));
  return <Animated.View style={[{ height: '100%', backgroundColor: color, borderRadius: 3 }, st]} />;
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
        <Txt w="bold">{label}</Txt>
        <Txt size={12} color={C.sub}>≈ {brl(value / rate, 0)}</Txt>
      </View>
      <View style={{ width: 140 }}>
        <NumField value={value} prefix={cur} onChange={onChange} />
      </View>
    </View>
  );
}
