import React, { useState } from 'react';
import { View } from 'react-native';
import { CompletoLock } from '../components/CompletoLock';
import { Card, Chip, CountUp, Field, H, Hero, Label, P, Screen, Segment, Stepper, Txt } from '../components/ui';
import { getCountry } from '../data/countries';
import { highlightOf, METHODS, quote } from '../data/methods';
import { hasCompleto } from '../lib/completo';
import { brl, money, num, parseNum } from '../lib/format';
import { rateOf, useApp } from '../lib/store';
import { C, F, FONT } from '../lib/theme';

const COLOR = F.cambio.color;

const QUICK = [1000, 2000, 3000, 5000];

export default function Simulacao() {
  const { state, rates } = useApp();
  const country = getCountry(state.profile.country);
  const cur = country.currency;
  const rate = rateOf(rates, cur);
  const usd = rateOf(rates, 'USD');
  const [text, setText] = useState('2.000');
  const [months, setMonths] = useState(state.profile.months);
  const [own, setOwn] = useState(false);

  const monthly = parseNum(text);
  const rows = METHODS.map((m) => ({ m, q: quote(m.id, monthly, rate, usd, state.fees, own) })).sort((a, b) => b.q.received - a.q.received);

  if (!hasCompleto(state)) {
    return (
      <Screen header>
        <CompletoLock title="Simulação de envios mensais" text="Veja quanto chega e quanto se perde quando alguém manda dinheiro todo mês, em cada caminho." />
      </Screen>
    );
  }

  const best = highlightOf(rows);
  const worst = rows[rows.length - 1];
  const saving = (worst.q.lostBRL - best.q.lostBRL) * months;

  return (
    <Screen header>
      <Card>
        <Label>Valor enviado por mês</Label>
        <Field value={text} onChangeText={setText} prefix="R$" big />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {QUICK.map((v) => (
            <Chip key={v} label={brl(v, 0)} active={monthly === v} color={COLOR} onPress={() => setText(num(v, 0))} />
          ))}
        </View>

        <Label style={{ marginTop: 6 }}>Por quantos meses</Label>
        <Stepper value={months} onChange={setMonths} format={(v) => `${v} ${v === 1 ? 'mês' : 'meses'}`} color={COLOR} soft={F.cambio.soft} />

        <Label style={{ marginTop: 6 }}>Quem envia</Label>
        <Segment options={[{ value: false, label: 'Meus pais, para mim' }, { value: true, label: 'Eu, para mim' }]} value={own} onChange={setOwn} color={COLOR} />
      </Card>

      {monthly > 0 ? (
        <Hero colors={['#1F5A40', COLOR]}>
          <Txt w="mono" size={11} color="#CDEBD9" style={{ letterSpacing: 1.2 }}>EM {months} MESES, PELO MELHOR CAMINHO</Txt>
          <Txt size={15} color="#E6F4EC">{best.m.name} entrega no total</Txt>
          <CountUp value={best.q.received * months} format={(v) => money(v, cur)} style={{ color: '#FFFFFF', fontSize: 38, fontFamily: FONT.heavy, letterSpacing: -1 }} />
          <Txt size={14} color="#D7F3E3">
            {brl(monthly * months, 0)} enviados · {saving > 1 ? `${brl(saving, 0)} a menos de perda que ${worst.m.name.toLowerCase()}` : 'diferença pequena entre os caminhos'}
          </Txt>
        </Hero>
      ) : null}

      <Card style={{ gap: 12 }}>
        <H>Cada caminho, mês a mês</H>
        {rows.map(({ m, q }, i) => (
          <View key={m.id} style={{ gap: 2, paddingBottom: 12, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Txt w="bold" color={m.id === best.m.id ? COLOR : C.ink} style={{ flex: 1 }}>{m.name}{m.id === 'cripto' ? ' · com riscos' : ''}</Txt>
              <Txt w="display" size={16} style={{ fontVariant: ['tabular-nums'] }}>{money(q.received, cur)}/mês</Txt>
            </View>
            <Txt size={13} color={C.sub}>
              Perde {brl(q.lostBRL)} por mês ({num(q.lostPct, 1)}%) · {brl(q.lostBRL * months, 0)} em {months} meses
            </Txt>
          </View>
        ))}
      </Card>

      <Card tone="accent">
        <H>Por que “quem envia” muda o valor</H>
        <P>Enviar para a conta de outra pessoa no exterior paga IOF de {num(state.fees.iofTerceiros, 1)}%. Para uma conta no seu próprio nome, {num(state.fees.iofPropria, 1)}%.</P>
        <P muted style={{ fontSize: 14 }}>Antes de decidir como a família vai mandar o dinheiro, confirme as regras com o banco ou a empresa de câmbio.</P>
      </Card>

      <P muted style={{ fontSize: 12 }}>Estimativa com a cotação de hoje e as taxas da aba Câmbio. A cotação muda todo mês.</P>
    </Screen>
  );
}
