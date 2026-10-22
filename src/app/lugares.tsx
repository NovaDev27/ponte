import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { PlacesList } from '../components/Places';
import { Chip, ChipRow, ListRow, Screen, Txt } from '../components/ui';
import { COUNTRIES, getCountry } from '../data/countries';
import { PLACES } from '../data/places';
import { useApp } from '../lib/store';
import { C } from '../lib/theme';

// Lugares para conhecer em cada destino, com foto e resumo.
export default function Lugares() {
  const { state } = useApp();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? state.profile.country);
  const [city, setCity] = useState<string | null>(null);
  const country = getCountry(code);
  const cities = [...new Set((PLACES[code] ?? []).map((p) => p.city))];

  return (
    <Screen header>
      <Txt color={C.sub}>Pontos turísticos, bairros e passeios para conhecer quando chegar. Toque num lugar para ler mais.</Txt>
      <ChipRow>
        {COUNTRIES.map((c) => (
          <Chip key={c.code} label={`${c.flag} ${c.name}`} active={c.code === code} color={C.navy} onPress={() => { setCode(c.code); setCity(null); }} />
        ))}
      </ChipRow>
      {cities.length > 1 ? (
        <ChipRow>
          {[null, ...cities].map((ct) => (
            <Chip key={ct ?? 'todas'} label={ct ?? 'Todas'} active={ct === city} onPress={() => setCity(ct)} />
          ))}
        </ChipRow>
      ) : null}
      <PlacesList code={code} city={city} />
      <ListRow icon="file-text" color="#FFFFFF" soft={C.ink} title={`${country.name}: custo, visto e regras`} hint="Custo de vida por cidade, visto, trabalho e chegada" onPress={() => router.push(`/pais/${code}`)} last />
    </Screen>
  );
}
