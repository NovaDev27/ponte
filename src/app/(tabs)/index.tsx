import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Orbi } from '../../components/Orbi';
import { Ticket } from '../../components/Ticket';
import { Badge, Bar, Card, IconBox, IconName, ListRow, Screen, Section, Tap, Txt } from '../../components/ui';
import { phasesFor } from '../../data/checklist';
import { COUNTRIES, getCountry } from '../../data/countries';
import { budgetOf } from '../../lib/budget';
import { COMPLETO_GRATIS, hasCompleto } from '../../lib/completo';
import { brl, daysUntil, num, rateLabel } from '../../lib/format';
import { rateOf, useApp } from '../../lib/store';
import { C, F, R } from '../../lib/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function Home() {
  const { state, rates } = useApp();
  const p = state.profile;
  const [allGuides, setAllGuides] = useState(false);
  const shown = allGuides ? GUIDES : GUIDES.slice(0, 3);
  const country = getCountry(p.country);
  const city = country.cities[p.city] ?? country.cities[0];
  const rate = rateOf(rates, country.currency);
  const days = daysUntil(p.tripMonth);

  const { totalBRL, coverage } = budgetOf(state, rates);
  const tasks = phasesFor(country).flatMap((ph) => ph.tasks);
  const doneCount = tasks.filter((t) => state.done[t.id]).length;

  const steps: Step[] = [
    {
      n: 1, icon: 'pie-chart', title: 'Orçamento', f: F.orcamento, route: '/orcamento',
      status: `≈ ${brl(totalBRL, 0)} no total`, progress: Math.min(1, coverage), done: coverage >= 1,
    },
    { n: 2, icon: 'repeat', title: 'Câmbio', f: F.cambio, route: '/cambio', status: 'Compare 5 jeitos de levar dinheiro' },
    {
      n: 3, icon: 'check-circle', title: 'Checklist', f: F.checklist, route: '/checklist',
      status: `${doneCount} de ${tasks.length} tarefas`, progress: doneCount / tasks.length, done: doneCount === tasks.length,
    },
    { n: 4, icon: 'message-circle', title: 'Orbi', f: F.assistente, route: '/assistente', status: 'Tire qualquer dúvida', orbi: true },
  ];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>{greeting().toUpperCase()} 👋</Txt>
          <Txt w="heavy" size={32} style={{ lineHeight: 36 }}>Rumo a {city.name}</Txt>
        </View>
        <Tap
          accessibilityLabel="Ajustes"
          onPress={() => router.push('/ajustes')}
          hitSlop={12}
          scaleTo={0.9}
          style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="sliders" size={19} color={C.ink} />
        </Tap>
      </View>

      <Ticket flag={country.flag} city={city.name} month={p.tripMonth} months={p.months} days={days} />

      <Tap onPress={() => router.push('/alerta')} scaleTo={0.98} accessibilityRole="button" accessibilityLabel="Cotação de hoje. Toque para criar um alerta.">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pulse on={rates.live} />
              <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1 }}>{rates.live ? 'COTAÇÃO AO VIVO' : 'ÚLTIMA COTAÇÃO SALVA'}</Txt>
            </View>
            <Txt w="display" size={22}>{rateLabel(country.currency, 1 / rate)}</Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.sunk, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Feather name="bell" size={14} color={C.ink} />
            <Txt w="bold" size={13} style={{ lineHeight: 17 }}>Alerta</Txt>
          </View>
        </Card>
      </Tap>

      <Section title="Sua jornada" hint="Quatro passos até o embarque" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
        {steps.map((st, i) => (
          <Animated.View key={st.n} entering={FadeInDown.duration(420).delay(120 + i * 70)} style={{ width: '48.4%' }}>
            <StepTile st={st} />
          </Animated.View>
        ))}
      </View>

      <Tap onPress={() => router.push('/completo')} accessibilityRole="button" scaleTo={0.98}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.night, borderRadius: R.lg, padding: 16 }}>
          <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="star" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt w="display" size={17} color={C.cream}>Ponte Completo</Txt>
            <Txt size={13} color={C.creamSub}>
              {hasCompleto(state) ? (state.premium ? 'Liberado. Obrigado por apoiar!' : 'Liberado grátis durante o teste') : 'Plano em PDF, alertas, prazos e mais'}
            </Txt>
          </View>
          <Feather name="arrow-up-right" size={20} color={C.creamSub} />
        </View>
      </Tap>

      <Postcard flag={country.flag} name={country.name} tip={country.tip} />

      <Section title="Guias e ferramentas" />
      <Card style={{ paddingVertical: 2, gap: 0 }}>
        {shown.map((g, i) => (
          <ListRow
            key={g.route}
            icon={g.icon}
            color={g.f.color}
            soft={g.f.soft}
            title={g.title}
            hint={g.hint}
            onPress={() => router.push(g.route)}
            last={i === shown.length - 1 && allGuides}
            right={g.completo && !COMPLETO_GRATIS ? <Badge label="COMPLETO" color={C.accent} soft={C.accentSoft} /> : null}
          />
        ))}
        {allGuides ? null : (
          <Tap onPress={() => setAllGuides(true)} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 }}>
            <Txt w="bold" size={15}>Ver todos ({GUIDES.length})</Txt>
            <Feather name="chevron-down" size={18} color={C.ink} />
          </Tap>
        )}
      </Card>

      <Section title="Explorar destinos" hint="Custo, visto e regras de cada país" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 20, paddingBottom: 4 }}>
        {COUNTRIES.map((c) => {
          const r = rateOf(rates, c.currency);
          const mid = c.cities[0];
          const m = (Object.values(mid.costs).reduce((a, b) => a + b, 0) + c.seguro) / r;
          const mine = c.code === p.country;
          return (
            <Tap key={c.code} onPress={() => router.push(`/pais/${c.code}`)} scaleTo={0.95} accessibilityRole="button" accessibilityLabel={`${c.name}, cerca de ${brl(m, 0)} por mês`}>
              <View style={{ width: 150, padding: 16, borderRadius: R.lg, backgroundColor: mine ? C.night : C.card, borderWidth: 1, borderColor: mine ? C.night : C.line, gap: 2 }}>
                <Txt size={34} style={{ lineHeight: 42 }}>{c.flag}</Txt>
                <Txt w="display" size={16} color={mine ? C.cream : C.ink} numberOfLines={1}>{c.name}</Txt>
                <Txt size={12} color={mine ? C.creamSub : C.sub}>{rateLabel(c.currency, 1 / r)}</Txt>
                <Txt w="bold" size={14} color={mine ? C.cream : C.ink} style={{ marginTop: 8 }}>≈ {brl(m, 0)}/mês</Txt>
                <Txt size={11} color={mine ? C.creamSub : C.faint}>em {mid.name}</Txt>
              </View>
            </Tap>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

// Pontinho verde que "respira" quando a cotação está ao vivo.
function Pulse({ on }: { on: boolean }) {
  const reduce = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    if (on && !reduce) v.set(withRepeat(withTiming(1, { duration: 1600 }), -1));
  }, [on, reduce, v]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - v.get()), transform: [{ scale: 1 + v.get() * 1.6 }] }));
  const color = on ? C.good : C.faint;
  return (
    <View style={{ width: 8, height: 8 }}>
      {on ? <Animated.View style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color }, ring]} /> : null}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

// Dica do país em forma de cartão-postal, com um selo que balança quando toca.
function Postcard({ flag, name, tip }: { flag: string; name: string; tip: string }) {
  const r = useSharedValue(6);
  const stamp = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.get()}deg` }] }));
  return (
    <Tap
      haptic
      scaleTo={0.99}
      onPress={() => {
        r.set(withSequence(withTiming(-10, { duration: 110 }), withSpring(6, { damping: 5, stiffness: 180 })));
      }}
      accessibilityRole="text"
      style={{ backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.line, borderStyle: 'dashed', padding: 18, paddingRight: 84, gap: 6 }}
    >
      <Txt w="mono" size={11} color={C.accent} style={{ letterSpacing: 1.2 }}>CARTÃO-POSTAL · {name.toUpperCase()}</Txt>
      <Txt size={15}>{tip}</Txt>
      <Animated.View style={[{ position: 'absolute', top: 16, right: 16, width: 54, height: 64, borderRadius: 6, borderWidth: 2, borderColor: C.accent, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: C.accentSoft }, stamp]}>
        <Txt size={26} style={{ lineHeight: 32 }}>{flag}</Txt>
      </Animated.View>
    </Tap>
  );
}

type Guide = { route: '/guia-cartoes' | '/onde-buscar' | '/guia-cripto' | '/feedback' | '/simulacao' | '/alerta'; icon: IconName; title: string; hint: string; f: { color: string; soft: string }; completo?: boolean };

const GUIDES: Guide[] = [
  // Os 3 primeiros aparecem direto; o resto fica em "Ver todos".
  { route: '/guia-cartoes', icon: 'credit-card', title: 'Qual cartão levar', hint: 'Taxas de cada cartão lá fora e como pedir', f: F.cambio },
  { route: '/alerta', icon: 'bell', title: 'Alerta de cotação', hint: 'Aviso quando a moeda ficar mais barata', f: F.orcamento, completo: true },
  { route: '/feedback', icon: 'heart', title: 'Dê sua opinião', hint: 'Leva 2 minutos e ajuda a melhorar a Ponte', f: { color: C.accent, soft: C.accentSoft } },
  { route: '/simulacao', icon: 'trending-up', title: 'Envios mensais', hint: 'Quanto chega quando alguém manda dinheiro todo mês', f: F.cambio, completo: true },
  { route: '/onde-buscar', icon: 'search', title: 'Onde buscar o seu intercâmbio', hint: 'Sites oficiais de visto, escolas e bolsas', f: F.checklist },
  { route: '/guia-cripto', icon: 'shield', title: 'Stablecoins com segurança', hint: 'Como usar USDC para mandar dinheiro, e os riscos', f: F.cripto },
];

type Step = {
  n: number; icon: IconName; title: string; status: string; route: '/orcamento' | '/cambio' | '/checklist' | '/assistente';
  f: { color: string; soft: string }; progress?: number; done?: boolean; orbi?: boolean;
};

function StepTile({ st }: { st: Step }) {
  return (
    <Tap onPress={() => router.push(st.route)} accessibilityRole="button" accessibilityLabel={`Passo ${st.n}: ${st.title}. ${st.status}`} scaleTo={0.95}>
      <View style={{ backgroundColor: st.f.soft, borderRadius: R.lg, padding: 16, minHeight: 168, justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {st.orbi ? (
            <Orbi size={44} interactive={false} />
          ) : (
            <IconBox name={st.icon} color="#FFFFFF" soft={st.f.color} size={44} />
          )}
          {st.done ? (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.good, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="check" size={14} color="#FFFFFF" />
            </View>
          ) : (
            <Txt w="mono" size={11} color={st.f.color} style={{ letterSpacing: 1 }}>0{st.n}</Txt>
          )}
        </View>
        <View style={{ gap: 2 }}>
          <Txt w="display" size={18}>{st.title}</Txt>
          <Txt size={13} color={C.sub} numberOfLines={2}>{st.status}</Txt>
        </View>
        {st.progress != null ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Bar value={st.progress} color={st.f.color} height={5} track="rgba(23,27,33,0.08)" delay={300} />
            </View>
            <Txt w="mono" size={11} color={C.sub}>{num(st.progress * 100, 0)}%</Txt>
          </View>
        ) : null}
      </View>
    </Tap>
  );
}
