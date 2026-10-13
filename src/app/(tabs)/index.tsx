import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Logo, Wordmark } from '../../components/Logo';
import { Badge, Card, Hero, Icon, IconBox, IconName, Ring, Screen, Section, Tap } from '../../components/ui';
import { phasesFor } from '../../data/checklist';
import { COUNTRIES, getCountry } from '../../data/countries';
import { budgetOf } from '../../lib/budget';
import { hasCompleto } from '../../lib/completo';
import { brl, daysUntil, money, monthLabel, num } from '../../lib/format';
import { rateOf, useApp } from '../../lib/store';
import { C, F, shadow } from '../../lib/theme';

export default function Home() {
  const { state, rates } = useApp();
  const p = state.profile;
  const country = getCountry(p.country);
  const city = country.cities[p.city] ?? country.cities[0];
  const rate = rateOf(rates, country.currency);
  const days = daysUntil(p.tripMonth);

  const { totalBRL, coverage } = budgetOf(state, rates);

  const tasks = phasesFor(country).flatMap((ph) => ph.tasks);
  const doneCount = tasks.filter((t) => state.done[t.id]).length;

  const steps: Step[] = [
    {
      n: 1, icon: 'pie-chart', title: 'Calcule quanto vai gastar', f: F.orcamento,
      status: `≈ ${brl(totalBRL, 0)} no total · você tem ${num(Math.min(coverage, 9.99) * 100, 0)}%`,
      done: coverage >= 1, route: '/orcamento',
    },
    {
      n: 2, icon: 'repeat', title: 'Escolha como levar o dinheiro', f: F.cambio,
      status: 'Compare 5 caminhos e veja quanto chega', done: false, route: '/cambio',
    },
    {
      n: 3, icon: 'check-square', title: 'Siga o checklist', f: F.checklist,
      status: `${doneCount} de ${tasks.length} tarefas feitas`, done: doneCount === tasks.length, route: '/checklist',
    },
    {
      n: 4, icon: 'message-circle', title: 'Tire dúvidas com o assistente', f: F.assistente,
      status: 'Visto, câmbio, chegada e vida lá fora', done: false, route: '/assistente',
    },
  ];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark />
        <Tap accessibilityLabel="Ajustes" onPress={() => router.push('/ajustes')} hitSlop={12} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', ...shadow }}>
          <Icon name="settings" color={C.sub} />
        </Tap>
      </View>

      <Hero>
        <View style={{ position: 'absolute', right: -18, bottom: -10, opacity: 0.12 }}>
          <Logo size={200} color="#FFFFFF" accent="#FFFFFF" />
        </View>
        <Text style={{ color: '#9FB4CC', fontSize: 13, fontWeight: '700', letterSpacing: 0.6 }}>SEU INTERCÂMBIO</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: -0.6 }}>
          {country.flag} {city.name}
        </Text>
        <Text style={{ color: '#C8D6E5', fontSize: 15 }}>
          {country.name} · {p.months} meses · embarque em {monthLabel(p.tripMonth)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Stat big={days > 0 ? String(days) : 'Já!'} small={days > 0 ? 'dias para embarcar' : 'você está lá'} />
          <Stat big={`R$ ${num(1 / rate, 2)}`} small={`1 ${country.currency} ${rates.live ? 'hoje' : '(offline)'}`} />
        </View>
      </Hero>

      <Section title="Sua jornada em 4 passos" hint="Toque em um passo para começar" />
      <Card style={{ paddingVertical: 6, gap: 0 }}>
        {steps.map((st, i) => (
          <StepRow key={st.n} st={st} last={i === steps.length - 1} />
        ))}
      </Card>

      <Tap onPress={() => router.push('/completo')} accessibilityRole="button">
        <Card tone="night" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconBox name="star" color="#FFFFFF" soft={C.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', color: '#FFFFFF', fontSize: 16 }}>Ponte Completo</Text>
            <Text style={{ color: '#C8D6E5', fontSize: 13 }}>
              {hasCompleto(state) ? (state.premium ? 'Liberado. Obrigado por apoiar!' : 'Liberado grátis durante o teste') : 'Plano em PDF, alertas, prazos e mais'}
            </Text>
          </View>
          <Icon name="chevron-right" color="#9FB4CC" />
        </Card>
      </Tap>

      <Section title="Guias e ferramentas" />
      <Card style={{ paddingVertical: 4, gap: 0 }}>
        {GUIDES.map((g, i) => (
          <GuideRow key={g.route} g={g} last={i === GUIDES.length - 1} />
        ))}
      </Card>

      <Card tone="accent" style={{ flexDirection: 'row', gap: 12 }}>
        <Text style={{ fontSize: 22 }}>💡</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontWeight: '800', color: C.ink }}>Dica para {country.name}</Text>
          <Text style={{ color: C.ink, fontSize: 14, lineHeight: 20 }}>{country.tip}</Text>
        </View>
      </Card>

      <Section title="Explorar destinos" hint="Custo, visto e regras de cada país" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 8, paddingRight: 8 }}>
        {COUNTRIES.map((c) => {
          const r = rateOf(rates, c.currency);
          const mid = c.cities[0];
          const m = (Object.values(mid.costs).reduce((a, b) => a + b, 0) + c.seguro) / r;
          const mine = c.code === p.country;
          return (
            <Tap key={c.code} onPress={() => router.push(`/pais/${c.code}`)} scaleTo={0.95}>
              <View style={{ width: 140, padding: 14, borderRadius: 18, backgroundColor: mine ? C.primary : C.card, gap: 4, ...shadow }}>
                <Text style={{ fontSize: 30 }}>{c.flag}</Text>
                <Text style={{ fontWeight: '800', color: mine ? '#FFFFFF' : C.ink, fontSize: 15 }}>{c.name}</Text>
                <Text style={{ color: mine ? '#C8D6E5' : C.sub, fontSize: 12 }}>{money(1, c.currency, 0)} = {brl(1 / r)}</Text>
                <Text style={{ color: mine ? '#FFFFFF' : C.ink, fontSize: 13, fontWeight: '700', marginTop: 4 }}>≈ {brl(m, 0)}/mês</Text>
                <Text style={{ color: mine ? '#9FB4CC' : C.faint, fontSize: 11 }}>em {mid.name}</Text>
              </View>
            </Tap>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

type Guide = { route: '/guia-cartoes' | '/onde-buscar' | '/guia-cripto' | '/feedback' | '/simulacao' | '/alerta'; icon: IconName; title: string; hint: string; f: { color: string; soft: string }; completo?: boolean };

const GUIDES: Guide[] = [
  { route: '/guia-cartoes', icon: 'credit-card', title: 'Qual cartão levar', hint: 'Taxas de cada cartão lá fora e como pedir', f: F.cambio },
  { route: '/onde-buscar', icon: 'search', title: 'Onde buscar o seu intercâmbio', hint: 'Sites oficiais de visto, escolas e bolsas', f: F.checklist },
  { route: '/simulacao', icon: 'trending-up', title: 'Envios mensais', hint: 'Quanto chega quando alguém manda dinheiro todo mês', f: F.cambio, completo: true },
  { route: '/alerta', icon: 'bell', title: 'Alerta de cotação', hint: 'Aviso quando a moeda ficar mais barata', f: F.orcamento, completo: true },
  { route: '/guia-cripto', icon: 'shield', title: 'Stablecoins com segurança', hint: 'Como usar USDC para mandar dinheiro, e os riscos', f: F.cripto },
  { route: '/feedback', icon: 'heart', title: 'Dê sua opinião', hint: 'Leva 2 minutos e ajuda a melhorar a Ponte', f: F.assistente },
];

function GuideRow({ g, last }: { g: Guide; last: boolean }) {
  return (
    <Tap
      onPress={() => router.push(g.route)}
      accessibilityRole="button"
      scaleTo={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}
    >
      <IconBox name={g.icon} color={g.f.color} soft={g.f.soft} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16 }}>{g.title}</Text>
          {g.completo ? <Badge label="COMPLETO" color={C.accent} soft={C.accentSoft} /> : null}
        </View>
        <Text style={{ color: C.sub, fontSize: 13 }}>{g.hint}</Text>
      </View>
      <Icon name="chevron-right" color={C.faint} />
    </Tap>
  );
}

type Step = {
  n: number; icon: IconName; title: string; status: string; done: boolean; route: '/orcamento' | '/cambio' | '/checklist' | '/assistente';
  f: { color: string; soft: string };
};

function StepRow({ st, last }: { st: Step; last: boolean }) {
  return (
    <Tap onPress={() => router.push(st.route)} accessibilityRole="button" scaleTo={0.98} style={{ flexDirection: 'row', gap: 14, paddingVertical: 12 }}>
      <View style={{ alignItems: 'center' }}>
        <Ring value={st.done ? 1 : 0} size={44} stroke={3} color={st.f.color} track={st.f.soft}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: st.done ? st.f.color : st.f.soft, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={st.done ? 'check' : st.icon} size={17} color={st.done ? '#FFFFFF' : st.f.color} />
          </View>
        </Ring>
        {!last ? <View style={{ width: 2, flex: 1, backgroundColor: C.line, marginTop: 4, marginBottom: -12 }} /> : null}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', gap: 2 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: st.f.color, letterSpacing: 0.6 }}>PASSO {st.n}</Text>
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>{st.title}</Text>
        <Text style={{ fontSize: 13, color: C.sub }}>{st.status}</Text>
      </View>
      <View style={{ justifyContent: 'center' }}>
        <Feather name="chevron-right" size={20} color={C.faint} />
      </View>
    </Tap>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{big}</Text>
      <Text style={{ color: '#B5C6D9', fontSize: 12 }}>{small}</Text>
    </View>
  );
}
