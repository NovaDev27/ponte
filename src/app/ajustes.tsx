import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Btn, Card, Field, H, Label, P, Screen } from '../components/ui';
import { DEFAULT_FEES, FEE_FIELDS, Fees } from '../data/methods';
import { num, parseNum } from '../lib/format';
import { useApp } from '../lib/store';
import { C } from '../lib/theme';

export default function Ajustes() {
  const { state, update, reset, rates, refreshRates } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [url, setUrl] = useState(state.serverUrl);
  const [version, setVersion] = useState(0);

  const setFee = (k: keyof Fees, t: string) => update({ fees: { ...state.fees, [k]: parseNum(t) } });

  return (
    <Screen header>
      <Card>
        <H>Destino</H>
        <P muted>Troque o país, a cidade, a data ou a duração.</P>
        <Btn label="Mudar destino" kind="ghost" icon="map-pin" onPress={() => router.push('/onboarding')} />
      </Card>

      <Card>
        <H>Cotações</H>
        <P muted>
          {rates.updated ? `Última atualização: ${new Date(rates.updated).toLocaleString('pt-BR')}` : 'Usando cotações de reserva.'}
        </P>
        <Btn label="Atualizar agora" kind="ghost" icon="refresh-cw" onPress={refreshRates} />
      </Card>

      <Card>
        <H>Taxas usadas nos cálculos</H>
        <P muted style={{ fontSize: 13 }}>Valores de referência (IOF conforme as regras de 2025). Se o seu banco ou a lei mudar, ajuste aqui.</P>
        {FEE_FIELDS.map((f) => (
          <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ flex: 1, color: C.ink, fontSize: 14 }}>{f.label}</Text>
            <View style={{ width: 120 }}>
              <FeeField key={`${f.key}-${version}`} initial={num(state.fees[f.key], f.unit === 'R$' ? 0 : 2)} prefix={f.unit} onCommit={(t) => setFee(f.key, t)} />
            </View>
          </View>
        ))}
        <Btn label="Voltar às taxas padrão" kind="ghost" onPress={() => { update({ fees: DEFAULT_FEES }); setVersion((v) => v + 1); }} />
      </Card>

      <Card>
        <H>Servidor do assistente</H>
        <P muted style={{ fontSize: 13 }}>
          Endereço do servidor que conversa com a IA. No celular, use o IP do computador na mesma rede Wi-Fi (ex.: http://192.168.0.10:8787).
        </P>
        <Field value={url} onChangeText={setUrl} keyboard="url" placeholder="http://..." />
        <Btn label="Salvar endereço" kind="ghost" onPress={() => update({ serverUrl: url.trim() })} />
      </Card>

      <Card>
        <Label>Zona de perigo</Label>
        {confirm ? (
          <>
            <P>Isso apaga destino, orçamento e checklist deste aparelho. Continuar?</P>
            <Btn label="Sim, apagar tudo" kind="accent" onPress={() => { reset(); router.replace('/onboarding'); }} />
            <Btn label="Cancelar" kind="ghost" onPress={() => setConfirm(false)} />
          </>
        ) : (
          <Btn label="Apagar meus dados" kind="ghost" icon="trash-2" onPress={() => setConfirm(true)} />
        )}
      </Card>

      <P muted style={{ fontSize: 12, textAlign: 'center' }}>
        Ponte é uma ferramenta de planejamento e comparação. Não movimenta dinheiro e não faz recomendação de investimento.
      </P>
    </Screen>
  );
}

function FeeField({ initial, prefix, onCommit }: { initial: string; prefix: string; onCommit: (t: string) => void }) {
  const [text, setText] = useState(initial);
  return <Field value={text} prefix={prefix} onChangeText={(t) => { setText(t); onCommit(t); }} />;
}
