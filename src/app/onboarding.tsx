import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeInDown, FadeInUp, FadeOut, LinearTransition, useAnimatedProps, useAnimatedStyle, useReducedMotion,
  useSharedValue, withDelay, withRepeat, withSequence, withTiming, ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ticket } from '../components/Ticket';
import { Bar, Btn, Card, Chip, ChipRow, Field, Label, P, Screen, Tap, Txt } from '../components/ui';
import { COUNTRIES, getCountry, type Country } from '../data/countries';
import { brl, daysUntil, nextMonths } from '../lib/format';
import { EASE_OUT, SOFT_SPRING, success } from '../lib/motion';
import { rateOf, useApp, type Rates } from '../lib/store';
import { C, R } from '../lib/theme';

const APath = Animated.createAnimatedComponent(Path);

const DURATIONS = [3, 6, 8, 12, 24];

const REGIONS = [
  { id: 'todos', label: 'Todos', codes: null },
  { id: 'europa', label: 'Europa', codes: ['IE', 'PT', 'GB', 'MT', 'ES', 'DE', 'FR'] },
  { id: 'americas', label: 'Américas', codes: ['CA', 'US'] },
  { id: 'oceania', label: 'Oceania', codes: ['AU', 'NZ'] },
  { id: 'outros', label: 'Ásia e África', codes: ['JP', 'ZA'] },
] as const;

type RegionId = (typeof REGIONS)[number]['id'];

// Sem acento e minúsculo, para "canada" achar "Canadá".
const plain = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Custo do mês na cidade mais barata do país (estilo moderado), em reais.
function fromBRL(c: Country, rates: Rates) {
  const rate = rateOf(rates, c.currency);
  const cheapest = Math.min(...c.cities.map((city) => Object.values(city.costs).reduce((a, b) => a + b, 0)));
  return (cheapest + c.seguro) / rate;
}

// Rota desenhada à mão: a linha tracejada vai se desenhando do Brasil até o destino,
// o aviãozinho acompanha e as bandeiras pipocam pelo caminho.
function FlightArc() {
  const { width } = useWindowDimensions();
  const reduce = useReducedMotion();
  const w = Math.min(width, 520) - 48;
  const h = 190;
  const P0 = { x: 22, y: h - 30 };
  const P1 = { x: w / 2, y: -20 };
  const P2 = { x: w - 26, y: h - 70 };
  const at = (u: number) => ({
    x: (1 - u) ** 2 * P0.x + 2 * (1 - u) * u * P1.x + u ** 2 * P2.x,
    y: (1 - u) ** 2 * P0.y + 2 * (1 - u) * u * P1.y + u ** 2 * P2.y,
  });
  let len = 0;
  for (let i = 1, prev = at(0); i <= 30; i++) {
    const p = at(i / 30);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  const d = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
  const t = useSharedValue(reduce ? 1 : 0);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    t.set(withDelay(350, withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.cubic) })));
    bob.set(withDelay(2300, withRepeat(withSequence(withTiming(-5, { duration: 1100, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) })), -1)));
  }, [reduce, t, bob]);

  const draw = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - t.get()) }));
  const plane = useAnimatedStyle(() => {
    const u = Math.min(0.999, t.get());
    const x = (1 - u) ** 2 * P0.x + 2 * (1 - u) * u * P1.x + u ** 2 * P2.x;
    const y = (1 - u) ** 2 * P0.y + 2 * (1 - u) * u * P1.y + u ** 2 * P2.y;
    const dx = 2 * (1 - u) * (P1.x - P0.x) + 2 * u * (P2.x - P1.x);
    const dy = 2 * (1 - u) * (P1.y - P0.y) + 2 * u * (P2.y - P1.y);
    return {
      opacity: t.get() > 0.97 ? Math.max(0, (1 - t.get()) / 0.03) : 1,
      transform: [{ translateX: x - 13 }, { translateY: y - 13 }, { rotate: `${Math.atan2(dy, dx)}rad` }],
    };
  });
  const pin = useAnimatedStyle(() => ({ transform: [{ translateY: bob.get() }] }));

  const flags: [number, string][] = [[0.3, '🇵🇹'], [0.52, '🇮🇪'], [0.74, '🇨🇦']];
  return (
    <View style={{ width: w, height: h, alignSelf: 'center' }}>
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Path d={d} stroke={C.line} strokeWidth={2} strokeDasharray="3 7" strokeLinecap="round" fill="none" />
        <APath d={d} stroke={C.ink} strokeWidth={2} strokeDasharray={`${len} ${len}`} strokeLinecap="round" fill="none" animatedProps={draw} />
        <Circle cx={P0.x} cy={P0.y} r={6} fill={C.ink} />
        <Circle cx={P0.x} cy={P0.y} r={12} fill={C.ink} opacity={0.08} />
      </Svg>
      <Txt w="mono" size={11} color={C.sub} style={{ position: 'absolute', left: 4, top: P0.y + 14, letterSpacing: 1 }}>BRASIL</Txt>
      {flags.map(([u, f], i) => {
        const p = at(u);
        return (
          <Animated.View key={f} entering={reduce ? undefined : ZoomIn.delay(600 + i * 420).springify().damping(10)} style={{ position: 'absolute', left: p.x - 19, top: p.y - 46, width: 38, height: 38, borderRadius: 19, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 6px 16px rgba(23,27,33,0.08)' }}>
            <Txt size={20} style={{ lineHeight: 26 }}>{f}</Txt>
          </Animated.View>
        );
      })}
      <Animated.View entering={reduce ? undefined : ZoomIn.delay(2050).springify().damping(9)} style={{ position: 'absolute', left: P2.x - 22, top: P2.y - 52 }}>
        <Animated.View style={[{ alignItems: 'center' }, pin]}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="map-pin" size={20} color="#FFFFFF" />
          </View>
          <View style={{ width: 2, height: 10, backgroundColor: C.accent }} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', width: 26, height: 26 }, plane]}>
        <Svg width={26} height={26} viewBox="-11 -9 22 18">
          <Path d="M-10 0 L6 -1.3 Q10 -1.1 10 0 Q10 1.1 6 1.3 Z" fill={C.ink} />
          <Path d="M-1 -0.9 L-5 -8 L-2 -8 L4 -0.9 Z" fill={C.ink} />
          <Path d="M-1 0.9 L-5 8 L-2 8 L4 0.9 Z" fill={C.ink} />
          <Path d="M-9 -0.3 L-11 -3.6 L-9.4 -3.6 L-6.5 -0.4 Z" fill={C.ink} />
          <Path d="M-9 0.3 L-11 3.6 L-9.4 3.6 L-6.5 0.4 Z" fill={C.ink} />
        </Svg>
      </Animated.View>
    </View>
  );
}

// Duas pílulas no topo: mostram em qual passo a pessoa está.
function Progress({ step }: { step: 1 | 2 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <View style={{ flex: 1 }}><Bar value={1} color={C.accent} height={5} /></View>
      <View style={{ flex: 1 }}><Bar value={step === 2 ? 1 : 0} color={C.accent} height={5} /></View>
    </View>
  );
}

export default function Onboarding() {
  const { state, rates, setProfile, update } = useApp();
  const [step, setStep] = useState(state.onboarded ? 1 : 0);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<RegionId>('todos');
  const p = state.profile;
  const country = getCountry(p.country);

  if (step === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 26 }}>
          <Animated.View entering={FadeIn.duration(400)}>
            <FlightArc />
          </Animated.View>
          <View style={{ gap: 12 }}>
            <Animated.View entering={FadeInDown.duration(560).delay(250).easing(EASE_OUT)}>
              <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.4 }}>PONTE · PLANEJADOR DE INTERCÂMBIO</Txt>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(560).delay(350).easing(EASE_OUT)}>
              <Txt w="heavy" size={44} style={{ lineHeight: 46 }}>
                Seu intercâmbio,{'\n'}<Txt w="heavy" size={44} color={C.accent} style={{ lineHeight: 46 }}>sem susto.</Txt>
              </Txt>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(560).delay(450).easing(EASE_OUT)}>
              <Txt size={17} color={C.sub} style={{ maxWidth: 340 }}>
                Quanto custa, como levar o dinheiro e o que fazer antes de embarcar. Tudo num lugar só.
              </Txt>
            </Animated.View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['💱 5 jeitos de levar dinheiro', '🌍 13 países', '✅ Checklist até a chegada', '🪐 Orbi, assistente com IA'].map((t, i) => (
              <Animated.View key={t} entering={FadeInDown.duration(420).delay(620 + i * 80).easing(EASE_OUT)} style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 7 }}>
                <Txt w="medium" size={13} style={{ lineHeight: 17 }}>{t}</Txt>
              </Animated.View>
            ))}
          </View>
        </View>
        <Animated.View entering={FadeInUp.duration(500).delay(1000).easing(EASE_OUT)} style={{ padding: 24, paddingTop: 8, gap: 10 }}>
          <Btn label="Começar" icon="arrow-right" onPress={() => setStep(1)} />
          <Txt size={12} color={C.faint} style={{ textAlign: 'center' }}>Leva menos de 1 minuto · sem cadastro</Txt>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    const codes = REGIONS.find((r) => r.id === region)?.codes;
    const q = plain(query);
    const list = COUNTRIES.filter(
      (c) =>
        (!codes || (codes as readonly string[]).includes(c.code)) &&
        (!q || plain(c.name).includes(q) || plain(c.currency).includes(q) || c.cities.some((city) => plain(city.name).includes(q))),
    );

    return (
      <Screen
        key="pais"
        eyebrow="Passo 1 de 2"
        title="Para onde você vai?"
        subtitle="Dá para trocar depois"
        footer={<Btn label={`Continuar com ${country.flag} ${country.name}`} icon="arrow-right" onPress={() => setStep(2)} />}
      >
        <Progress step={1} />
        <Field value={query} onChangeText={setQuery} icon="search" placeholder="País, cidade ou moeda" keyboard="default" />
        <ChipRow>
          {REGIONS.map((r) => (
            <Chip key={r.id} label={r.label} active={r.id === region} onPress={() => setRegion(r.id)} />
          ))}
        </ChipRow>

        <View style={st.grid}>
          {list.map((c, i) => (
            <Animated.View
              key={c.code}
              style={st.cell}
              entering={FadeInDown.duration(380).delay(Math.min(i, 9) * 40).easing(EASE_OUT)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.springify().damping(SOFT_SPRING.damping).stiffness(SOFT_SPRING.stiffness)}
            >
              <CountryCard c={c} on={c.code === p.country} from={fromBRL(c, rates)} onPress={() => setProfile({ country: c.code, city: 0 })} />
            </Animated.View>
          ))}
        </View>
        {list.length === 0 ? (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
            <Txt size={34} style={{ lineHeight: 42 }}>🧭</Txt>
            <P muted style={{ textAlign: 'center' }}>Nenhum destino com esse nome ainda. A Ponte cobre 13 países por enquanto.</P>
          </Animated.View>
        ) : null}
      </Screen>
    );
  }

  const city = country.cities[p.city] ?? country.cities[0];
  return (
    <Screen
      key="detalhes"
      eyebrow="Passo 2 de 2"
      title="Seu cartão de embarque"
      subtitle="Escolha a cidade, o mês e a duração"
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ width: 120 }}>
            <Btn label="Voltar" kind="ghost" onPress={() => setStep(1)} />
          </View>
          <View style={{ flex: 1 }}>
            <Btn
              label="Pronto"
              kind="accent"
              icon="check"
              onPress={() => {
                success();
                update({ onboarded: true });
                router.replace('/');
              }}
            />
          </View>
        </View>
      }
    >
      <Progress step={2} />
      <Ticket flag={country.flag} city={city.name} month={p.tripMonth} months={p.months} days={daysUntil(p.tripMonth)} />
      <Card style={{ gap: 12 }}>
        <Label>Cidade</Label>
        <ChipRow>
          {country.cities.map((c, i) => <Chip key={c.name} label={c.name} active={i === p.city} onPress={() => setProfile({ city: i })} />)}
        </ChipRow>
        <Label style={{ marginTop: 4 }}>Quando você embarca</Label>
        <ChipRow peek>
          {nextMonths(18).map((m) => <Chip key={m} label={monthChip(m)} active={m === p.tripMonth} onPress={() => setProfile({ tripMonth: m })} />)}
        </ChipRow>
        <Label style={{ marginTop: 4 }}>Por quanto tempo</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DURATIONS.map((d) => <Chip key={d} label={`${d} meses`} active={d === p.months} onPress={() => setProfile({ months: d })} />)}
        </View>
      </Card>
      <Card tone="accent" style={{ flexDirection: 'row', gap: 12 }}>
        <Txt size={22} style={{ lineHeight: 28 }}>{country.flag}</Txt>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt w="display" size={16}>{country.name} em uma frase</Txt>
          <P>{country.tip}</P>
        </View>
      </Card>
    </Screen>
  );
}

// "mai 2027" vira "mai ’27" nos chips, para caber mais meses na linha.
function monthChip(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const names = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${names[m - 1]} ’${String(y).slice(2)}`;
}

function CountryCard({ c, on, from, onPress }: { c: Country; on: boolean; from: number; onPress: () => void }) {
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${c.name}, ${c.currency}, a partir de ${brl(from, 0)} por mês`}
      style={[st.card, on ? st.cardOn : null]}
    >
      <View style={[st.flag, on ? { backgroundColor: 'rgba(245,241,234,0.12)' } : null]}>
        <Txt size={28} style={{ lineHeight: 34 }}>{c.flag}</Txt>
      </View>
      <Txt w="display" size={17} color={on ? C.cream : C.ink} numberOfLines={1}>{c.name}</Txt>
      <Txt size={12} color={on ? C.creamSub : C.sub} numberOfLines={1}>
        {c.currency} · {c.cities.map((x) => x.name).slice(0, 2).join(', ')}
      </Txt>
      <Txt w="bold" size={13} color={on ? C.cream : C.ink} style={{ marginTop: 6 }}>desde {brl(from, 0)}/mês</Txt>
      {on ? (
        <Animated.View entering={ZoomIn.springify().damping(12)} style={st.check}>
          <Feather name="check" size={14} color="#FFFFFF" />
        </Animated.View>
      ) : null}
    </Tap>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  cell: { width: '48.4%' },
  card: { padding: 16, borderRadius: R.lg, backgroundColor: C.card, gap: 2, borderWidth: 1, borderColor: C.line },
  cardOn: { backgroundColor: C.night, borderColor: C.night },
  flag: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.sunk, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  check: { position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
});
