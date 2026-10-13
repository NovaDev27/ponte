import Feather from '@expo/vector-icons/Feather';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Btn, Card, H, Label, P, Screen, Tap } from '../components/ui';
import { apiHeaders } from '../lib/api';
import { serverOf, useApp } from '../lib/store';
import { C, R } from '../lib/theme';

const QUESTIONS = [
  { key: 'gostou', label: 'O que você mais gostou?', placeholder: 'Ex.: ver quanto eu perco em cada caminho' },
  { key: 'melhorar', label: 'O que foi confuso ou pode melhorar?', placeholder: 'Ex.: não entendi a tela de orçamento' },
  { key: 'pagaria', label: 'Você pagaria por alguma função? Qual?', placeholder: 'Ex.: plano em PDF para mostrar aos meus pais' },
] as const;

type Answers = Record<(typeof QUESTIONS)[number]['key'], string>;

export default function Feedback() {
  const { state } = useApp();
  const [nota, setNota] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ gostou: '', melhorar: '', pagaria: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const empty = !nota && !Object.values(answers).some((v) => v.trim());

  async function send() {
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${serverOf(state)}/feedback`, {
        method: 'POST',
        headers: apiHeaders(state.deviceId),
        body: JSON.stringify({ nota, ...answers, version: Constants.expoConfig?.version ?? '?' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Não foi possível enviar agora.');
      setStatus('sent');
    } catch (e) {
      setError(e instanceof Error && e.message !== 'Network request failed' ? e.message : 'Sem conexão. Tente de novo em instantes.');
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <Screen header>
        <Card tone="good" style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}>
          <Feather name="heart" size={36} color={C.good} />
          <H>Muito obrigado!</H>
          <P style={{ textAlign: 'center' }}>Sua opinião chegou e vai ajudar a deixar a Ponte melhor para todo mundo.</P>
        </Card>
        <Btn label="Voltar" kind="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen header>
      <P muted>Leva 2 minutos. Não pedimos nome nem e-mail: escreva com sinceridade.</P>

      <Card>
        <Label>De 1 a 5, quanto você gostou da Ponte?</Label>
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Tap key={n} onPress={() => setNota(n)} accessibilityRole="button" accessibilityLabel={`Nota ${n}`} accessibilityState={{ selected: nota === n }} hitSlop={6}>
              <Text style={{ fontSize: 36, color: n <= nota ? '#F5B301' : C.line }}>★</Text>
            </Tap>
          ))}
        </View>
      </Card>

      {QUESTIONS.map((q) => (
        <Card key={q.key}>
          <Label>{q.label}</Label>
          <TextInput
            value={answers[q.key]}
            onChangeText={(t) => setAnswers((a) => ({ ...a, [q.key]: t }))}
            placeholder={q.placeholder}
            placeholderTextColor={C.faint}
            multiline
            maxLength={1000}
            style={{ minHeight: 84, borderWidth: 1, borderColor: C.line, borderRadius: R.md, backgroundColor: C.bg, padding: 12, fontSize: 15, color: C.ink, textAlignVertical: 'top' }}
          />
        </Card>
      ))}

      {error ? <P style={{ color: C.bad }}>{error}</P> : null}
      <Btn label={status === 'sending' ? 'Enviando...' : 'Enviar opinião'} icon="send" onPress={send} disabled={empty || status === 'sending'} />
    </Screen>
  );
}
