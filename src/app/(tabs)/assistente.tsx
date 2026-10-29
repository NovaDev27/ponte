import Feather from '@expo/vector-icons/Feather';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, TextInput, View } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orbi } from '../../components/Orbi';
import { useKeyboardOpen } from '../../components/TabBar';
import { TabSpace, Tap, Txt, s as ui } from '../../components/ui';
import { getCountry } from '../../data/countries';
import { apiHeaders } from '../../lib/api';
import { hasCompleto } from '../../lib/completo';
import { monthLabel } from '../../lib/format';
import { serverOf, useApp } from '../../lib/store';
import { C, FONT, R } from '../../lib/theme';

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
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false); // a resposta está demorando (servidor acordando)
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

  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, [busy]);

  const mood = busy ? 'thinking' : cheer ? 'happy' : 'idle';

  async function send(content: string) {
    const q = content.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', content: q }];
    setMsgs(next);
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
      setSlow(false);
    }
  }

  return (
    <SafeAreaView style={ui.safe} edges={['top']}>
      {/* No Android o app é edge-to-edge e a janela não encolhe com o teclado, então o padding vale para as duas plataformas. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {msgs.length > 0 ? <Orbi size={52} mood={mood} /> : null}
          <View style={{ flex: 1, gap: 2 }}>
            <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>PASSO 4 · ASSISTENTE</Txt>
            <Txt w="heavy" size={msgs.length > 0 ? 24 : 34} style={{ lineHeight: msgs.length > 0 ? 28 : 38 }}>Orbi</Txt>
            {msgs.length > 0 ? (
              <Txt size={13} color={busy ? C.accent : C.sub}>{busy ? 'digitando…' : 'online · responde em segundos'}</Txt>
            ) : null}
          </View>
          {msgs.length > 0 ? (
            <Tap onPress={() => setMsgs([])} disabled={busy} accessibilityLabel="Nova conversa" scaleTo={0.9} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="edit-3" size={17} color={C.ink} />
            </Tap>
          ) : null}
        </View>
        <ScrollView
          ref={scroll}
          contentContainerStyle={{ padding: 20, paddingTop: 6, gap: 10 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => { if (msgs.length > 0) scroll.current?.scrollToEnd({ animated: true }); }}
        >
          {msgs.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 10, paddingTop: 40, paddingBottom: 12 }}>
              <Orbi size={150} mood={mood} talk />
              <Txt w="display" size={22} style={{ marginTop: 8 }}>Oi! Eu sou o Orbi 👋</Txt>
              <Txt color={C.sub} style={{ textAlign: 'center', maxWidth: 300 }}>
                Pergunte qualquer coisa sobre o seu intercâmbio em {city.name}. Eu explico, comparo e aviso dos riscos.
              </Txt>
              <Txt w="mono" size={11} color={C.faint} style={{ letterSpacing: 0.8 }}>DICA: TOQUE EM MIM 😉</Txt>
              <View style={{ gap: 8, width: '100%', marginTop: 10 }}>
                {SUGGESTIONS.map((t, i) => (
                  <Animated.View key={t} entering={FadeInDown.duration(420).delay(200 + i * 80)}>
                    <Tap onPress={() => send(t)} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: R.md + 2, backgroundColor: C.card, borderWidth: 1, borderColor: C.line }}>
                      <Txt w="medium" style={{ flex: 1 }}>{t}</Txt>
                      <Feather name="arrow-up-right" size={17} color={C.faint} />
                    </Tap>
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : null}
          {msgs.map((m, i) => {
            const me = m.role === 'user';
            return (
              <Animated.View
                key={i}
                entering={(me ? FadeInRight : FadeInLeft).springify().damping(18).stiffness(220)}
                style={{
                  alignSelf: me ? 'flex-end' : 'flex-start',
                  maxWidth: '86%',
                  backgroundColor: me ? C.ink : C.card,
                  borderWidth: me ? 0 : 1,
                  borderColor: C.line,
                  paddingHorizontal: 15,
                  paddingVertical: 11,
                  borderRadius: 20,
                  borderBottomRightRadius: me ? 6 : 20,
                  borderBottomLeftRadius: me ? 20 : 6,
                }}
              >
                <Txt color={me ? C.cream : C.ink}>{m.content}</Txt>
              </Animated.View>
            );
          })}
          {busy ? <Typing /> : null}
          {slow ? (
            <Txt size={12} color={C.sub} style={{ marginLeft: 4 }}>
              O Orbi está acordando. A primeira resposta do dia pode levar até 1 minuto.
            </Txt>
          ) : null}
        </ScrollView>
        <Composer busy={busy} onSend={send} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// O texto digitado mora aqui dentro: assim cada letra redesenha só a caixa de texto,
// e não a conversa inteira com o Orbi animado.
function Composer({ busy, onSend }: { busy: boolean; onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const tabSpace = useContext(TabSpace);
  const kb = useKeyboardOpen();
  const ready = !!text.trim() && !busy;

  function submit() {
    if (!ready) return;
    onSend(text);
    setText('');
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingTop: 10, paddingBottom: kb ? 10 : tabSpace + 4 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: C.card, borderRadius: 26, borderWidth: 1, borderColor: C.line, paddingLeft: 18, paddingRight: 5, paddingVertical: 5, minHeight: 52 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escreva sua dúvida"
          placeholderTextColor={C.faint}
          style={{ flex: 1, maxHeight: 120, paddingVertical: 10, fontSize: 15, color: C.ink, fontFamily: FONT.regular }}
          multiline
          numberOfLines={1}
          onSubmitEditing={submit}
        />
        <Tap
          accessibilityLabel="Enviar"
          onPress={submit}
          disabled={!ready}
          scaleTo={0.85}
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: ready ? C.accent : C.sunk, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="arrow-up" size={20} color={ready ? '#FFFFFF' : C.faint} />
        </Tap>
      </View>
    </View>
  );
}

// Três bolinhas pulando enquanto o Orbi pensa.
function Typing() {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: 5, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 20, borderBottomLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 15 }}>
      {[0, 1, 2].map((i) => <Dot key={i} delay={i * 140} />)}
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withDelay(delay, withRepeat(withSequence(withTiming(-5, { duration: 260 }), withTiming(0, { duration: 260 }), withTiming(0, { duration: 260 })), -1)));
  }, [y, delay]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }], opacity: 0.45 + (-y.get() / 5) * 0.55 }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.ink }, st]} />;
}
