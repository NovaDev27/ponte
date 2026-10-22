import Feather from '@expo/vector-icons/Feather';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import { PlanButton } from '../../components/PlanButton';
import { Badge, Card, Hero, P, Ring, Screen, Segment, Tap, Txt } from '../../components/ui';
import { phaseDue, phasesFor, type Task } from '../../data/checklist';
import { getCountry } from '../../data/countries';
import { hasCompleto } from '../../lib/completo';
import { dateLabel } from '../../lib/format';
import { bump, success, tap } from '../../lib/motion';
import { ensurePermission } from '../../lib/notify';
import { useApp } from '../../lib/store';
import { C, F } from '../../lib/theme';

const COLOR = F.checklist.color;

export default function Checklist() {
  const { state, toggle, update } = useApp();
  const completo = hasCompleto(state);
  const [today] = useState(() => Date.now());

  async function setReminders(on: boolean) {
    if (on) await ensurePermission();
    update({ reminders: on });
  }
  const country = getCountry(state.profile.country);
  const phases = phasesFor(country);
  const all = phases.flatMap((p) => p.tasks);
  const done = all.filter((t) => state.done[t.id]).length;
  const next = all.find((t) => !state.done[t.id]);
  const currentPhase = phases.find((ph) => ph.tasks.some((t) => !state.done[t.id]))?.id;

  return (
    <Screen title="Checklist" eyebrow="Passo 3 · Checklist" eyebrowColor={COLOR} subtitle={`Do planejamento à primeira semana em ${country.name}`}>
      <Hero style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <Ring value={done / all.length} size={92} stroke={9} color={C.navyLight} track="rgba(244,242,238,0.12)">
          <Txt w="heavy" size={22} color={C.cream}>{Math.round((done / all.length) * 100)}%</Txt>
        </Ring>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt w="mono" size={11} color={C.creamSub} style={{ letterSpacing: 1.3 }}>PASSAPORTE DE CARIMBOS</Txt>
          <Txt w="display" size={21} color={C.cream}>{done === all.length ? 'Tudo carimbado!' : `${done} de ${all.length} carimbos`}</Txt>
          <Txt size={13} color={C.creamSub} numberOfLines={2}>{next ? `Próximo: ${next.text}` : 'Boa viagem! ✈️'}</Txt>
        </View>
      </Hero>

      <Card>
        <Txt w="display" size={17}>Prazos e lembretes</Txt>
        {completo ? (
          <>
            <P muted style={{ fontSize: 14 }}>As datas saem do seu embarque. Receba um aviso 7 dias antes de cada prazo.</P>
            <Segment
              options={[{ value: true, label: 'Lembretes ligados' }, { value: false, label: 'Desligados' }]}
              value={state.reminders}
              onChange={setReminders}
              color={COLOR}
            />
          </>
        ) : (
          <P muted style={{ fontSize: 14 }}>Com o Ponte Completo, cada etapa ganha uma data e você recebe lembretes antes dos prazos.</P>
        )}
        <PlanButton color={COLOR} />
      </Card>

      {phases.map((ph, pi) => {
        const n = ph.tasks.filter((t) => state.done[t.id]).length;
        const complete = n === ph.tasks.length;
        const current = ph.id === currentPhase;
        const due = completo ? phaseDue(ph.id, state.profile.tripMonth) : null;
        const late = !!due && !complete && due.getTime() < today;
        return (
          <View key={ph.id} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 30 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: complete ? C.good : current ? COLOR : C.sunk, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                {complete ? <Feather name="check" size={16} color="#FFFFFF" /> : <Txt w="bold" size={13} color={current ? '#FFFFFF' : C.sub} style={{ lineHeight: 16 }}>{pi + 1}</Txt>}
              </View>
              {pi < phases.length - 1 ? <View style={{ width: 2, flex: 1, borderRadius: 1, backgroundColor: complete ? C.good : C.line, marginTop: 4 }} /> : null}
            </View>
            <View style={{ flex: 1, gap: 10, paddingBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt w="mono" size={11} color={current ? COLOR : C.sub} style={{ letterSpacing: 1.1 }}>{ph.when.toUpperCase()}</Txt>
                  <Txt w="display" size={19}>{ph.title}</Txt>
                  {due ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Txt w="medium" size={13} color={late ? C.alert : C.sub}>até {dateLabel(due)}</Txt>
                      {late ? <Badge label="ATRASADO" color={C.alert} soft={C.alertSoft} /> : null}
                    </View>
                  ) : null}
                </View>
                {complete ? (
                  <Animated.View entering={ZoomIn.springify().damping(9).stiffness(220)} style={{ marginTop: 6 }}>
                    <View style={{ transform: [{ rotate: '-8deg' }], borderWidth: 2, borderColor: C.good, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Txt w="mono" size={11} color={C.good} style={{ letterSpacing: 1.2 }}>CARIMBADO</Txt>
                    </View>
                  </Animated.View>
                ) : (
                  <Txt w="mono" size={12} color={C.sub} style={{ marginTop: 4 }}>{n}/{ph.tasks.length}</Txt>
                )}
              </View>
              <Card style={{ paddingVertical: 2, gap: 0 }}>
                {ph.tasks.map((t, i) => (
                  <TaskRow
                    key={t.id}
                    t={t}
                    first={i === 0}
                    ok={!!state.done[t.id]}
                    onToggle={(ok) => {
                      if (ok) tap();
                      else if (n === ph.tasks.length - 1) success(); // carimbou a última da fase
                      else bump();
                      toggle(t.id);
                    }}
                  />
                ))}
              </Card>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

// Tarefa com "carimbo": ao marcar, o selo cai girando e deixa uma marquinha de tinta.
function TaskRow({ t, ok, first, onToggle }: { t: Task; ok: boolean; first: boolean; onToggle: (ok: boolean) => void }) {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const rot = useSharedValue(ok ? -8 : 0);
  const ink = useSharedValue(0);
  const was = useRef(ok);

  useEffect(() => {
    if (ok && !was.current && !reduce) {
      scale.set(1.9);
      scale.set(withSpring(1, { damping: 10, stiffness: 260 }));
      rot.set(-30);
      rot.set(withSpring(-8, { damping: 10, stiffness: 200 }));
      ink.set(0);
      ink.set(withTiming(1, { duration: 520 }));
    }
    if (!ok) rot.set(0);
    was.current = ok;
  }, [ok, reduce, scale, rot, ink]);

  const stamp = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }, { rotate: `${rot.get()}deg` }] }));
  const splash = useAnimatedStyle(() => ({ opacity: ink.get() > 0 && ink.get() < 1 ? 0.35 * (1 - ink.get()) : 0, transform: [{ scale: 1 + ink.get() * 1.4 }] }));

  return (
    <Tap
      onPress={() => onToggle(ok)}
      haptic={false}
      scaleTo={0.98}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: ok }}
      style={{ flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 13, borderTopWidth: first ? 0 : 1, borderTopColor: C.line }}
    >
      <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[{ position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: COLOR }, splash]} />
        {ok ? (
          <Animated.View style={[{ width: 30, height: 30, borderRadius: 15, backgroundColor: COLOR, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.navyLight }, stamp]}>
            <Feather name="check" size={15} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: C.faint, borderStyle: 'dashed' }} />
        )}
      </View>
      <Txt size={15} color={ok ? C.faint : C.ink} style={[{ flex: 1 }, ok && { textDecorationLine: 'line-through' }]}>{t.text}</Txt>
    </Tap>
  );
}

