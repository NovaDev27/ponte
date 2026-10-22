import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { CardArt } from '../components/CardArt';
import { Bar, Btn, Card, Chip, IconName, Label, P, Screen, Tap, Txt } from '../components/ui';
import { BANKS, bankOf } from '../data/banks';
import { getCountry } from '../data/countries';
import { quote } from '../data/methods';
import { brl, num } from '../lib/format';
import { success } from '../lib/motion';
import { type CardQuiz, rateOf, useApp } from '../lib/store';
import { C, R } from '../lib/theme';

const SPEND = [500, 1000, 2000];

export default function GuiaCartoes() {
  const { state, update } = useApp();
  const [editing, setEditing] = useState(!state.cardQuiz);
  if (editing || !state.cardQuiz) {
    return (
      <Quiz
        initial={state.cardQuiz}
        onDone={(q) => {
          success();
          update({ cardQuiz: q });
          setEditing(false);
        }}
      />
    );
  }
  return <Result quiz={state.cardQuiz} onRedo={() => setEditing(true)} />;
}

// ---------- Questionário: 3 perguntas rápidas, uma por tela ----------

const KINDS: { id: CardQuiz['kind']; label: string; hint: string; icon: IconName }[] = [
  { id: 'credito', label: 'Crédito', hint: 'Paga na fatura do mês', icon: 'credit-card' },
  { id: 'debito', label: 'Débito', hint: 'Sai direto da conta', icon: 'smartphone' },
  { id: 'ambos', label: 'Os dois', hint: 'Cartão múltiplo', icon: 'layers' },
];
const INTL: { id: CardQuiz['intl']; label: string; hint: string; icon: IconName }[] = [
  { id: 'sim', label: 'Sim, está ativa', hint: 'Já usei ou já liguei no app', icon: 'check-circle' },
  { id: 'nao', label: 'Não está', hint: 'Nunca usei fora do Brasil', icon: 'x-circle' },
  { id: 'naosei', label: 'Não sei', hint: 'Vou conferir depois', icon: 'help-circle' },
];

function Quiz({ initial, onDone }: { initial: CardQuiz | null; onDone: (q: CardQuiz) => void }) {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [bank, setBank] = useState(initial?.bank ?? '');
  const [kind, setKind] = useState<CardQuiz['kind'] | ''>(initial?.kind ?? '');
  const cell = (Math.min(width, 520) - 40 - 12) / 2;

  const next = (fn: () => void) => {
    fn();
    setTimeout(() => setStep((s) => s + 1), 260); // dá tempo de ver a escolha marcada
  };

  const titles = ['Qual banco você usa no Brasil?', 'Que tipo de cartão?', 'A função internacional está ativa?'];
  return (
    <Screen header footer={step > 0 ? <Btn label="Voltar" kind="ghost" icon="arrow-left" onPress={() => setStep(step - 1)} /> : undefined}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[0, 1, 2].map((i) => <View key={i} style={{ flex: 1 }}><Bar value={i <= step ? 1 : 0} color={C.navy} height={5} /></View>)}
      </View>
      <Animated.View key={step} entering={FadeInRight.duration(320)} style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>PERGUNTA {step + 1} DE 3</Txt>
          <Txt w="heavy" size={28} style={{ lineHeight: 32 }}>{titles[step]}</Txt>
          {step === 0 ? <Txt color={C.sub}>Assim a gente desenha o seu cartão e mostra quanto ele custa lá fora.</Txt> : null}
        </View>

        {step === 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
            {BANKS.map((b, i) => {
              const on = b.id === bank;
              return (
                <Animated.View key={b.id} entering={FadeInDown.duration(360).delay(i * 35)}>
                  <Tap onPress={() => next(() => setBank(b.id))} scaleTo={0.94} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={b.name}
                    style={{ borderRadius: 14, padding: 3, borderWidth: 2, borderColor: on ? C.navy : 'transparent' }}>
                    <CardArt colors={b.colors} fg={b.fg} title={b.name} width={cell - 10} number={String(1000 + i * 731).slice(-4)} />
                    {on ? (
                      <Animated.View entering={ZoomIn.springify().damping(12)} style={{ position: 'absolute', right: -6, top: -6, width: 26, height: 26, borderRadius: 13, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="check" size={14} color="#FFFFFF" />
                      </Animated.View>
                    ) : null}
                  </Tap>
                </Animated.View>
              );
            })}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 10 }}>
            {bank ? <View style={{ alignItems: 'center', marginBottom: 6 }}><CardArt colors={bankOf(bank).colors} fg={bankOf(bank).fg} title={bankOf(bank).name} tag={kind ? KINDS.find((k) => k.id === kind)?.label.toUpperCase() : undefined} width={Math.min(width - 80, 300)} /></View> : null}
            {KINDS.map((o) => <Option key={o.id} {...o} on={o.id === kind} onPress={() => next(() => setKind(o.id))} />)}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: 10 }}>
            {INTL.map((o) => (
              <Option key={o.id} {...o} on={initial?.intl === o.id} onPress={() => onDone({ bank: bank || 'outro', kind: kind || 'credito', intl: o.id })} />
            ))}
          </View>
        ) : null}
      </Animated.View>
    </Screen>
  );
}

function Option({ label, hint, icon, on, onPress }: { label: string; hint: string; icon: IconName; on: boolean; onPress: () => void }) {
  return (
    <Tap onPress={onPress} scaleTo={0.97} accessibilityRole="radio" accessibilityState={{ checked: on }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: R.md + 2, backgroundColor: on ? C.navy : C.card, borderWidth: 1, borderColor: on ? C.navy : C.line }}>
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: on ? 'rgba(255,255,255,0.12)' : C.sunk, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={19} color={on ? '#FFFFFF' : C.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="bold" size={16} color={on ? '#FFFFFF' : C.ink}>{label}</Txt>
        <Txt size={13} color={on ? C.navyLight : C.sub}>{hint}</Txt>
      </View>
      <Feather name="chevron-right" size={18} color={on ? '#FFFFFF' : C.faint} />
    </Tap>
  );
}

// ---------- Resultado: o cartão da pessoa, quanto custa e a "carteira" para a viagem ----------

type WalletId = 'global' | 'mine' | 'local' | 'prepaid';

function Result({ quiz, onRedo }: { quiz: CardQuiz; onRedo: () => void }) {
  const { state, rates } = useApp();
  const { width } = useWindowDimensions();
  const f = state.fees;
  const country = getCountry(state.profile.country);
  const rate = rateOf(rates, country.currency);
  const usd = rateOf(rates, 'USD');
  const [spend, setSpend] = useState(1000);
  const [open, setOpen] = useState<WalletId>('global');
  const bank = bankOf(quiz.bank);
  const big = Math.min(width - 40, 360);

  const mine = quote('cartao', spend, rate, usd, f, true);
  const global = quote('global', spend, rate, usd, f, true);
  const diff = Math.max(0, mine.lostBRL - global.lostBRL);
  const kindLabel = quiz.kind === 'credito' ? 'CRÉDITO' : quiz.kind === 'debito' ? 'DÉBITO' : 'MÚLTIPLO';

  const WALLET: { id: WalletId; role: string; colors: [string, string]; fg: string; title: string; tag: string; what: string; cost: string; how: string[]; good: string; watch: string }[] = [
    {
      id: 'global', role: 'Dia a dia', colors: [C.navy2, C.navy], fg: '#FFFFFF', title: 'Conta global', tag: country.currency,
      what: 'Cartão de débito de uma conta em moeda estrangeira, aberta pelo celular ainda no Brasil. Vários bancos e empresas oferecem.',
      cost: `IOF de ${num(f.iofPropria, 1)}% ao mandar dinheiro para a conta no seu nome, mais uma margem pequena (cerca de ${num(f.spreadGlobal, 1)}%). Na compra, o dinheiro já está em ${country.currency}.`,
      how: ['Veja se o seu banco já tem conta global; se não, compare empresas autorizadas.', 'Peça o cartão físico com antecedência: a entrega pode levar semanas.', 'Converta aos poucos para não depender da cotação de um dia só.'],
      good: 'Compras e saques do dia a dia, principalmente nas primeiras semanas.',
      watch: 'Confira o limite de saques grátis por mês e a tarifa depois dele.',
    },
    {
      id: 'mine', role: 'Reserva e emergência', colors: bank.colors, fg: bank.fg, title: bank.name, tag: kindLabel,
      what: `O cartão do ${bank.name} que você já usa, com função internacional.`,
      cost: `IOF de ${num(f.iofCartao, 1)}% em cada compra, mais a margem do banco na cotação (cerca de ${num(f.spreadCartao, 0)}%).`,
      how: ['Confirme no app do banco que a função internacional está ativa.', 'Veja qual cotação o banco usa: a do dia da compra ou a do fechamento da fatura.'],
      good: 'Emergências, aluguel de carro e hotel que pedem cartão de crédito.',
      watch: 'É o mais caro para o dia a dia. Use como reserva.',
    },
    {
      id: 'local', role: 'Depois que chegar', colors: [C.ink2, C.ink], fg: '#FFFFFF', title: `Banco local`, tag: country.name.toUpperCase(),
      what: `Conta e cartão abertos em ${country.name}, depois que você chega.`,
      cost: `Sem IOF nas compras: o dinheiro já está em ${country.currency}. O custo fica no envio do Brasil para essa conta (${num(f.iofPropria, 1)}% de IOF se a conta for sua).`,
      how: ['Leve comprovante de endereço e de matrícula: os bancos costumam pedir.', 'Veja no checklist o que resolver na primeira semana.'],
      good: 'Quem fica meses: salário, aluguel e contas.',
      watch: 'Abrir a conta pode levar semanas. Até lá, use a conta global.',
    },
    {
      id: 'prepaid', role: 'Alternativa', colors: ['#8C9097', '#5E6269'], fg: '#FFFFFF', title: 'Pré-pago de viagem', tag: 'RECARGA',
      what: 'Cartão que você carrega com moeda estrangeira antes de viajar, vendido por casas de câmbio e bancos.',
      cost: `IOF de ${num(f.iofCartao, 1)}% na recarga, mais a cotação da empresa, normalmente pior que a comercial.`,
      how: ['Compare a cotação de recarga em mais de uma empresa.', 'Pergunte as tarifas de saque, de recarga e de cartão parado.'],
      good: 'Quem quer travar a cotação antes e não quer abrir conta digital.',
      watch: 'Costuma sair mais caro que a conta global, e o saldo que sobrar tem custo para voltar.',
    },
  ];

  const peek = 58; // quanto aparece de cada cartão empilhado
  const h = big / 1.586;

  return (
    <Screen header>
      <View style={{ gap: 4 }}>
        <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>SEU CARTÃO HOJE</Txt>
        <Txt w="heavy" size={26} style={{ lineHeight: 30 }}>{bank.name} · {kindLabel.toLowerCase()}</Txt>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <CardArt colors={bank.colors} fg={bank.fg} title={bank.name} tag={kindLabel} width={big}
          back={`Lá fora: IOF de ${num(f.iofCartao, 1)}% + cerca de ${num(f.spreadCartao, 0)}% de margem em cada compra`} />
        <Txt w="mono" size={11} color={C.faint} style={{ letterSpacing: 0.8 }}>TOQUE NO CARTÃO PARA VIRAR</Txt>
      </View>

      {quiz.intl !== 'sim' ? (
        <Card tone="sunk" style={{ flexDirection: 'row', gap: 12 }}>
          <Feather name="alert-circle" size={20} color={C.navy} style={{ marginTop: 1 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt w="bold">{quiz.intl === 'nao' ? 'Ative a função internacional antes de viajar' : 'Confira a função internacional'}</Txt>
            <Txt size={14} color={C.sub}>No app do {bank.name}, procure por “cartão” e “uso no exterior”. Sem isso, as compras lá fora são recusadas.</Txt>
          </View>
        </Card>
      ) : null}
      {quiz.kind === 'debito' ? (
        <Card tone="sunk" style={{ flexDirection: 'row', gap: 12 }}>
          <Feather name="info" size={20} color={C.navy} style={{ marginTop: 1 }} />
          <Txt size={14} color={C.sub} style={{ flex: 1 }}>Nem todo cartão de débito brasileiro funciona fora do país. Pergunte ao banco antes, e leve outro cartão de reserva.</Txt>
        </Card>
      ) : null}

      <Card tone="night" style={{ gap: 14 }}>
        <Txt w="mono" size={11} color={C.creamSub} style={{ letterSpacing: 1.2 }}>GASTANDO POR MÊS NO CARTÃO</Txt>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SPEND.map((v) => <Chip key={v} label={brl(v, 0)} active={spend === v} color={C.navy} onPress={() => setSpend(v)} />)}
        </View>
        <Compare label={`${bank.name}`} value={mine.lostBRL} max={mine.lostBRL} color={C.creamSub} />
        <Compare label="Conta global" value={global.lostBRL} max={mine.lostBRL} color={C.navyLight} />
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12, gap: 2 }}>
          <Txt size={14} color={C.creamSub}>Usando a conta global no dia a dia, você deixa de perder</Txt>
          <Txt w="heavy" size={30} color={C.cream}>{brl(diff * state.profile.months, 0)}</Txt>
          <Txt size={13} color={C.creamSub}>em {state.profile.months} meses ({brl(diff)} por mês)</Txt>
        </View>
      </Card>

      <View style={{ gap: 2, marginTop: 6 }}>
        <Txt w="display" size={21}>Sua carteira para a viagem</Txt>
        <Txt size={14} color={C.sub}>Toque em um cartão para ver detalhes</Txt>
      </View>
      <View style={{ alignItems: 'center' }}>
        {WALLET.map((w, i) => {
          const on = open === w.id;
          const prevOpen = i > 0 && open === WALLET[i - 1].id;
          return (
            <Animated.View key={w.id} layout={LinearTransition.springify().damping(18).stiffness(160)} style={{ marginTop: i === 0 ? 0 : prevOpen ? 14 : -(h - peek), width: big }}>
              <Tap onPress={() => setOpen(w.id)} scaleTo={0.98} accessibilityRole="button" accessibilityState={{ expanded: on }} accessibilityLabel={`${w.title}: ${w.role}`}>
                <CardArt colors={w.colors} fg={w.fg} title={w.title} tag={w.role.toUpperCase()} width={big} number={w.id === 'mine' ? '4821' : w.id === 'global' ? '7710' : w.id === 'local' ? '3056' : '9902'} />
              </Tap>
              {on ? (
                <Animated.View entering={FadeIn.duration(300)} style={{ paddingTop: 14, gap: 8 }}>
                  <P>{w.what}</P>
                  <Label>Quanto custa</Label>
                  <P muted>{w.cost}</P>
                  <Label>Como conseguir</Label>
                  {w.how.map((x) => (
                    <View key={x} style={{ flexDirection: 'row', gap: 8 }}>
                      <Txt color={C.navy}>•</Txt>
                      <P muted style={{ flex: 1 }}>{x}</P>
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <Card tone="sunk" style={{ flex: 1, padding: 12, gap: 4 }}>
                      <Txt w="mono" size={10} color={C.navy} style={{ letterSpacing: 1 }}>BOM PARA</Txt>
                      <Txt size={13}>{w.good}</Txt>
                    </Card>
                    <Card tone="sunk" style={{ flex: 1, padding: 12, gap: 4 }}>
                      <Txt w="mono" size={10} color={C.ink} style={{ letterSpacing: 1 }}>ATENÇÃO</Txt>
                      <Txt size={13}>{w.watch}</Txt>
                    </Card>
                  </View>
                </Animated.View>
              ) : null}
            </Animated.View>
          );
        })}
      </View>

      <Card style={{ marginTop: 6 }}>
        <Txt w="display" size={17}>Dicas que valem para todos</Txt>
        {[
          'Na maquininha ou no caixa eletrônico, se perguntarem "pagar em reais ou na moeda local?", escolha a moeda local.',
          'Leve pelo menos 2 cartões de bandeiras diferentes, guardados em lugares separados.',
          'Saque valores maiores de uma vez: muitos caixas cobram tarifa fixa por saque.',
          'Ative as notificações de compra no app de cada cartão.',
        ].map((d, i) => (
          <View key={d} style={{ flexDirection: 'row', gap: 10 }}>
            <Txt w="mono" size={12} color={C.navy} style={{ marginTop: 3 }}>0{i + 1}</Txt>
            <P style={{ flex: 1 }}>{d}</P>
          </View>
        ))}
      </Card>

      <Btn label="Refazer o questionário" kind="ghost" icon="rotate-ccw" onPress={onRedo} />
      <P muted style={{ fontSize: 12 }}>Taxas de referência (IOF conforme as regras de 2025), as mesmas da aba Câmbio. Confira sempre as condições do seu banco ou da empresa antes de pedir o cartão.</P>
    </Screen>
  );
}

function Compare({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt size={14} color={C.cream}>{label}</Txt>
        <Txt w="bold" size={14} color={C.cream} style={{ fontVariant: ['tabular-nums'] }}>− {brl(value)}</Txt>
      </View>
      <Bar value={Math.max(0.03, value / Math.max(1, max))} color={color} height={8} track="rgba(255,255,255,0.08)" />
    </View>
  );
}
