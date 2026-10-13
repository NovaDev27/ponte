import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { Bar, Btn, Card, Chip, ChipRow, Field, H, Label, P, Screen, Tap } from '../components/ui';
import { COUNTRIES, getCountry, type Country } from '../data/countries';
import { brl, monthLabel, nextMonths } from '../lib/format';
import { EASE_OUT, SOFT_SPRING, success } from '../lib/motion';
import { rateOf, useApp, type Rates } from '../lib/store';
import { C, R, shadow } from '../lib/theme';

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

export default function Onboarding() {
  const { state, rates, setProfile, update } = useApp();
  const [step, setStep] = useState(state.onboarded ? 1 : 0);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<RegionId>('todos');
  const p = state.profile;
  const country = getCountry(p.country);

  if (step === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.night }}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <Animated.View entering={ZoomIn.springify().damping(14).delay(80)}>
            <Logo size={220} color="#FFFFFF" />
          </Animated.View>
          <Animated.Text entering={FadeInDown.duration(500).delay(280).easing(EASE_OUT)} style={{ color: '#FFFFFF', fontSize: 44, fontWeight: '800', letterSpacing: -1 }}>
            ponte
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(500).delay(380).easing(EASE_OUT)}
            style={{ color: '#C8D6E5', fontSize: 18, textAlign: 'center', maxWidth: 320, lineHeight: 25 }}
          >
            Seu intercâmbio sem perder dinheiro no câmbio.
          </Animated.Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {['Compare 5 jeitos de levar dinheiro', 'Orçamento real para 13 países', 'Checklist do visto à chegada', 'Assistente com IA'].map((t, i) => (
              <Animated.Text key={t} entering={FadeInDown.duration(420).delay(520 + i * 90).easing(EASE_OUT)} style={{ color: '#9FB4CC', fontSize: 15 }}>
                ✓  {t}
              </Animated.Text>
            ))}
          </View>
        </View>
        <Animated.View entering={FadeInUp.duration(500).delay(900).easing(EASE_OUT)} style={{ padding: 24 }}>
          <Btn label="Começar" kind="accent" onPress={() => setStep(1)} />
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
        <Bar value={0.5} color={C.accent} height={6} />
        <Field value={query} onChangeText={setQuery} prefix="⌕" placeholder="País, cidade ou moeda" keyboard="default" />
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
              entering={FadeInDown.duration(360).delay(Math.min(i, 9) * 40).easing(EASE_OUT)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.springify().damping(SOFT_SPRING.damping).stiffness(SOFT_SPRING.stiffness)}
            >
              <CountryCard c={c} on={c.code === p.country} from={fromBRL(c, rates)} onPress={() => setProfile({ country: c.code, city: 0 })} />
            </Animated.View>
          ))}
        </View>
        {list.length === 0 ? (
          <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
            <Text style={{ fontSize: 34 }}>🧭</Text>
            <P muted style={{ textAlign: 'center' }}>Nenhum destino com esse nome ainda. A Ponte cobre 13 países por enquanto.</P>
          </Animated.View>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen
      key="detalhes"
      eyebrow="Passo 2 de 2"
      title={`${country.flag} ${country.name}`}
      subtitle="Só mais alguns detalhes"
      footer={
        <View style={{ gap: 8 }}>
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
          <Btn label="Voltar" kind="ghost" onPress={() => setStep(1)} />
        </View>
      }
    >
      <Bar value={1} color={C.accent} height={6} />
      <Card>
        <Label>Cidade</Label>
        <ChipRow>
          {country.cities.map((c, i) => <Chip key={c.name} label={c.name} active={i === p.city} onPress={() => setProfile({ city: i })} />)}
        </ChipRow>
        <Label>Quando você embarca</Label>
        <ChipRow>
          {nextMonths(18).map((m) => <Chip key={m} label={monthLabel(m)} active={m === p.tripMonth} onPress={() => setProfile({ tripMonth: m })} />)}
        </ChipRow>
        <Label>Por quanto tempo</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DURATIONS.map((d) => <Chip key={d} label={`${d} meses`} active={d === p.months} onPress={() => setProfile({ months: d })} />)}
        </View>
      </Card>
      <Card tone="accent">
        <H>{country.name} em uma frase</H>
        <P>{country.tip}</P>
      </Card>
    </Screen>
  );
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
      <View style={[st.flag, on ? { backgroundColor: 'rgba(255,255,255,0.16)' } : null]}>
        <Text style={{ fontSize: 28 }}>{c.flag}</Text>
      </View>
      <Text style={[st.name, on ? { color: '#FFFFFF' } : null]} numberOfLines={1}>{c.name}</Text>
      <Text style={[st.meta, on ? { color: '#B5C6D9' } : null]} numberOfLines={1}>
        {c.currency} · {c.cities.map((x) => x.name).slice(0, 2).join(', ')}
      </Text>
      <Text style={[st.cost, on ? { color: '#FFFFFF' } : null]}>desde {brl(from, 0)}/mês</Text>
      {on ? (
        <Animated.View entering={ZoomIn.springify().damping(12)} style={st.check}>
          <Feather name="check" size={14} color={C.primary} />
        </Animated.View>
      ) : null}
    </Tap>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  cell: { width: '48.5%' },
  card: { padding: 14, borderRadius: R.lg, backgroundColor: C.card, gap: 3, borderWidth: 2, borderColor: 'transparent', ...shadow },
  cardOn: { backgroundColor: C.primary, borderColor: C.primary },
  flag: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '800', color: C.ink },
  meta: { fontSize: 12, color: C.sub },
  cost: { fontSize: 13, fontWeight: '700', color: C.ink, marginTop: 6 },
  check: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
