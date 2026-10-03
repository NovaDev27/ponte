import React from 'react';
import { Text, View } from 'react-native';
import { Card, H, Label, P, Screen } from '../components/ui';
import { C } from '../lib/theme';

const STEPS = [
  ['Compre USDC', 'Numa exchange brasileira autorizada, pagando com Pix. USDC é uma stablecoin: cada unidade vale cerca de 1 dólar.'],
  ['Escolha a rede', 'Confira em quais redes (ex.: Polygon, Base, Solana) a exchange de destino aceita depósito de USDC. Use exatamente a mesma.'],
  ['Envie um teste', 'Mande primeiro um valor pequeno. Só depois que ele chegar, envie o resto.'],
  ['Venda no destino', 'Na exchange do país de destino, troque USDC pela moeda local.'],
  ['Saque', 'Transfira para sua conta bancária local.'],
];

const RISKS = [
  ['Rede ou endereço errado', 'Transferências em cripto não têm estorno. Um erro de digitação pode significar perder tudo.'],
  ['Golpes', 'Ninguém legítimo pede sua senha, frase de recuperação ou código 2FA. Desconfie de "suporte" que te procura.'],
  ['Risco da exchange', 'Se a empresa tiver problemas, seu saldo pode ficar preso. Não deixe dinheiro parado lá.'],
  ['Risco do emissor', 'A stablecoin depende das reservas de quem a emite. É rara, mas pode perder a paridade com o dólar.'],
  ['Regras e impostos', 'As regras de cripto e de IOF mudam. Guarde comprovantes e confira a legislação atual.'],
];

export default function GuiaCripto() {
  return (
    <Screen header>
      <Card tone="accent">
        <H>Isto é um meio de transferência, não um investimento</H>
        <P>A Ponte explica como stablecoins podem baratear o envio de dinheiro. Não é recomendação para comprar ou guardar criptomoedas.</P>
      </Card>

      <Label>Como funciona</Label>
      {STEPS.map(([t, d], i) => (
        <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <H>{t}</H>
            <P muted>{d}</P>
          </View>
        </View>
      ))}

      <Card>
        <H>Quando costuma compensar</H>
        <P>Para valores médios e altos, quando o destino tem exchanges com boa liquidez. Para valores pequenos, a taxa da rede e as taxas de saque pesam mais, e a conta global pode sair mais barata.</P>
        <P muted>Compare sempre na aba Quanto chega.</P>
      </Card>

      <Label>Riscos</Label>
      {RISKS.map(([t, d]) => (
        <Card key={t}>
          <H>{t}</H>
          <P muted>{d}</P>
        </Card>
      ))}

      <Card tone="good">
        <H>Checklist de segurança</H>
        {[
          'Ativar autenticação em dois fatores (app, não SMS)',
          'Copiar e colar o endereço e conferir o início e o fim',
          'Mandar um teste pequeno antes',
          'Nunca compartilhar a frase de recuperação',
          'Usar só exchanges reguladas',
        ].map((t) => <P key={t}>✓  {t}</P>)}
      </Card>
    </Screen>
  );
}
