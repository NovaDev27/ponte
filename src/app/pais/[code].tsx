import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, Text, View } from 'react-native';
import { Btn, Card, H, Icon, Label, P, Row, Screen, Tap } from '../../components/ui';
import { getCountry, STYLE_FACTOR } from '../../data/countries';
import { brl, money } from '../../lib/format';
import { rateOf, useApp } from '../../lib/store';
import { C } from '../../lib/theme';

export default function Pais() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { state, setProfile, rates } = useApp();
  const country = getCountry(String(code));
  const rate = rateOf(rates, country.currency);
  const mine = state.profile.country === country.code;

  return (
    <Screen header title={`${country.flag} ${country.name}`} subtitle={`Moeda: ${country.currency} · ${money(1, country.currency, 0)} = ${brl(1 / rate)}`}>
      <Stack.Screen options={{ title: country.name }} />

      <Card>
        <H>Custo de vida por mês</H>
        <P muted style={{ fontSize: 13 }}>Estimativa moderada com quarto compartilhado, sem curso.</P>
        {country.cities.map((c) => {
          const total = Object.values(c.costs).reduce((a, b) => a + b, 0) * STYLE_FACTOR.mod + country.seguro;
          return <Row key={c.name} left={c.name} right={`${money(total, country.currency, 0)} ≈ ${brl(total / rate, 0)}`} />;
        })}
      </Card>

      <Card>
        <Label>Visto</Label>
        <P>{country.visa}</P>
        <Label>Trabalho</Label>
        <P>{country.work}</P>
      </Card>

      <Card>
        <H>Ao chegar</H>
        {country.arrival.map((t) => <P key={t}>• {t}</P>)}
        <Row left="Emergência" right={country.emergency} strong />
      </Card>

      <Card tone="accent">
        <H>Dica</H>
        <P>{country.tip}</P>
      </Card>

      <Tap onPress={() => Linking.openURL(country.site.url)} accessibilityRole="link">
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="external-link" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: C.ink }}>Site oficial: {country.site.label}</Text>
              <Text style={{ color: C.sub, fontSize: 13 }}>Regras de imigração mudam. Confira sempre a fonte oficial.</Text>
            </View>
          </View>
        </Card>
      </Tap>

      {mine ? (
        <P muted style={{ textAlign: 'center' }}>Este já é o seu destino.</P>
      ) : (
        <Btn
          label={`Escolher ${country.name} como destino`}
          onPress={() => {
            setProfile({ country: country.code, city: 0 });
            router.back();
          }}
        />
      )}
    </Screen>
  );
}
