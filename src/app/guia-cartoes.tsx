import React, { useState } from 'react';
import { View } from 'react-native';
import { Badge, Card, Chip, H, IconBox, IconName, Label, P, Screen, Txt } from '../components/ui';
import { getCountry } from '../data/countries';
import { quote } from '../data/methods';
import { brl, num } from '../lib/format';
import { rateOf, useApp } from '../lib/store';
import { C, F } from '../lib/theme';

type CardType = {
  icon: IconName;
  name: string;
  what: string;
  cost: string;
  how: string[];
  good: string;
  watch: string;
};

const SPEND = [500, 1000, 2000];

export default function GuiaCartoes() {
  const { state, rates } = useApp();
  const f = state.fees;
  const country = getCountry(state.profile.country);
  const rate = rateOf(rates, country.currency);
  const usd = rateOf(rates, 'USD');
  const [spend, setSpend] = useState(1000);

  // Quanto se perde por mês gastando `spend` reais em cada tipo de cartão.
  const bank = quote('cartao', spend, rate, usd, f, true);
  const global = quote('global', spend, rate, usd, f, true);

  const TYPES: CardType[] = [
    {
      icon: 'credit-card',
      name: 'Cartão do seu banco brasileiro',
      what: 'O cartão de crédito ou débito que você já usa aqui, com função internacional.',
      cost: `IOF de ${num(f.iofCartao, 1)}% em cada compra, mais a margem do banco na cotação (cerca de ${num(f.spreadCartao, 0)}%).`,
      how: ['Confirme no app do banco que a função internacional está ativa.', 'Veja qual cotação o banco usa: do dia da compra ou do fechamento da fatura.'],
      good: 'Reserva para emergência, aluguel de carro e hotel que pedem cartão de crédito.',
      watch: 'É o mais caro para o dia a dia. A fatura chega em reais e a cotação pode mudar até o pagamento.',
    },
    {
      icon: 'globe',
      name: 'Cartão de conta global',
      what: 'Cartão de débito de uma conta em moeda estrangeira que você abre pelo celular, ainda no Brasil.',
      cost: `Você paga IOF de ${num(f.iofPropria, 1)}% ao mandar dinheiro para a conta no seu nome, mais uma margem pequena (cerca de ${num(f.spreadGlobal, 1)}%). Na hora da compra, o dinheiro já está na moeda de lá.`,
      how: ['Abra a conta pelo app, com documento e selfie.', 'Peça o cartão físico com antecedência: a entrega pode levar semanas.', 'Converta aos poucos para não depender da cotação de um dia só.'],
      good: 'Compras e saques do dia a dia nas primeiras semanas, antes de abrir conta lá.',
      watch: 'Confira o limite de saques grátis por mês e a tarifa depois dele.',
    },
    {
      icon: 'package',
      name: 'Cartão pré-pago de viagem',
      what: 'Cartão que você carrega com moeda estrangeira antes de viajar, vendido por casas de câmbio e bancos.',
      cost: `IOF de ${num(f.iofCartao, 1)}% na recarga, igual ao cartão de crédito, mais a cotação da empresa, normalmente pior que a comercial.`,
      how: ['Compare a cotação de recarga em mais de uma empresa.', 'Pergunte as tarifas de saque, de recarga e de cartão parado.'],
      good: 'Quem quer travar a cotação antes de embarcar e não quer abrir conta digital.',
      watch: 'Costuma sair mais caro que a conta global. Sobrou saldo? A volta para reais tem custo.',
    },
    {
      icon: 'home',
      name: `Cartão de débito de um banco de lá (${country.name})`,
      what: 'Conta e cartão abertos no país de destino, depois que você chega.',
      cost: `Nas compras, nada de IOF: o dinheiro já está em ${country.currency}. O custo fica no envio do Brasil para essa conta, que é mais barato para conta no seu nome (IOF de ${num(f.iofPropria, 1)}%).`,
      how: ['Leve comprovante de endereço e de matrícula: os bancos costumam pedir.', 'Veja no checklist da Ponte o que tirar na primeira semana.'],
      good: 'Quem vai ficar meses: receber salário de trabalho, pagar aluguel e contas.',
      watch: 'Abrir a conta pode levar algumas semanas. Até lá, use a conta global.',
    },
  ];

  return (
    <Screen header>
      <P muted>Não existe cartão sem custo nenhum: o IOF é imposto e sempre tem conversão de moeda. Mas a diferença entre eles é grande.</P>

      <Card tone="night">
        <Txt w="mono" size={11} color={C.creamSub} style={{ letterSpacing: 1.2 }}>GASTANDO POR MÊS NO CARTÃO</Txt>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {SPEND.map((v) => (
            <Chip key={v} label={brl(v, 0)} active={spend === v} color={F.cambio.color} onPress={() => setSpend(v)} />
          ))}
        </View>
        <View style={{ gap: 6, marginTop: 4 }}>
          <Line label="Cartão do banco brasileiro" value={`−${brl(bank.lostBRL)}`} />
          <Line label="Cartão de conta global" value={`−${brl(global.lostBRL)}`} />
        </View>
        <Txt w="display" size={16} color={'#FFFFFF'} style={{ marginTop: 4 }}>
          Diferença: {brl(bank.lostBRL - global.lostBRL)} por mês · {brl((bank.lostBRL - global.lostBRL) * state.profile.months, 0)} em {state.profile.months} meses
        </Txt>
      </Card>

      {TYPES.map((t) => (
        <Card key={t.name}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconBox name={t.icon} color={F.cambio.color} soft={F.cambio.soft} />
            <View style={{ flex: 1 }}>
              <H>{t.name}</H>
            </View>
          </View>
          <P>{t.what}</P>
          <Label>Quanto custa</Label>
          <P muted>{t.cost}</P>
          <Label>Como conseguir</Label>
          {t.how.map((h) => (
            <P key={h} muted>• {h}</P>
          ))}
          <View style={{ gap: 6, marginTop: 2 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Badge label="BOM PARA" color={C.good} soft={C.goodSoft} />
              <P style={{ flex: 1, fontSize: 14 }}>{t.good}</P>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Badge label="ATENÇÃO" color={C.warn} soft={C.warnSoft} />
              <P style={{ flex: 1, fontSize: 14 }}>{t.watch}</P>
            </View>
          </View>
        </Card>
      ))}

      <Card tone="good">
        <H>Dicas que valem para todos</H>
        {[
          'Na maquininha ou no caixa eletrônico, se perguntarem "pagar em reais ou na moeda local?", escolha sempre a moeda local. Em reais, a cotação da loja costuma ser bem pior.',
          'Leve pelo menos 2 cartões de bandeiras diferentes, guardados em lugares separados.',
          'Saque valores maiores de uma vez: muitos caixas cobram tarifa fixa por saque.',
          'Ative as notificações de compra no app de cada cartão.',
        ].map((d) => (
          <P key={d}>• {d}</P>
        ))}
      </Card>

      <P muted style={{ fontSize: 12 }}>Taxas de referência (IOF conforme as regras de 2025), as mesmas da aba Câmbio. Confira sempre as condições do seu banco ou da empresa antes de pedir o cartão.</P>
    </Screen>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt size={14} color={C.creamSub}>{label}</Txt>
      <Txt w="bold" size={14} color={'#FFFFFF'} style={{ fontVariant: ['tabular-nums'] }}>{value}</Txt>
    </View>
  );
}
