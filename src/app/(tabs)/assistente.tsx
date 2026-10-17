import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orbi } from '../../components/Orbi';
import { s as ui, Tap } from '../../components/ui';
import { getCountry } from '../../data/countries';
import { apiHeaders } from '../../lib/api';
import { hasCompleto } from '../../lib/completo';
import { monthLabel } from '../../lib/format';
import { serverOf, useApp } from '../../lib/store';
import { C, F } from '../../lib/theme';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'Qual o jeito mais barato de levar dinheiro?',
  'Stablecoin é seguro para mandar dinheiro?',
  'O que fazer na primeira semana lá?',
  'Como meus pais podem me mandar dinheiro todo mês?',
];

export default function Assistente() {
  const { state } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [cheer, setCheer] = useState(false); // o Orbi comemora quando a resposta chega
  const scroll = useRef<ScrollView>(null);
  const country = getCountry(state.profile.country);
  const city = country.cities[state.profile.city] ?? country.cities[0];
  const server = serverOf(state);

  // O servidor grátis dorme quando fica parado. Acorda ele assim que a aba abre,
  // para a primeira pergunta não demorar.
  useEffect(() => {
    fetch(`${server}/health`).catch(() => {});
  }, [server]);

  useEffect(() => {
    if (!cheer) return;
    const t = setTimeout(() => setCheer(false), 1600);
    return () => clearTimeout(t);
  }, [cheer]);

  const mood = busy ? 'thinking' : cheer ? 'happy' : 'idle';

  async function send(content: string) {
    const q = content.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', content: q }];
    setMsgs(next);
    setText('');
    setBusy(true);
    try {
      const res = await fetch(`${server}/chat`, {
        method: 'POST',
        headers: apiHeaders(state.deviceId, hasCompleto(state)),
        body: JSON.stringify({
          messages: next.slice(-20),
          context: {
            pais: country.name,
            cidade: city.name,
            moeda: country.currency,
            embarque: monthLabel(state.profile.tripMonth),
            meses: state.profile.months,
          },
        }),
      });
      const json = await res.json();
      const reply = typeof json.reply === 'string' ? json.reply : json.error ?? 'Não consegui responder agora.';
      setMsgs((m) => [...m, { role: 'assistant', content: reply }]);
      if (res.ok) setCheer(true);
    } catch {
      setMsgs((m) => [...m, {
        role: 'assistant',
        content: 'Não consegui falar com o servidor do assistente. Confira se ele está rodando e se o endereço em Ajustes está certo.',
      }]);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  }

  return (
    <SafeAreaView style={ui.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={[ui.eyebrow, { color: F.assistente.color }]}>Passo 4 · Assistente</Text>
            <Text style={ui.title}>Orbi</Text>
            <Text style={ui.subtitle}>{busy ? 'Pensando na sua resposta…' : 'Dúvidas sobre câmbio, documentos e vida lá fora'}</Text>
          </View>
          {msgs.length > 0 ? <Orbi size={72} mood={mood} /> : null}
        </View>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
          {msgs.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 10, paddingTop: 44, paddingBottom: 20 }}>
              <Orbi size={150} mood={mood} talk />
              <Text style={{ color: C.ink, fontWeight: '800', fontSize: 18 }}>Oi! Eu sou o Orbi 👋</Text>
              <Text style={{ color: C.sub, textAlign: 'center', fontSize: 15, maxWidth: 300 }}>
                Pergunte qualquer coisa sobre o seu intercâmbio em {city.name}. Eu explico, comparo e aviso dos riscos.
              </Text>
              <Text style={{ color: C.faint, fontSize: 12 }}>Dica: toque em mim 😉</Text>
              <View style={{ gap: 8, width: '100%', marginTop: 8 }}>
                {SUGGESTIONS.map((t) => (
                  <Tap key={t} onPress={() => send(t)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, backgroundColor: C.card, boxShadow: '0px 4px 14px rgba(18,32,51,0.06)' }}>
                    <Feather name="message-circle" size={16} color={F.assistente.color} />
                    <Text style={{ flex: 1, color: C.ink, fontWeight: '600' }}>{t}</Text>
                  </Tap>
                ))}
              </View>
            </View>
          ) : null}
          {msgs.map((m, i) => (
            <View
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                backgroundColor: m.role === 'user' ? F.assistente.color : C.card,
                borderWidth: m.role === 'user' ? 0 : 1,
                borderColor: C.line,
                padding: 12,
                borderRadius: 16,
                borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: m.role === 'user' ? 16 : 4,
              }}
            >
              <Text style={{ color: m.role === 'user' ? '#FFFFFF' : C.ink, fontSize: 15, lineHeight: 21 }}>{m.content}</Text>
            </View>
          ))}
          {busy ? (
            <View style={{ alignSelf: 'flex-start', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text style={{ color: C.sub, fontSize: 15 }}>Orbi está pensando…</Text>
            </View>
          ) : null}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.card }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escreva sua dúvida"
            placeholderTextColor={C.faint}
            style={{ flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 14, backgroundColor: C.bg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: C.ink }}
            multiline
            onSubmitEditing={() => send(text)}
          />
          <Tap
            accessibilityLabel="Enviar"
            onPress={() => send(text)}
            disabled={busy || !text.trim()}
            style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: F.assistente.color, alignItems: 'center', justifyContent: 'center', opacity: busy || !text.trim() ? 0.4 : 1 }}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </Tap>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
