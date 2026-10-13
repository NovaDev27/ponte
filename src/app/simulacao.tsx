import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { CompletoLock } from '../components/CompletoLock';
import { Card, Chip, Field, H, Hero, Label, P, Screen, Tap } from '../components/ui';
import { getCountry } from '../data/countries';
import { highlightOf, METHODS, quote } from '../data/methods';
import { hasCompleto } from '../lib/completo';
import { brl, money, num, parseNum } from '../lib/format';
import { rateOf, useApp } from '../lib/store';
import { C, F } from '../lib/theme';

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
            <Chip key={v} label={brl(v, 0)} active={monthly === v} color={F.cambio.color} onPress={() => setText(num(v, 0))} />
          ))}
        </View>

        <Label style={{ marginTop: 6 }}>Por quantos meses</Label>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Step icon="minus" onPress={() => setMonths((m) => Math.max(1, m - 1))} />
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, minWidth: 90, textAlign: 'center' }}>{months} {months === 1 ? 'mês' : 'meses'}</Text>
          <Step icon="plus" onPress={() => setMonths((m) => Math.min(36, m + 1))} />
        </View>

        <Label style={{ marginTop: 6 }}>Quem envia</Label>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label="Meus pais, para mim" active={!own} color={F.cambio.color} onPress={() => setOwn(false)} />
          <Chip label="Eu, para a minha conta" active={own} color={F.cambio.color} onPress={() => setOwn(true)} />
        </View>
      </Card>

      {monthly > 0 ? (
        <Hero colors={['#145C3D', '#1F8A5B']}>
          <Text style={{ color: '#C9F0DA', fontWeight: '800', fontSize: 13, letterSpacing: 0.6 }}>EM {months} MESES, PELO MELHOR CAMINHO</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 15 }}>{best.m.name} entrega no total</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 }}>{money(best.q.received * months, cur)}</Text>
          <Text style={{ color: '#D7F3E3', fontSize: 14 }}>
            {brl(monthly * months, 0)} enviados · {saving > 1 ? `${brl(saving, 0)} a menos de perda que ${worst.m.name.toLowerCase()}` : 'diferença pequena entre os caminhos'}
          </Text>
        </Hero>
      ) : null}

      <Card style={{ gap: 12 }}>
        <H>Cada caminho, mês a mês</H>
        {rows.map(({ m, q }, i) => (
          <View key={m.id} style={{ gap: 2, paddingBottom: 10, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', color: m.id === best.m.id ? F.cambio.color : C.ink }}>{m.name}{m.id === 'cripto' ? ' · com riscos' : ''}</Text>
              <Text style={{ fontWeight: '800', color: C.ink, fontVariant: ['tabular-nums'] }}>{money(q.received, cur)}/mês</Text>
            </View>
            <Text style={{ color: C.sub, fontSize: 13 }}>
              Perde {brl(q.lostBRL)} por mês ({num(q.lostPct, 1)}%) · {brl(q.lostBRL * months, 0)} em {months} meses
            </Text>
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

function Step({ icon, onPress }: { icon: 'plus' | 'minus'; onPress: () => void }) {
  return (
    <Tap onPress={onPress} accessibilityRole="button" accessibilityLabel={icon === 'plus' ? 'Mais um mês' : 'Menos um mês'} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={20} color={C.primary} />
    </Tap>
  );
}
