import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { CompletoLock } from '../components/CompletoLock';
import { Btn, Card, Chip, ChipRow, Field, H, Hero, Label, P, Screen } from '../components/ui';
import { CURRENCIES, getCountry } from '../data/countries';
import { alertFired, priceOf } from '../lib/alerts';
import { hasCompleto } from '../lib/completo';
import { brl, num, parseNum } from '../lib/format';
import { ensurePermission, notifySupported } from '../lib/notify';
import { useApp } from '../lib/store';
import { C, F } from '../lib/theme';

const DROPS = [1, 2, 3, 5]; // % abaixo da cotação de hoje

export default function Alerta() {
  const { state, rates, update } = useApp();
  const active = state.rateAlert;
  const [cur, setCur] = useState(active?.cur ?? getCountry(state.profile.country).currency);
  const now = priceOf(rates, cur);
  // null = sugestão automática (2% abaixo de hoje), que acompanha a cotação ao vivo até a pessoa digitar.
  const [typed, setText] = useState<string | null>(active ? num(active.target, 2) : null);
  const text = typed ?? (now ? num(now * 0.98, 2) : '');
  const [fired, setFired] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    alertFired(active).then((f) => {
      if (alive) setFired(f);
    });
    return () => {
      alive = false;
    };
  }, [active]);

  if (!hasCompleto(state)) {
    return (
      <Screen header>
        <CompletoLock title="Alerta de cotação" text="Escolha um valor e receba um aviso no celular quando a moeda do seu destino ficar mais barata." />
      </Screen>
    );
  }

  const target = parseNum(text);

  function pickCur(c: string) {
    setCur(c);
    setText(null);
  }

  async function save() {
    setMsg('');
    if (!(target > 0)) return setMsg('Digite um valor maior que zero.');
    const allowed = await ensurePermission();
    update({ rateAlert: { cur, target, createdAt: Date.now() } });
    setMsg(
      allowed
        ? 'Alerta criado! Você recebe um aviso quando a cotação chegar lá.'
        : notifySupported
          ? 'Alerta criado, mas as notificações estão desligadas. Ative nas configurações do celular para receber o aviso.'
          : 'Alerta criado. Os avisos aparecem no app de celular.',
    );
  }

  return (
    <Screen header>
      <P muted>A Ponte confere a cotação de tempos em tempos e te avisa uma vez quando ela chegar no valor escolhido. Não é previsão: ninguém sabe se a moeda vai cair.</P>

      {active ? (
        <Hero colors={fired ? ['#145C3D', '#1F8A5B'] : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name={fired ? 'check-circle' : 'bell'} size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13, letterSpacing: 0.6 }}>{fired ? 'ALERTA ATINGIDO' : 'ALERTA ATIVO'}</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800' }}>1 {active.cur} ≤ {brl(active.target)}</Text>
          <Text style={{ color: '#C8D6E5', fontSize: 14 }}>
            Hoje: {priceOf(rates, active.cur) ? brl(priceOf(rates, active.cur) as number) : '...'} {rates.live ? '' : '(sem internet)'}
          </Text>
        </Hero>
      ) : null}

      <Card>
        <Label>Moeda</Label>
        <ChipRow>
          {CURRENCIES.map((c) => <Chip key={c} label={c} active={c === cur} color={F.cambio.color} onPress={() => pickCur(c)} />)}
        </ChipRow>
        <Text style={{ color: C.sub, fontSize: 14 }}>Hoje: 1 {cur} = {now ? brl(now) : '...'}</Text>

        <Label style={{ marginTop: 6 }}>Me avise quando 1 {cur} custar até</Label>
        <Field value={text} onChangeText={setText} prefix="R$" big />
        {now ? (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {DROPS.map((d) => (
              <Chip key={d} label={`−${d}%`} active={Math.abs(target - now * (1 - d / 100)) < 0.005} color={F.cambio.color} onPress={() => setText(num(now * (1 - d / 100), 2))} />
            ))}
          </View>
        ) : null}
        <Btn label={active ? 'Atualizar alerta' : 'Criar alerta'} icon="bell" onPress={save} />
        {active ? <Btn label="Desligar alerta" kind="ghost" onPress={() => { update({ rateAlert: null }); setMsg('Alerta desligado.'); }} /> : null}
        {msg ? <P style={{ fontWeight: '700' }}>{msg}</P> : null}
      </Card>

      <Card tone="accent">
        <H>Dica: converta aos poucos</H>
        <P>Em vez de esperar o momento perfeito, muita gente converte uma parte por mês. Assim o preço médio fica mais estável.</P>
      </Card>

      <P muted style={{ fontSize: 12 }}>O celular decide quando a checagem em segundo plano roda (pode levar algumas horas). Abrindo o app, a conferência é na hora.</P>
    </Screen>
  );
}
