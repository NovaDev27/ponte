import Feather from '@expo/vector-icons/Feather';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Linking, ScrollView, TextInput, View } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orbi, type OrbiMood } from '../../components/Orbi';
import { useKeyboardOpen } from '../../components/TabBar';
import { Btn, Card, P, TabSpace, Tap, Txt, s as ui } from '../../components/ui';
import { getCountry } from '../../data/countries';
import { apiHeaders } from '../../lib/api';
import { MAX_CHATS, newChatId, upsertChat, type Chat, type ChatMsg } from '../../lib/chats';
import { loadChats, saveChats } from '../../lib/chatsStorage';
import { hasCompleto } from '../../lib/completo';
import { monthLabel } from '../../lib/format';
import { serverOf, useApp } from '../../lib/store';
import { C, FONT, R } from '../../lib/theme';

// `ok` marca uma resposta de verdade do Orbi (não um aviso de erro): só ela pode ser reportada.
type Msg = ChatMsg;
type ReportState = 'sending' | 'sent' | 'fail';

const SUGGESTIONS = [
  'Qual o jeito mais barato de levar dinheiro?',
  'Stablecoin é seguro para mandar dinheiro?',
  'O que fazer na primeira semana lá?',
  'Como meus pais podem me mandar dinheiro todo mês?',
];

// "Apagar meus dados" sobe o `wipe`: a tela é montada de novo do zero, sem conversa na memória
// (nem resposta a caminho) que pudesse voltar para o histórico.
export default function Assistente() {
  const { wipe } = useApp();
  return <OrbiChat key={wipe} />;
}

function OrbiChat() {
  const { state, update } = useApp();
  const consent = state.aiConsent;
  const tabSpace = useContext(TabSpace);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false); // a resposta está demorando (servidor acordando)
  const [cheer, setCheer] = useState(false); // o Orbi comemora quando a resposta chega
  const [reports, setReports] = useState<Record<number, ReportState>>({}); // respostas reportadas, por posição
  const [chatId, setChatId] = useState(newChatId); // conversa aberta agora
  const [chats, setChats] = useState<Chat[]>([]); // histórico, só no celular
  const [history, setHistory] = useState(false); // mostrando a lista de conversas
  const [animFrom, setAnimFrom] = useState(0); // só as mensagens a partir daqui entram animadas (abrir conversa longa não trava)
  const dirty = useRef(false); // a conversa aberta mudou por uma pergunta nova (abrir uma antiga não conta)
  const loaded = useRef(false); // o histórico foi lido: só então dá para gravar sem apagar o que estava lá
  const showHistory = history && consent;
  const scroll = useRef<ScrollView>(null);
  const country = getCountry(state.profile.country);
  const city = country.cities[state.profile.city] ?? country.cities[0];
  const server = serverOf(state);

  // O servidor grátis dorme quando fica parado. Acorda ele assim que a aba abre,
  // para a primeira pergunta não demorar.
  useEffect(() => {
    fetch(`${server}/health`).catch(() => {});
  }, [server]);

  // Recarrega o histórico sempre que a aba ganha foco (ex.: depois de "Apagar meus dados" em Ajustes).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadChats().then((list) => {
        if (!alive || list === null) return; // erro de leitura: não mostra nem grava por cima
        loaded.current = true;
        setChats(list);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  // Botão voltar do Android com a lista aberta: fecha a lista em vez de sair da aba.
  useFocusEffect(
    useCallback(() => {
      if (!showHistory) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setHistory(false);
        return true;
      });
      return () => sub.remove();
    }, [showHistory]),
  );

  // Quando chega a resposta, guarda a conversa no histórico do celular.
  useEffect(() => {
    if (busy || !dirty.current || msgs.length === 0) return;
    dirty.current = false;
    const next = upsertChat(chats, { id: chatId, title: '', updatedAt: Date.now(), msgs });
    setChats(next);
    if (loaded.current) saveChats(next);
  }, [busy, msgs, chatId, chats]);

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

  // Acordando o servidor = Orbi sonolento; falha de rede ou do servidor = Orbi triste (aviso de limite, não).
  const last = msgs[msgs.length - 1];
  const failed = !busy && last?.role === 'assistant' && !!last.broke;
  const mood: OrbiMood = busy ? (slow ? 'sleeping' : 'thinking') : failed ? 'sad' : cheer ? 'happy' : 'idle';
  const mascot = state.mascot;

  async function send(content: string) {
    const q = content.trim();
    if (!q || busy || !consent) return; // sem o aceite, nada sai do celular
    const next: Msg[] = [...msgs, { role: 'user', content: q }];
    dirty.current = true;
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch(`${server}/chat`, {
        method: 'POST',
        headers: apiHeaders(state.deviceId, hasCompleto(state)),
        body: JSON.stringify({
          // Avisos de erro e de limite não voltam para a IA como se fossem conversa.
          messages: next.filter((m) => m.role === 'user' || m.ok).slice(-20),
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
      const real = typeof json.reply === 'string';
      const reply = real ? json.reply : json.error ?? 'Não consegui responder agora.';
      setMsgs((m) => [...m, { role: 'assistant', content: reply, ok: real && res.ok, broke: res.status >= 500 }]);
      if (res.ok) setCheer(true);
    } catch {
      setMsgs((m) => [...m, {
        role: 'assistant',
        content: 'Não consegui falar com o Orbi agora. Confira a internet e tente de novo em instantes.',
        broke: true,
      }]);
    } finally {
      setBusy(false);
      setSlow(false);
    }
  }

  // Reportar resposta: manda só o texto da resposta do Orbi (sem a pergunta, que pode ter dado pessoal).
  // Exigência da Google Play para apps com IA: a pessoa sinaliza conteúdo ofensivo sem sair do app.
  async function report(i: number, content: string) {
    if (reports[i] === 'sending' || reports[i] === 'sent') return;
    setReports((r) => ({ ...r, [i]: 'sending' }));
    try {
      const res = await fetch(`${server}/report`, {
        method: 'POST',
        headers: apiHeaders(state.deviceId),
        body: JSON.stringify({ resposta: content, version: Constants.expoConfig?.version ?? '?' }),
      });
      // 429 = já mandou muitas hoje: agradece igual, para o botão não ficar pedindo para tentar de novo.
      setReports((r) => ({ ...r, [i]: res.ok || res.status === 429 ? 'sent' : 'fail' }));
    } catch {
      setReports((r) => ({ ...r, [i]: 'fail' }));
    }
  }

  function newChat() {
    setMsgs([]);
    setReports({});
    setChatId(newChatId());
    setHistory(false);
    setAnimFrom(0);
  }

  function openChat(c: Chat) {
    dirty.current = false;
    setAnimFrom(c.msgs.length);
    setMsgs(c.msgs);
    setReports({});
    setChatId(c.id);
    setHistory(false);
  }

  function deleteChat(id: string) {
    const next = chats.filter((c) => c.id !== id);
    setChats(next);
    if (loaded.current) saveChats(next);
    if (id === chatId) {
      setMsgs([]);
      setReports({});
      setChatId(newChatId());
      setAnimFrom(0);
    }
  }

  return (
    <SafeAreaView style={ui.safe} edges={['top']}>
      {/* No Android o app é edge-to-edge e a janela não encolhe com o teclado, então o padding vale para as duas plataformas. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {msgs.length > 0 && mascot ? <Orbi size={52} mood={mood} /> : null}
          <View style={{ flex: 1, gap: 2 }}>
            <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>PASSO 4 · ASSISTENTE</Txt>
            <Txt w="heavy" size={msgs.length > 0 ? 24 : 34} style={{ lineHeight: msgs.length > 0 ? 28 : 38 }}>Orbi</Txt>
            {msgs.length > 0 ? (
              <Txt size={13} color={busy ? C.accent : C.sub}>{busy ? 'digitando…' : 'assistente da Ponte'}</Txt>
            ) : null}
          </View>
          {consent && (chats.length > 0 || showHistory) ? (
            <Tap onPress={() => setHistory((h) => !h)} disabled={busy} accessibilityLabel={showHistory ? 'Fechar conversas anteriores' : 'Conversas anteriores'} accessibilityState={{ selected: showHistory }} scaleTo={0.9} style={[headBtn, showHistory && { backgroundColor: C.ink, borderColor: C.ink }]}>
              <Feather name="clock" size={17} color={showHistory ? C.cream : C.ink} />
            </Tap>
          ) : null}
          {msgs.length > 0 || showHistory ? (
            <Tap onPress={newChat} disabled={busy} accessibilityLabel="Nova conversa" scaleTo={0.9} style={headBtn}>
              <Feather name="edit-3" size={17} color={C.ink} />
            </Tap>
          ) : null}
        </View>
        <ScrollView
          ref={scroll}
          // Sem a caixa de texto (antes do aceite), o fim do cartão precisa de espaço para não ficar atrás da barra de abas.
          contentContainerStyle={{ padding: 20, paddingTop: 6, paddingBottom: consent ? 20 : tabSpace + 20, gap: 10 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => { if (!showHistory && msgs.length > 0) scroll.current?.scrollToEnd({ animated: true }); }}
        >
          {showHistory ? <HistoryList chats={chats} current={chatId} onOpen={openChat} onDelete={deleteChat} /> : null}
          {!showHistory && msgs.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 10, paddingTop: 40, paddingBottom: 12 }}>
              {mascot ? <Orbi size={150} mood={mood} talk /> : null}
              <Txt w="display" size={22} style={{ marginTop: 8 }}>Oi! Eu sou o Orbi 👋</Txt>
              <Txt color={C.sub} style={{ textAlign: 'center', maxWidth: 300 }}>
                Pergunte qualquer coisa sobre o seu intercâmbio em {city.name}. Eu explico, comparo e aviso dos riscos.
              </Txt>
              {mascot ? <Txt w="mono" size={11} color={C.faint} style={{ letterSpacing: 0.8 }}>DICA: TOQUE EM MIM 😉</Txt> : null}
              {consent ? null : <ConsentCard onAccept={() => update({ aiConsent: true })} />}
              <View style={{ gap: 8, width: '100%', marginTop: 10, display: consent ? 'flex' : 'none' }}>
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
          {(showHistory ? [] : msgs).map((m, i) => {
            const me = m.role === 'user';
            return (
              <View key={i} style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
                <Animated.View
                  entering={i >= animFrom ? (me ? FadeInRight : FadeInLeft).springify().damping(18).stiffness(220) : undefined}
                  style={{
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
                {m.ok ? <ReportLink status={reports[i]} onPress={() => report(i, m.content)} /> : null}
              </View>
            );
          })}
          {/* Permissão desligada em Ajustes no meio de uma conversa: pede de novo antes de continuar. */}
          {!consent && msgs.length > 0 ? <ConsentCard onAccept={() => update({ aiConsent: true })} /> : null}
          {busy ? <Typing /> : null}
          {slow ? (
            <Txt size={12} color={C.sub} style={{ marginLeft: 4 }}>
              O Orbi está acordando. A primeira resposta do dia pode levar até 1 minuto.
            </Txt>
          ) : null}
        </ScrollView>
        {consent && !showHistory ? <Composer busy={busy} onSend={send} /> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const headBtn = { width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' } as const;

function whenLabel(t: number): string {
  const d = new Date(t);
  const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return `Hoje, ${hm}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hm}`;
}

// Conversas anteriores, guardadas só no celular. Toque para abrir; lixeira para apagar.
function HistoryList({ chats, current, onOpen, onDelete }: { chats: Chat[]; current: string; onOpen: (c: Chat) => void; onDelete: (id: string) => void }) {
  const [confirm, setConfirm] = useState<string | null>(null); // conversa esperando o "Apagar" de confirmação
  return (
    <View style={{ gap: 8 }}>
      <Txt w="display" size={18}>Conversas anteriores</Txt>
      <Txt size={13} color={C.sub}>Ficam salvas só neste celular (as {MAX_CHATS} mais recentes).</Txt>
      {chats.length === 0 ? (
        <Txt color={C.sub} style={{ marginTop: 12 }}>Nenhuma conversa ainda.</Txt>
      ) : (
        chats.map((c) =>
          confirm === c.id ? (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderRadius: R.md + 2, borderWidth: 1, borderColor: C.line, padding: 10, paddingLeft: 16 }}>
              <Txt w="medium" style={{ flex: 1 }}>Apagar esta conversa?</Txt>
              <Tap onPress={() => setConfirm(null)} accessibilityRole="button" scaleTo={0.95} style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' }}>
                <Txt w="bold" size={14}>Cancelar</Txt>
              </Tap>
              <Tap onPress={() => { setConfirm(null); onDelete(c.id); }} accessibilityRole="button" scaleTo={0.95} style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 22, backgroundColor: C.ink }}>
                <Txt w="bold" size={14} color={C.cream}>Apagar</Txt>
              </Tap>
            </View>
          ) : (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: R.md + 2, borderWidth: 1, borderColor: c.id === current ? C.ink : C.line }}>
              <Tap onPress={() => onOpen(c)} scaleTo={0.98} accessibilityRole="button" style={{ flex: 1, paddingVertical: 14, paddingLeft: 16, gap: 2 }}>
                <Txt w="medium" numberOfLines={2}>{c.title}</Txt>
                <Txt size={12} color={C.sub}>{whenLabel(c.updatedAt)} · {c.msgs.length} mensagens</Txt>
              </Tap>
              <Tap onPress={() => setConfirm(c.id)} haptic={false} accessibilityRole="button" accessibilityLabel={`Apagar a conversa: ${c.title}`} scaleTo={0.9} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="trash-2" size={17} color={C.sub} />
              </Tap>
            </View>
          ),
        )
      )}
    </View>
  );
}

// Pedido de permissão antes da primeira pergunta: diz o que sai do celular e para quem.
// Exigência da Apple (regra 5.1.2(i)) para apps que mandam dados a uma IA de outra empresa.
// O aceite pode ser desfeito em Ajustes.
function ConsentCard({ onAccept }: { onAccept: () => void }) {
  return (
    <Card style={{ width: '100%', marginTop: 10, gap: 10 }}>
      <Txt w="display" size={16}>Antes de começar</Txt>
      <P style={{ fontSize: 14 }}>
        Para responder, o Orbi envia a sua pergunta, as últimas mensagens da conversa e um resumo do seu plano (país, cidade, moeda, mês de embarque e duração) ao servidor da Ponte e à Groq, empresa de inteligência artificial dos Estados Unidos.
      </P>
      <P muted style={{ fontSize: 14 }}>
        O servidor da Ponte não guarda as conversas e também recebe um código anônimo do aparelho, só para contar o limite de perguntas. Não escreva dados pessoais, como documentos ou senhas.
      </P>
      <Btn label="Concordo, quero usar o Orbi" kind="accent" icon="check" onPress={onAccept} />
      <Btn label="Ler a Política de Privacidade" kind="ghost" icon="shield" onPress={() => Linking.openURL('https://novadev27.github.io/ponte/privacidade/')} />
      <P muted style={{ fontSize: 12, textAlign: 'center' }}>Sem o seu OK, nada é enviado. Dá para mudar depois em Ajustes.</P>
    </Card>
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

// Link discreto embaixo de cada resposta do Orbi. Área de toque de 44 px de altura no próprio botão
// (no Android o hitSlop não vale fora da View pai).
function ReportLink({ status, onPress }: { status?: ReportState; onPress: () => void }) {
  if (status === 'sent') {
    return (
      <Txt size={12} color={C.sub} accessibilityLiveRegion="polite" style={{ marginTop: 6, marginLeft: 6 }}>
        Valeu! A gente vai olhar essa resposta.
      </Txt>
    );
  }
  const sending = status === 'sending';
  return (
    <Tap
      onPress={onPress}
      disabled={sending}
      haptic={false}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityState={{ disabled: sending, busy: sending }}
      hitSlop={{ top: 4, left: 8, right: 8 }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', minHeight: 44, paddingVertical: 8, paddingHorizontal: 6 }}
    >
      <Feather name="flag" size={12} color={C.sub} />
      <Txt size={12} color={C.sub}>
        {sending ? 'Enviando…' : status === 'fail' ? 'Não deu para enviar. Toque para tentar de novo' : 'Reportar resposta'}
      </Txt>
    </Tap>
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
