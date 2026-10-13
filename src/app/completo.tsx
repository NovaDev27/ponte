import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Logo } from '../components/Logo';
import { Badge, Btn, Card, Hero, IconBox, P, Screen } from '../components/ui';
import { billingAvailable, buyCompleto, completoPrice, listenPurchases, ownsCompleto } from '../lib/billing';
import { COMPLETO_BENEFITS, COMPLETO_GRATIS, hasCompleto } from '../lib/completo';
import { useApp } from '../lib/store';
import { C } from '../lib/theme';

export default function Completo() {
  const { state, update } = useApp();
  const [price, setPrice] = useState<string | null>(null);
  const [store, setStore] = useState<'loading' | 'ok' | 'off'>('loading');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    let stop = () => {};
    (async () => {
      const ok = await billingAvailable();
      if (!alive) return;
      setStore(ok ? 'ok' : 'off');
      if (!ok) return;
      setPrice(await completoPrice());
      const s = await listenPurchases(
        () => {
          update({ premium: true });
          setBusy(false);
          setMsg('Compra confirmada. Obrigado por apoiar a Ponte! 🎉');
        },
        (m) => {
          setBusy(false);
          setMsg(m);
        },
      );
      if (alive) stop = s;
      else s();
    })();
    return () => {
      alive = false;
      stop();
    };
  }, [update]);

  async function buy() {
    setMsg('');
    setBusy(true);
    try {
      if (!(await buyCompleto())) {
        setBusy(false);
        setMsg('A compra só funciona no app instalado pelo Google Play.');
      }
    } catch {
      setBusy(false);
      setMsg('Não foi possível abrir o pagamento agora.');
    }
  }

  async function restore() {
    setMsg('');
    setBusy(true);
    const owned = await ownsCompleto();
    setBusy(false);
    if (owned) {
      update({ premium: true });
      setMsg('Compra recuperada! O Ponte Completo está liberado.');
    } else {
      setMsg('Não encontramos uma compra nesta conta Google.');
    }
  }

  const unlocked = hasCompleto(state);

  return (
    <Screen header>
      <Hero>
        <View style={{ position: 'absolute', right: -16, bottom: -12, opacity: 0.12 }}>
          <Logo size={170} color="#FFFFFF" accent="#FFFFFF" />
        </View>
        <Badge label="PONTE COMPLETO" color="#FFFFFF" soft="rgba(255,255,255,0.16)" />
        <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>Seu intercâmbio planejado do começo ao fim</Text>
        <Text style={{ color: '#C8D6E5', fontSize: 15 }}>
          {COMPLETO_GRATIS && !state.premium ? 'Liberado grátis durante o teste' : 'Pagamento único. Sem mensalidade.'}
        </Text>
      </Hero>

      {COMPLETO_BENEFITS.map((b) => (
        <Card key={b.title} style={{ flexDirection: 'row', gap: 12 }}>
          <IconBox name={b.icon} color={C.accent} soft={C.accentSoft} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontWeight: '800', color: C.ink, fontSize: 16 }}>{b.title}</Text>
            <P muted style={{ fontSize: 14 }}>{b.text}</P>
          </View>
        </Card>
      ))}

      {state.premium ? (
        <Card tone="good" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Feather name="check-circle" size={22} color={C.good} />
          <P style={{ flex: 1, fontWeight: '700' }}>Você tem o Ponte Completo. Obrigado!</P>
        </Card>
      ) : unlocked ? (
        <Card tone="good">
          <P style={{ fontWeight: '700' }}>Durante o teste, tudo isso está liberado para você.</P>
          <P muted style={{ fontSize: 14 }}>Use à vontade e conte em “Dê sua opinião” o que valeria a pena pagar.</P>
        </Card>
      ) : store === 'loading' ? (
        <ActivityIndicator color={C.primary} />
      ) : store === 'ok' ? (
        <>
          <Btn label={busy ? 'Abrindo o Google Play...' : `Liberar por ${price ?? '...'}`} kind="accent" icon="star" onPress={buy} disabled={busy || !price} />
          <Btn label="Já comprei: recuperar compra" kind="ghost" onPress={restore} disabled={busy} />
        </>
      ) : (
        <Card>
          <P muted>A compra fica disponível no app instalado pelo Google Play.</P>
        </Card>
      )}

      {msg ? <P style={{ textAlign: 'center', fontWeight: '700' }}>{msg}</P> : null}

      <P muted style={{ fontSize: 12, textAlign: 'center' }}>
        O pagamento é feito pelo Google Play, que mostra o preço final antes de confirmar. As funções grátis da Ponte continuam grátis.
      </P>
    </Screen>
  );
}
