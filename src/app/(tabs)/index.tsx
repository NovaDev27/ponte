import Feather from '@expo/vector-icons/Feather';
import { router, useIsFocused } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ticket } from '../../components/Ticket';
import { Bar, Card, IconName, ListRow, Screen, Section, Tap, Txt } from '../../components/ui';
import { phasesFor } from '../../data/checklist';
import { getCountry } from '../../data/countries';
import { budgetOf } from '../../lib/budget';
import { daysUntil, rateLabel } from '../../lib/format';
import { rateOf, useApp } from '../../lib/store';
import { C, F, R } from '../../lib/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function Home() {
  const { state, rates } = useApp();
  const p = state.profile;
  const country = getCountry(p.country);
  const city = country.cities[p.city] ?? country.cities[0];
  const rate = rateOf(rates, country.currency);
  const days = daysUntil(p.tripMonth);

  const { coverage } = budgetOf(state, rates);
  const tasks = phasesFor(country).flatMap((ph) => ph.tasks);
  const doneCount = tasks.filter((t) => state.done[t.id]).length;
  // Só o que dá para medir de verdade: dinheiro juntado (40%) e tarefas do checklist (60%).
  const budgetPart = Math.min(1, coverage);
  const tasksPart = doneCount / Math.max(1, tasks.length);
  const journeyProgress = budgetPart * 0.4 + tasksPart * 0.6;

  return (
    <Screen>
      {/* Saudação limpa */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.3 }}>
            {greeting().toUpperCase()}
          </Txt>
          <Txt w="heavy" size={30} style={{ lineHeight: 34 }}>
            Rumo a {city.name}
          </Txt>
        </View>
        <Tap
          accessibilityLabel="Ajustes"
          onPress={() => router.push('/ajustes')}
          hitSlop={12}
          scaleTo={0.9}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="sliders" size={18} color={C.ink} />
        </Tap>
      </View>

      {/* Cartão de embarque — peça central */}
      <Ticket flag={country.flag} city={city.name} month={p.tripMonth} months={p.months} days={days} />

      {/* Progresso da jornada (uma linha só, em vez de 4 tiles pesados) */}
      <Card style={{ gap: 14, paddingVertical: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>
              SUA JORNADA
            </Txt>
            <Txt w="display" size={18}>
              {Math.round(Math.min(1, journeyProgress) * 100)}% pronto para embarcar
            </Txt>
          </View>
          <Txt size={13} color={C.sub}>
            {days > 0 ? `${days} dias` : 'Já!'}
          </Txt>
        </View>
        <Bar value={Math.min(1, journeyProgress)} color={C.navy} height={6} track={C.sunk} delay={200} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Orçamento', route: '/orcamento' as const, ok: budgetPart >= 1, pct: budgetPart },
            { label: 'Checklist', route: '/checklist' as const, ok: tasksPart >= 1, pct: tasksPart },
            { label: 'Câmbio', route: '/cambio' as const, ok: false, pct: null },
            { label: 'Orbi', route: '/assistente' as const, ok: false, pct: null },
          ].map((s) => (
            <Tap
              key={s.label}
              onPress={() => router.push(s.route)}
              scaleTo={0.96}
              accessibilityRole="button"
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: R.md,
                backgroundColor: s.ok ? C.navySoft : C.sunk,
              }}
            >
              <Txt w="medium" size={12} color={s.ok ? C.navy : C.sub} numberOfLines={1}>
                {s.ok ? '✓ ' : ''}{s.label}
              </Txt>
              {s.pct != null ? (
                <Txt w="mono" size={11} color={s.ok ? C.navy : C.faint} style={{ marginTop: 2 }}>
                  {Math.round(Math.min(1, s.pct) * 100)}%
                </Txt>
              ) : null}
            </Tap>
          ))}
        </View>
      </Card>

      {/* Cotação ao vivo — compacta */}
      <Tap
        onPress={() => router.push('/alerta')}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel="Cotação de hoje. Toque para criar um alerta."
      >
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pulse on={rates.live} />
              <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1 }}>
                {rates.live ? 'COTAÇÃO AO VIVO' : 'ÚLTIMA COTAÇÃO'}
              </Txt>
            </View>
            <Txt w="display" size={20}>
              {rateLabel(country.currency, 1 / rate)}
            </Txt>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: C.sunk,
              borderRadius: R.pill,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Feather name="bell" size={14} color={C.ink} />
            <Txt w="bold" size={13} style={{ lineHeight: 17 }}>
              Alerta
            </Txt>
          </View>
        </Card>
      </Tap>

      {/* Dica do país — postcard mais leve */}
      <Postcard flag={country.flag} name={country.name} tip={country.tip} />

      {/* Atalhos: só os 4 mais usados. O resto fica em Ferramentas. */}
      <Section title="Para o seu intercâmbio" />
      <Card style={{ paddingVertical: 2, gap: 0 }}>
        {GUIDES.map((g) => (
          <ListRow key={g.route} icon={g.icon} color={g.f.color} soft={g.f.soft} title={g.title} hint={g.hint} onPress={() => router.push(g.route)} />
        ))}
        <Tap
          onPress={() => router.push('/ferramentas')}
          scaleTo={0.97}
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 }}
        >
          <Txt w="bold" size={14}>Todas as ferramentas</Txt>
          <Feather name="arrow-right" size={16} color={C.ink} />
        </Tap>
      </Card>
    </Screen>
  );
}

function Pulse({ on }: { on: boolean }) {
  const reduce = useReducedMotion();
  const focused = useIsFocused();
  const v = useSharedValue(0);
  useEffect(() => {
    if (on && !reduce && focused) v.set(withRepeat(withTiming(1, { duration: 1800 }), -1));
    else v.set(0);
  }, [on, reduce, focused, v]);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - v.get()),
    transform: [{ scale: 1 + v.get() * 1.5 }],
  }));
  const color = on ? C.navy : C.faint;
  return (
    <View style={{ width: 8, height: 8 }}>
      {on ? (
        <Animated.View
          style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color }, ring]}
        />
      ) : null}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

function Postcard({ flag, name, tip }: { flag: string; name: string; tip: string }) {
  const r = useSharedValue(5);
  const stamp = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.get()}deg` }] }));
  return (
    <Tap
      haptic
      scaleTo={0.99}
      onPress={() => {
        r.set(withSequence(withTiming(-8, { duration: 100 }), withSpring(5, { damping: 6, stiffness: 200 })));
      }}
      accessibilityRole="text"
      style={{
        backgroundColor: C.card,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.line,
        borderStyle: 'dashed',
        padding: 18,
        paddingRight: 80,
        gap: 6,
      }}
    >
      <Txt w="mono" size={11} color={C.navy} style={{ letterSpacing: 1.2 }}>
        CARTÃO-POSTAL · {name.toUpperCase()}
      </Txt>
      <Txt size={15} color={C.ink2}>
        {tip}
      </Txt>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 16,
            right: 16,
            width: 52,
            height: 60,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: C.navy,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: C.navySoft,
          },
          stamp,
        ]}
      >
        <Txt size={24} style={{ lineHeight: 30 }}>
          {flag}
        </Txt>
      </Animated.View>
    </Tap>
  );
}

type Guide = { route: '/guia-cartoes' | '/onde-buscar' | '/feedback' | '/lugares'; icon: IconName; title: string; hint: string; f: { color: string; soft: string } };

const GUIDES: Guide[] = [
  { route: '/guia-cartoes', icon: 'credit-card', title: 'Qual cartão levar', hint: 'Seu cartão e quanto custa lá fora', f: F.cambio },
  { route: '/lugares', icon: 'map', title: 'Lugares', hint: 'O que conhecer quando chegar', f: F.orcamento },
  { route: '/onde-buscar', icon: 'search', title: 'Onde buscar', hint: 'Visto, escolas e bolsas oficiais', f: F.checklist },
  { route: '/feedback', icon: 'heart', title: 'Sua opinião', hint: 'Leva 2 minutos e ajuda muito', f: F.assistente },
];
