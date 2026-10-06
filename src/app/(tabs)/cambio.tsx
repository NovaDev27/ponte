import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Badge, Card, Chip, ChipRow, Explain, Field, Hero, IconBox, Label, P, Row, Screen, Section } from '../../components/ui';
import { CURRENCIES, getCountry } from '../../data/countries';
import { FEES_CHECKED, METHODS, quote } from '../../data/methods';
import { brl, money, num, parseNum } from '../../lib/format';
import { rateOf, useApp } from '../../lib/store';
import { C, F } from '../../lib/theme';

const FLAG: Record<string, string> = { EUR: '🇪🇺', USD: '🇺🇸', CAD: '🇨🇦', AUD: '🇦🇺', GBP: '🇬🇧', NZD: '🇳🇿', JPY: '🇯🇵', ZAR: '🇿🇦' };
const QUICK = [500, 1000, 3000, 10000];

export default function Cambio() {
  const { state, rates } = useApp();
  const [amountText, setAmountText] = useState('1.000');
  const [cur, setCur] = useState(getCountry(state.profile.country).currency);
  const [own, setOwn] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  const amount = parseNum(amountText);
  const rate = rateOf(rates, cur);
  const usd = rateOf(rates, 'USD');

  const quotes = useMemo(
    () => METHODS.map((m) => ({ m, q: quote(m.id, amount, rate, usd, state.fees, own) })).sort((a, b) => b.q.received - a.q.received),
    [amount, rate, usd, state.fees, own],
  );
  const best = quotes[0];
  const worst = quotes[quotes.length - 1];
  const saving = worst.q.lostBRL - best.q.lostBRL;
  const maxLoss = Math.max(1, worst.q.lostBRL);
  const ideal = amount * rate;

  return (
    <Screen title="Quanto chega" eyebrow="Passo 2 · Câmbio" eyebrowColor={F.cambio.color} subtitle="Veja quanto sobra de verdade em cada jeito de levar dinheiro">
      <Card>
        <Label>Quanto você quer levar</Label>
        <Field value={amountText} onChangeText={setAmountText} prefix="R$" placeholder="1.000" big />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {QUICK.map((v) => (
            <Chip key={v} label={brl(v, 0)} active={amount === v} color={F.cambio.color} onPress={() => setAmountText(num(v, 0))} />
          ))}
        </View>
        <Label style={{ marginTop: 6 }}>Para qual moeda</Label>
        <ChipRow>
          {CURRENCIES.map((c) => <Chip key={c} label={`${FLAG[c] ?? ''} ${c}`} active={c === cur} color={F.cambio.color} onPress={() => setCur(c)} />)}
        </ChipRow>
        <Label style={{ marginTop: 6 }}>Para quem</Label>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Minha conta lá fora" active={own} color={F.cambio.color} onPress={() => setOwn(true)} />
          <Chip label="Outra pessoa" active={!own} color={F.cambio.color} onPress={() => setOwn(false)} />
        </View>
      </Card>

      {amount > 0 ? (
        <Hero colors={['#145C3D', '#1F8A5B']}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="award" size={18} color="#C9F0DA" />
            <Text style={{ color: '#C9F0DA', fontWeight: '800', fontSize: 13, letterSpacing: 0.6 }}>MELHOR CAMINHO: {best.m.name.toUpperCase()}</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 15 }}>Chegam</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 40, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] }}>{money(best.q.received, cur)}</Text>
          {saving > 0.5 ? (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: 12, marginTop: 4 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>Você economiza {brl(saving)}</Text>
              <Text style={{ color: '#D7F3E3', fontSize: 14 }}>comparado com {worst.m.name.toLowerCase()}. Em 6 envios, são {brl(saving * 6, 0)}.</Text>
            </View>
          ) : null}
        </Hero>
      ) : null}

      <Section title="Quanto você perde em cada caminho" hint={`Sem nenhuma taxa, chegariam ${money(ideal, cur)}. Barra menor = melhor.`} />
      <Card style={{ gap: 14 }}>
        {quotes.map(({ m, q }, i) => (
          <View key={m.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name={m.icon} size={16} color={i === 0 ? F.cambio.color : C.sub} />
              <Text style={{ flex: 1, fontWeight: '700', color: C.ink }}>{m.name}</Text>
              <Text style={{ fontWeight: '800', color: i === 0 ? F.cambio.color : q.lostPct > 6 ? C.bad : C.ink, fontVariant: ['tabular-nums'] }}>− {brl(q.lostBRL)}</Text>
            </View>
            <View style={{ height: 12, borderRadius: 6, backgroundColor: C.bg, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(2, (q.lostBRL / maxLoss) * 100)}%`, height: '100%', borderRadius: 6, backgroundColor: i === 0 ? F.cambio.color : q.lostPct > 6 ? '#E07A65' : '#E3B26A' }} />
            </View>
            <Text style={{ fontSize: 12, color: C.sub }}>{num(q.lostPct, 1)}% em taxas · chegam {money(q.received, cur)}</Text>
          </View>
        ))}
      </Card>

      <Section title="Como fazer cada um" hint="Toque para ver o passo a passo e os cuidados" />
      {quotes.map(({ m, q }, i) => {
        const expanded = open === m.id;
        return (
          <Pressable key={m.id} onPress={() => setOpen(expanded ? null : m.id)} accessibilityRole="button" accessibilityState={{ expanded }}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconBox name={m.icon} color={i === 0 ? F.cambio.color : C.primary} soft={i === 0 ? F.cambio.soft : C.primarySoft} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>{m.name}</Text>
                    {i === 0 ? <Badge label="MAIS BARATO" color={F.cambio.color} soft={F.cambio.soft} /> : null}
                    {i === quotes.length - 1 ? <Badge label="MAIS CARO" color={C.bad} soft="#FBE6E1" /> : null}
                  </View>
                  <Text style={{ color: C.sub, fontSize: 13 }}>{m.short}</Text>
                </View>
                <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.faint} />
              </View>
              {expanded ? (
                <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12 }}>
                  <Row left="IOF (imposto)" right={brl(q.iof)} />
                  <Row left="Spread e taxas" right={brl(q.spread)} />
                  <Row left="Tarifas fixas" right={brl(q.fixed)} />
                  <Row left="Total perdido" right={brl(q.lostBRL)} strong />
                  <Label style={{ marginTop: 6 }}>Passo a passo</Label>
                  {m.steps.map((t, k) => (
                    <View key={k} style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: C.primary, fontWeight: '800', fontSize: 12 }}>{k + 1}</Text>
                      </View>
                      <P style={{ flex: 1 }}>{t}</P>
                    </View>
                  ))}
                  <Label style={{ marginTop: 6 }}>Cuidados</Label>
                  {m.watch.map((t, k) => (
                    <View key={k} style={{ flexDirection: 'row', gap: 8 }}>
                      <Feather name="alert-triangle" size={15} color={C.warn} style={{ marginTop: 3 }} />
                      <P muted style={{ flex: 1 }}>{t}</P>
                    </View>
                  ))}
                  {m.id === 'cripto' ? (
                    <Pressable onPress={() => router.push('/guia-cripto')}>
                      <Text style={{ color: C.primary, fontWeight: '800' }}>Ler o guia completo de stablecoins →</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </Card>
          </Pressable>
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
        Cotação comercial: 1 {cur} = {brl(1 / rate)} {rates.live ? '(atualizada agora)' : '(sem internet: última cotação salva)'}. As taxas são médias de mercado, conferidas em {FEES_CHECKED}, e podem ser ajustadas em Ajustes. Confirme sempre a cotação final no app que você usar.
      </P>
    </Screen>
  );
}
