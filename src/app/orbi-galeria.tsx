import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { ORBI_MOODS, OrbiArt } from '../components/Orbi';
import { Screen, Txt } from '../components/ui';
import { C } from '../lib/theme';

// Vitrine dos 15 estados do Orbi, só no modo de desenvolvimento (na versão da loja volta para o início).
export default function OrbiGaleria() {
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <Screen header>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
        {ORBI_MOODS.map((m) => (
          <View key={m} style={{ alignItems: 'center', width: 150 }}>
            <OrbiArt mood={m} size={140} />
            <Txt w="mono" size={11} color={C.sub}>{m}</Txt>
          </View>
        ))}
      </View>
    </Screen>
  );
}
