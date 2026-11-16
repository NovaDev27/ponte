import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Logo } from '../components/Logo';
import { Badge, Btn, Card, Hero, IconBox, P, Screen, Txt } from '../components/ui';
import { billingAvailable, buyCompleto, completoPrice, listenPurchases, ownsCompleto, STORE_ACCOUNT, STORE_ART, STORE_NAME, STORE_SWITCH } from '../lib/billing';
import { COMPLETO_BENEFITS, COMPLETO_GRATIS, hasCompleto } from '../lib/completo';
import { useApp } from '../lib/store';
import { C, FONT } from '../lib/theme';

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
      const r = await buyCompleto();
      if (r === 'off') {
        setBusy(false);
        setMsg(`A compra só funciona no app instalado pel${STORE_ART} ${STORE_NAME}.`);
      } else if (r === 'cancelled') {
        setBusy(false);
      }
    } catch {
      setBusy(false);
      setMsg('Não foi possível abrir o pagamento agora.');
    }
  }

  async function restore() {
    setMsg('');
    setBusy(true);
    const owned = await ownsCompleto(true);
    setBusy(false);
    if (owned) {
      update({ premium: true, premiumMissAt: null });
      setMsg('Compra recuperada! O Ponte Completo está liberado.');
    } else if (owned === null) {
      setMsg(`Não consegui falar com ${STORE_ART} ${STORE_NAME} agora. Confira a internet e tente de novo.`);
    } else {
      setMsg(`Não encontramos uma compra nesta ${STORE_ACCOUNT}. Se você comprou com outra conta, ${STORE_SWITCH} e tente de novo.`);
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
        <Txt w="heavy" size={28} color={'#FFFFFF'} style={{ lineHeight: 32 }}>Seu intercâmbio planejado do começo ao fim</Txt>
        <Txt size={15} color={C.creamSub}>
          {COMPLETO_GRATIS && !state.premium ? 'Liberado grátis durante o teste' : 'Pagamento único. Sem mensalidade.'}
        </Txt>
      </Hero>

      {COMPLETO_BENEFITS.map((b) => (
        <Card key={b.title} style={{ flexDirection: 'row', gap: 12 }}>
          <IconBox name={b.icon} color={C.accent} soft={C.accentSoft} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt w="display" size={16} color={C.ink}>{b.title}</Txt>
            <P muted style={{ fontSize: 14 }}>{b.text}</P>
          </View>
        </Card>
      ))}

      {state.premium ? (
        <Card tone="good" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Feather name="check-circle" size={22} color={C.good} />
          <P style={{ flex: 1, fontFamily: FONT.bold }}>Você tem o Ponte Completo. Obrigado!</P>
        </Card>
      ) : unlocked ? (
        <Card tone="good">
          <P style={{ fontFamily: FONT.bold }}>Durante o teste, tudo isso está liberado para você.</P>
          <P muted style={{ fontSize: 14 }}>Use à vontade e conte em “Dê sua opinião” o que valeria a pena pagar.</P>
        </Card>
      ) : store === 'loading' ? (
        <ActivityIndicator color={C.ink} />
      ) : store === 'ok' ? (
        <>
          <Btn label={busy ? `Abrindo ${STORE_ART} ${STORE_NAME}...` : `Liberar por ${price ?? '...'}`} kind="accent" icon="star" onPress={buy} disabled={busy || !price} />
          <Btn label="Já comprei: recuperar compra" kind="ghost" onPress={restore} disabled={busy} />
        </>
      ) : (
        <Card>
          <P muted>A compra fica disponível no app instalado {`pel${STORE_ART} ${STORE_NAME}`}.</P>
        </Card>
      )}

      {msg ? <P style={{ textAlign: 'center', fontFamily: FONT.bold }}>{msg}</P> : null}

      <P muted style={{ fontSize: 12, textAlign: 'center' }}>
        O pagamento é feito {`pel${STORE_ART} ${STORE_NAME}`}, que mostra o preço final antes de confirmar. As funções grátis da Ponte continuam grátis.
      </P>
    </Screen>
  );
}
