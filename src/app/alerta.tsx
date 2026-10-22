import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { CompletoLock } from '../components/CompletoLock';
import { Btn, Card, Chip, ChipRow, Field, H, Hero, Label, P, Screen, Txt } from '../components/ui';
import { CURRENCIES, getCountry } from '../data/countries';
import { alertFired, priceOf } from '../lib/alerts';
import { hasCompleto } from '../lib/completo';
import { brl, money, num, parseNum, quoteUnit } from '../lib/format';
import { ensurePermission, notifySupported } from '../lib/notify';
import { useApp } from '../lib/store';
import { C, F, FONT } from '../lib/theme';

const DROPS = [1, 2, 3, 5]; // % abaixo da cotação de hoje

export default function Alerta() {
  const { state, rates, update } = useApp();
  const active = state.rateAlert;
  const [cur, setCur] = useState(active?.cur ?? getCountry(state.profile.country).currency);
  const now = priceOf(rates, cur);
  // Moedas "pequenas" (iene, rand) são mostradas em 10 ou 100 unidades para o número fazer sentido.
  // O alerta continua guardado por 1 unidade; só a tela usa a unidade maior.
  const unit = now ? quoteUnit(now) : 1;
  const unitLabel = money(unit, cur, 0);
  // null = sugestão automática (2% abaixo de hoje), que acompanha a cotação ao vivo até a pessoa digitar.
  const [typed, setText] = useState<string | null>(active ? num(active.target * unit, 2) : null);
  const text = typed ?? (now ? num(now * unit * 0.98, 2) : '');
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

  const activeNow = active ? priceOf(rates, active.cur) : null;
  const activeUnit = activeNow ? quoteUnit(activeNow) : 1;
  const activeLabel = active ? money(activeUnit, active.cur, 0) : '';

  if (!hasCompleto(state)) {
    return (
      <Screen header>
        <CompletoLock title="Alerta de cotação" text="Escolha um valor e receba um aviso no celular quando a moeda do seu destino ficar mais barata." />
      </Screen>
    );
  }

  const target = parseNum(text) / unit;

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
        <Hero colors={fired ? [C.navy, C.navy2] : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name={fired ? 'check-circle' : 'bell'} size={18} color="#FFFFFF" />
            <Txt w="mono" size={11} color={'#FFFFFF'} style={{ letterSpacing: 1.2 }}>{fired ? 'ALERTA ATINGIDO' : 'ALERTA ATIVO'}</Txt>
          </View>
          <Txt w="heavy" size={28} color={'#FFFFFF'}>{activeLabel} ≤ {brl(active.target * activeUnit)}</Txt>
          <Txt size={14} color={C.creamSub}>
            Hoje: {activeNow ? brl(activeNow * activeUnit) : '...'} {rates.live ? '' : '(sem internet)'}
          </Txt>
        </Hero>
      ) : null}

      <Card>
        <Label>Moeda</Label>
        <ChipRow>
          {CURRENCIES.map((c) => <Chip key={c} label={c} active={c === cur} color={F.cambio.color} onPress={() => pickCur(c)} />)}
        </ChipRow>
        <Txt size={14} color={C.sub}>Hoje: {unitLabel} = {now ? brl(now * unit) : '...'}</Txt>

        <Label style={{ marginTop: 6 }}>Me avise quando {unitLabel} custar até</Label>
        <Field value={text} onChangeText={setText} prefix="R$" big />
        {now ? (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {DROPS.map((d) => (
              <Chip key={d} label={`−${d}%`} active={Math.abs((target - now * (1 - d / 100)) * unit) < 0.005} color={F.cambio.color} onPress={() => setText(num(now * unit * (1 - d / 100), 2))} />
            ))}
          </View>
        ) : null}
        <Btn label={active ? 'Atualizar alerta' : 'Criar alerta'} icon="bell" onPress={save} />
        {active ? <Btn label="Desligar alerta" kind="ghost" onPress={() => { update({ rateAlert: null }); setMsg('Alerta desligado.'); }} /> : null}
        {msg ? <P style={{ fontFamily: FONT.bold }}>{msg}</P> : null}
      </Card>

      <Card tone="accent">
        <H>Dica: converta aos poucos</H>
        <P>Em vez de esperar o momento perfeito, muita gente converte uma parte por mês. Assim o preço médio fica mais estável.</P>
      </Card>

      <P muted style={{ fontSize: 12 }}>O celular decide quando a checagem em segundo plano roda (pode levar algumas horas). Abrindo o app, a conferência é na hora.</P>
    </Screen>
  );
}
