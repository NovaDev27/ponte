import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { Btn, Card, Chip, ChipRow, H, Label, P, Screen } from '../components/ui';
import { COUNTRIES, getCountry } from '../data/countries';
import { monthLabel, nextMonths } from '../lib/format';
import { useApp } from '../lib/store';
import { C } from '../lib/theme';

const DURATIONS = [3, 6, 8, 12, 24];

export default function Onboarding() {
  const { state, setProfile, update } = useApp();
  const [step, setStep] = useState(state.onboarded ? 1 : 0);
  const p = state.profile;
  const country = getCountry(p.country);

  if (step === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.night }}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <Logo size={220} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 44, fontWeight: '800', letterSpacing: -1 }}>ponte</Text>
          <Text style={{ color: '#C8D6E5', fontSize: 18, textAlign: 'center', maxWidth: 320, lineHeight: 25 }}>
            Seu intercâmbio sem perder dinheiro no câmbio.
          </Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {['Compare 5 jeitos de levar dinheiro', 'Orçamento real para 13 países', 'Checklist do visto à chegada', 'Assistente com IA'].map((t) => (
              <Text key={t} style={{ color: '#9FB4CC', fontSize: 15 }}>✓  {t}</Text>
            ))}
          </View>
        </View>
        <View style={{ padding: 24 }}>
          <Btn label="Começar" kind="accent" onPress={() => setStep(1)} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    return (
      <Screen title="Para onde você vai?" subtitle="Dá para trocar depois">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {COUNTRIES.map((c) => {
            const on = c.code === p.country;
            return (
              <Pressable
                key={c.code}
                onPress={() => setProfile({ country: c.code, city: 0 })}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={{ width: '31.5%', minWidth: 100, padding: 12, borderRadius: 16, borderWidth: 2, borderColor: on ? C.primary : C.line, backgroundColor: on ? C.primarySoft : C.card, gap: 4 }}
              >
                <Text style={{ fontSize: 30 }}>{c.flag}</Text>
                <Text style={{ fontWeight: '700', color: C.ink }}>{c.name}</Text>
                <Text style={{ color: C.sub, fontSize: 12 }}>{c.currency}</Text>
              </Pressable>
            );
          })}
        </View>
        <Btn label={`Continuar com ${country.name}`} onPress={() => setStep(2)} />
      </Screen>
    );
  }

  return (
    <Screen title={`${country.flag} ${country.name}`} subtitle="Só mais alguns detalhes">
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
      <Btn
        label="Pronto"
        kind="accent"
        onPress={() => {
          update({ onboarded: true });
          router.replace('/');
        }}
      />
      <Btn label="Voltar" kind="ghost" onPress={() => setStep(1)} />
    </Screen>
  );
}
