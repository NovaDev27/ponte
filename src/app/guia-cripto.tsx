import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { CryptoIcon, type CryptoName } from '../components/CryptoIcon';
import { Badge, Card, Explain, Hero, P, Section, Screen, Tap, Txt } from '../components/ui';
import { getCountry } from '../data/countries';
import { useApp } from '../lib/store';
import { C, R } from '../lib/theme';

const COINS = [
  {
    sym: 'USDC', name: 'USD Coin', tag: 'MAIS USADA PARA ENVIO',
    text: 'Emitida pela Circle, empresa americana. Cada USDC vale cerca de US$ 1 e as reservas passam por relatórios mensais de auditoria. É aceita na maioria das exchanges reguladas.',
  },
  {
    sym: 'USDT', name: 'Tether', tag: 'A MAIS NEGOCIADA',
    text: 'A stablecoin com mais volume no mundo e muito aceita. A transparência das reservas já foi mais questionada que a da USDC. Funciona igual: cerca de US$ 1 por unidade.',
  },
];

const AVOID = [
  ['Bitcoin, Ether e outras', 'O preço pode cair 5% ou mais no tempo em que o dinheiro está "no caminho". Não servem para transferir.'],
  ['Moedas novas ou "com rendimento"', 'Promessa de render enquanto você viaja é sinal de golpe ou de risco alto.'],
  ['Stablecoin pouco conhecida', 'Se a exchange do destino não aceita, você fica preso nela e paga para converter de novo.'],
];

const NETWORKS: { name: CryptoName; fee: string; level: 1 | 2 | 3; note: string }[] = [
  { name: 'Polygon', fee: 'centavos', level: 1, note: 'Barata e aceita em muitas exchanges.' },
  { name: 'Solana', fee: 'centavos', level: 1, note: 'Rápida e barata.' },
  { name: 'Base', fee: 'centavos', level: 1, note: 'Barata; aceita em menos lugares.' },
  { name: 'Tron', fee: 'até alguns dólares', level: 2, note: 'Comum para USDT.' },
  { name: 'Ethereum', fee: 'alguns dólares', level: 3, note: 'A original, mas a taxa pesa em valores pequenos.' },
];

const STEPS = [
  ['Compre a stablecoin', 'Numa exchange regulada no Brasil, pagando com Pix.'],
  ['Escolha a rede', 'Confira em quais redes a exchange do destino aceita depósito. Use exatamente a mesma nas duas pontas.'],
  ['Envie um teste', 'Mande primeiro um valor pequeno. Só depois que chegar, envie o resto.'],
  ['Venda no destino', 'Na exchange do país de destino, troque pela moeda local.'],
  ['Saque', 'Transfira para a sua conta bancária de lá.'],
];

const RISKS = [
  ['Rede ou endereço errado', 'Transferências em cripto não têm estorno. Um erro de digitação pode significar perder tudo.'],
  ['Golpes', 'Ninguém legítimo pede sua senha, frase de recuperação ou código 2FA. Desconfie de "suporte" que te procura.'],
  ['Risco da exchange', 'Se a empresa tiver problemas, seu saldo pode ficar preso. Não deixe dinheiro parado lá.'],
  ['Risco do emissor', 'A stablecoin depende das reservas de quem a emite. É raro, mas ela pode perder a paridade com o dólar.'],
  ['Regras e impostos', 'As regras de cripto e de IOF mudam. Guarde comprovantes e confira a legislação atual.'],
];

export default function GuiaCripto() {
  const { state } = useApp();
  const cur = getCountry(state.profile.country).currency;
  const [coin, setCoin] = useState(0);

  return (
    <Screen header>
      <Hero colors={[C.navy, C.navy2]} style={{ gap: 14 }}>
        <Txt w="mono" size={11} color={C.navyLight} style={{ letterSpacing: 1.2 }}>COMO O DINHEIRO VIAJA</Txt>
        <Flow to={cur} />
        <Txt size={14} color={C.cream}>
          A stablecoin é só o “veículo”: você compra com reais, envia e vende lá fora. Não é investimento, e a Ponte não recomenda guardar cripto.
        </Txt>
      </Hero>

      <Section title="Qual cripto usar para enviar?" hint="Use uma stablecoin: uma moeda digital que segue o dólar" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {COINS.map((c, i) => (
          <View key={c.sym} style={{ flex: 1 }}>
            <Coin sym={c.sym as CryptoName} name={c.name} on={coin === i} onPress={() => setCoin(i)} />
          </View>
        ))}
      </View>
      <Card>
        <Badge label={COINS[coin].tag} color={C.navy} soft={C.navySoft} />
        <Txt w="display" size={18}>{COINS[coin].sym} · {COINS[coin].name}</Txt>
        <P muted>{COINS[coin].text}</P>
        <View style={{ height: 1, backgroundColor: C.line }} />
        <Txt size={14}>
          <Txt w="bold" size={14}>Regra de ouro:</Txt> use a stablecoin que a exchange do destino aceita e que tenha troca direta para {cur}.
          {cur === 'EUR' ? ' Na Europa também existe a EURC (euro digital da Circle), mas ela tem menos opções de troca.' : ''}
        </Txt>
      </Card>

      <Card tone="night" style={{ gap: 12 }}>
        <Txt w="display" size={17} color={C.cream}>Evite para enviar</Txt>
        {AVOID.map(([t, d]) => (
          <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
              <Feather name="x" size={14} color={C.cream} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="bold" color={C.cream}>{t}</Txt>
              <Txt size={14} color={C.creamSub}>{d}</Txt>
            </View>
          </View>
        ))}
      </Card>

      <Section title="Qual rede escolher?" hint="A rede é o caminho por onde a moeda passa. A taxa muda bastante." />
      <Card style={{ gap: 0, paddingVertical: 6 }}>
        {NETWORKS.map((n, i) => (
          <View key={n.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center' }}>
              <CryptoIcon name={n.name} size={22} color={C.navy} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="bold">{n.name}</Txt>
              <Txt size={13} color={C.sub}>{n.note}</Txt>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 5 }}>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {[1, 2, 3].map((k) => <View key={k} style={{ width: 5, height: 14, borderRadius: 3, backgroundColor: k <= n.level ? C.navy : C.sunk }} />)}
              </View>
              <Txt w="mono" size={11} color={C.sub}>{n.fee.toUpperCase()}</Txt>
            </View>
          </View>
        ))}
      </Card>
      <Txt size={13} color={C.sub}>Barrinhas = custo típico da taxa da rede. Os valores mudam com o movimento de cada rede: confira na exchange antes de enviar.</Txt>

      <Section title="Passo a passo" />
      <View>
        {STEPS.map(([t, d], i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center', width: 30 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: i === 2 ? C.navy : C.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Txt w="bold" size={13} color={C.cream} style={{ lineHeight: 16 }}>{i + 1}</Txt>
              </View>
              {i < STEPS.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: C.line, marginVertical: 4 }} /> : null}
            </View>
            <View style={{ flex: 1, gap: 2, paddingBottom: 18 }}>
              <Txt w="display" size={17}>{t}</Txt>
              <P muted>{d}</P>
            </View>
          </View>
        ))}
      </View>

      <Card tone="sunk">
        <Txt w="display" size={17}>Quando costuma compensar</Txt>
        <P>Para valores médios e altos, quando o destino tem exchanges com boa liquidez. Para valores pequenos, a taxa da rede e as de saque pesam mais, e a conta global pode sair mais barata.</P>
        <P muted>Compare sempre na aba Câmbio.</P>
      </Card>

      <Section title="Riscos" />
      {RISKS.map(([t, d]) => (
        <Explain key={t} title={t}>{d}</Explain>
      ))}

      <Card>
        <Txt w="display" size={17}>Checklist de segurança</Txt>
        {[
          'Autenticação em dois fatores por app, não por SMS',
          'Copiar e colar o endereço e conferir o começo e o fim',
          'Mandar um teste pequeno antes',
          'Nunca compartilhar a frase de recuperação',
          'Usar só exchanges reguladas',
        ].map((t) => (
          <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="check" size={13} color="#FFFFFF" />
            </View>
            <P style={{ flex: 1 }}>{t}</P>
          </View>
        ))}
      </Card>

      <P muted style={{ fontSize: 12 }}>Conteúdo educativo sobre transferência de dinheiro. Não é recomendação de investimento nem de compra de criptomoedas. A Ponte não movimenta dinheiro.</P>
    </Screen>
  );
}

// R$ → USDC → moeda do destino, com uma bolinha que percorre o caminho sem parar.
function Flow({ to }: { to: string }) {
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const t = useSharedValue(0.5);
  useEffect(() => {
    if (reduce) return;
    t.set(0);
    t.set(withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1));
  }, [reduce, t]);
  const dot = useAnimatedStyle(() => ({ opacity: t.get() < 0.04 || t.get() > 0.96 ? 0 : 1, transform: [{ translateX: t.get() * Math.max(0, w - 12) }] }));
  const node = (label: string, sub: string) => (
    <View style={{ alignItems: 'center', gap: 4, width: 74 }}>
      <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' }}>
        <Txt w="heavy" size={label.length > 3 ? 13 : 16} color={C.navy}>{label}</Txt>
      </View>
      <Txt size={11} color={C.navyLight}>{sub}</Txt>
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <View style={{ position: 'absolute', left: 37, right: 37, top: 21 }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <View style={{ height: 2, marginTop: 5, backgroundColor: 'rgba(244,242,238,0.25)' }} />
        <Animated.View style={[{ position: 'absolute', top: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: C.cream }, dot]} />
      </View>
      {node('R$', 'Pix no Brasil')}
      {node('USDC', 'stablecoin')}
      {node(to, 'conta lá fora')}
    </View>
  );
}

function Coin({ sym, name, on, onPress }: { sym: CryptoName; name: string; on: boolean; onPress: () => void }) {
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.95}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{ alignItems: 'center', gap: 8, padding: 16, borderRadius: R.lg, backgroundColor: on ? C.navy : C.card, borderWidth: 1, borderColor: on ? C.navy : C.line }}
    >
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: on ? C.navy2 : C.navySoft, alignItems: 'center', justifyContent: 'center' }}>
        <CryptoIcon name={sym} size={34} color={on ? C.cream : C.navy} />
      </View>
      <Txt w="display" size={17} color={on ? C.cream : C.ink}>{sym}</Txt>
      <Txt size={12} color={on ? C.navyLight : C.sub}>{name}</Txt>
    </Tap>
  );
}
