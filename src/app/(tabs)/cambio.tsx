import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { ShareResult } from '../../components/ShareResult';
import { Badge, Bar, Card, Chip, ChipRow, CountUp, Explain, Field, Hero, IconBox, Label, P, Row, Screen, Section, Segment, Tap, Txt } from '../../components/ui';
import { CURRENCIES, getCountry } from '../../data/countries';
import { FEES_CHECKED, highlightOf, METHODS, quote } from '../../data/methods';
import { brl, money, num, parseNum, rateLabel } from '../../lib/format';
import { rateOf, useApp } from '../../lib/store';
import { C, F, FONT, R } from '../../lib/theme';

const COLOR = F.cambio.color;

const FLAG: Record<string, string> = { EUR: '🇪🇺', USD: '🇺🇸', CAD: '🇨🇦', AUD: '🇦🇺', GBP: '🇬🇧', NZD: '🇳🇿', JPY: '🇯🇵', ZAR: '🇿🇦' };
const QUICK = [500, 1000, 3000, 10000];

export default function Cambio() {
  const { state, rates } = useApp();
  const [amountText, setAmountText] = useState('1.000');
  const country = getCountry(state.profile.country);
  const [cur, setCur] = useState(country.currency);
  const [own, setOwn] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const amount = parseNum(amountText);
  const rate = rateOf(rates, cur);
  const usd = rateOf(rates, 'USD');

  const quotes = useMemo(
    () => METHODS.map((m) => ({ m, q: quote(m.id, amount, rate, usd, state.fees, own) })).sort((a, b) => b.q.received - a.q.received),
    [amount, rate, usd, state.fees, own],
  );
  const best = highlightOf(quotes);
  const worst = quotes[quotes.length - 1];
  const saving = worst.q.lostBRL - best.q.lostBRL;
  const maxLoss = Math.max(1, worst.q.lostBRL);
  const ideal = amount * rate;

  return (
    <Screen title="Quanto chega" eyebrow="Passo 2 · Câmbio" eyebrowColor={F.cambio.color} subtitle="Veja quanto sobra de verdade em cada jeito de levar dinheiro">
      <Card>
        <Label>Você leva</Label>
        <Field value={amountText} onChangeText={setAmountText} prefix="R$" placeholder="1.000" big />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {QUICK.map((v) => (
            <Chip key={v} label={brl(v, 0)} active={amount === v} color={COLOR} onPress={() => setAmountText(num(v, 0))} />
          ))}
        </View>
        <Label style={{ marginTop: 6 }}>Para qual moeda</Label>
        <ChipRow>
          {CURRENCIES.map((c) => <Chip key={c} label={`${FLAG[c] ?? ''} ${c}`} active={c === cur} color={COLOR} onPress={() => setCur(c)} />)}
        </ChipRow>
        <Label style={{ marginTop: 6 }}>Para quem</Label>
        <Segment options={[{ value: true, label: 'Minha conta lá fora' }, { value: false, label: 'Outra pessoa' }]} value={own} onChange={setOwn} color={COLOR} />
      </Card>

      {amount > 0 ? (
        <Hero colors={[C.navy, C.navy2]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="award" size={15} color={C.navyLight} />
            <Txt w="mono" size={11} color={C.navyLight} style={{ letterSpacing: 1.2, flex: 1 }} numberOfLines={1}>MELHOR CAMINHO · {best.m.name.toUpperCase()}</Txt>
          </View>
          <Txt size={15} color={C.cream} style={{ marginTop: 4 }}>Chegam</Txt>
          <CountUp value={best.q.received} format={(v) => money(v, cur)} style={{ color: '#FFFFFF', fontSize: 42, fontFamily: FONT.heavy, letterSpacing: -1 }} />
          {saving > 0.5 ? (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: R.md, padding: 14, marginTop: 6, gap: 2 }}>
              <Txt w="display" size={17} color="#FFFFFF">Você economiza {brl(saving)}</Txt>
              <Txt size={14} color={C.navyLight}>comparado com {worst.m.name.toLowerCase()}. Em 6 envios, são {brl(saving * 6, 0)}.</Txt>
            </View>
          ) : null}
        </Hero>
      ) : null}
      {amount > 0 && saving > 0.5 ? (
        <ShareResult
          color={COLOR}
          data={{
            kicker: `Meu intercâmbio · ${country.name}`,
            line: 'Vou economizar no câmbio',
            big: brl(saving, 0),
            detail: `Levando ${brl(amount, 0)} por ${best.m.name.toLowerCase()} em vez de ${worst.m.name.toLowerCase()}.`,
            message: `Vou economizar ${brl(saving, 0)} no câmbio do meu intercâmbio levando ${brl(amount, 0)} por ${best.m.name.toLowerCase()} em vez de ${worst.m.name.toLowerCase()}. Calculei no app Ponte 🌉✈️`,
          }}
        />
      ) : null}

      <Section title="Quanto você perde" hint={`Sem taxa nenhuma, chegariam ${money(ideal, cur)}. Toque num caminho para ver o passo a passo.`} />
      {quotes.map(({ m, q }, i) => {
        const expanded = open === m.id;
        const isBest = m.id === best.m.id;
        return (
          <Tap key={m.id} onPress={() => setOpen(expanded ? null : m.id)} scaleTo={0.98} accessibilityRole="button" accessibilityState={{ expanded }}>
            <Animated.View layout={LinearTransition.duration(280)}>
              <Card style={isBest ? { borderColor: COLOR, borderWidth: 1.5 } : null}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <IconBox name={m.icon} color={isBest ? '#FFFFFF' : C.ink} soft={isBest ? COLOR : C.sunk} size={40} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt w="display" size={16}>{m.name}</Txt>
                    <Txt size={12} color={C.sub}>{num(q.lostPct, 1)}% em taxas · chegam {money(q.received, cur)}</Txt>
                  </View>
                  <Txt w="display" size={16} color={isBest ? COLOR : C.ink} style={{ fontVariant: ['tabular-nums'] }}>− {brl(q.lostBRL, 0)}</Txt>
                </View>
                <Bar value={Math.max(0.02, q.lostBRL / maxLoss)} color={isBest ? COLOR : q.lostPct > 6 ? C.ink : '#9EA1A7'} height={8} delay={i * 90} />
                {isBest || (i === 0 && m.id === 'cripto') || i === quotes.length - 1 ? (
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {isBest ? <Badge label="MELHOR CAMINHO" color={COLOR} soft={F.cambio.soft} /> : null}
                    {i === 0 && m.id === 'cripto' ? <Badge label="MAIS BARATO, COM RISCOS" color={C.navy} soft={C.navySoft} /> : null}
                    {i === quotes.length - 1 ? <Badge label="MAIS CARO" color={C.ink} soft={C.sunk} /> : null}
                  </View>
                ) : null}
                {expanded ? (
                  <Animated.View entering={FadeInDown.duration(300)} style={{ gap: 9, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 14, marginTop: 2 }}>
                    <Txt size={14} color={C.sub}>{m.short}</Txt>
                    <Row left="IOF (imposto)" right={brl(q.iof)} />
                    <Row left="Spread e taxas" right={brl(q.spread)} />
                    <Row left="Tarifas fixas" right={brl(q.fixed)} />
                    <Row left="Total perdido" right={brl(q.lostBRL)} strong />
                    <Label style={{ marginTop: 8 }}>Passo a passo</Label>
                    {m.steps.map((t, k) => (
                      <View key={k} style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                          <Txt w="bold" size={12} color={C.cream} style={{ lineHeight: 15 }}>{k + 1}</Txt>
                        </View>
                        <P style={{ flex: 1 }}>{t}</P>
                      </View>
                    ))}
                    <Label style={{ marginTop: 8 }}>Cuidados</Label>
                    {m.watch.map((t, k) => (
                      <View key={k} style={{ flexDirection: 'row', gap: 10 }}>
                        <Feather name="alert-triangle" size={15} color={C.navy} style={{ marginTop: 4 }} />
                        <P muted style={{ flex: 1 }}>{t}</P>
                      </View>
                    ))}
                    {m.id === 'cripto' ? (
                      <Tap onPress={() => router.push('/guia-cripto')}>
                        <Txt w="bold" color={C.navy}>Ler o guia de stablecoins →</Txt>
                      </Tap>
                    ) : null}
                  </Animated.View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Txt w="medium" size={13} color={C.sub}>Como fazer</Txt>
                    <Feather name="chevron-down" size={14} color={C.sub} />
                  </View>
                )}
              </Card>
            </Animated.View>
          </Tap>
        );
      })}

      <Section title="Entenda os termos" />
      <Explain title="O que é IOF?">
        É um imposto federal cobrado em operações de câmbio. A alíquota muda conforme o tipo: cartão, dinheiro em espécie, envio para a sua conta ou para outra pessoa.
      </Explain>
      <Explain title="O que é spread?">
        É a diferença entre a cotação real do mercado e a cotação que a empresa te dá. É uma taxa escondida dentro do preço da moeda.
      </Explain>
      <Explain title="O que é cotação comercial?">
        É o preço da moeda entre bancos, sem taxas. Serve de referência: quanto mais perto dela, melhor o negócio.
      </Explain>

      <P muted style={{ fontSize: 13 }}>
        Cotação comercial: {rateLabel(cur, 1 / rate)} {rates.live ? '(atualizada agora)' : '(sem internet: última cotação salva)'}. As taxas são médias de mercado, conferidas em {FEES_CHECKED}, e podem ser ajustadas em Ajustes. Confirme sempre a cotação final no app que você usar.
      </P>
    </Screen>
  );
}
