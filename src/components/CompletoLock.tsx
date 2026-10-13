import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { C } from '../lib/theme';
import { Btn, Card, P } from './ui';

// Aparece no lugar de uma função paga para quem ainda não tem o Ponte Completo.
export function CompletoLock({ title, text }: { title: string; text: string }) {
  return (
    <Card tone="accent">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="lock" size={18} color={C.accent} />
        <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16, flex: 1 }}>{title}</Text>
      </View>
      <P>{text}</P>
      <Btn label="Conhecer o Ponte Completo" kind="accent" icon="star" onPress={() => router.push('/completo')} />
    </Card>
  );
}
