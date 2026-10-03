import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Hero, Ring, Screen } from '../../components/ui';
import { phasesFor } from '../../data/checklist';
import { getCountry } from '../../data/countries';
import { useApp } from '../../lib/store';
import { C, F } from '../../lib/theme';

export default function Checklist() {
  const { state, toggle } = useApp();
  const country = getCountry(state.profile.country);
  const phases = phasesFor(country);
  const all = phases.flatMap((p) => p.tasks);
  const done = all.filter((t) => state.done[t.id]).length;
  const next = all.find((t) => !state.done[t.id]);
  const currentPhase = phases.find((ph) => ph.tasks.some((t) => !state.done[t.id]))?.id;

  return (
    <Screen title="Checklist" eyebrow="Passo 3 · Checklist" eyebrowColor={F.checklist.color} subtitle={`Do planejamento à primeira semana em ${country.name}`}>
      <Hero colors={['#B85A16', '#E07A2F']} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Ring value={done / all.length} size={84} stroke={9} color="#FFFFFF" track="rgba(255,255,255,0.25)">
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>{Math.round((done / all.length) * 100)}%</Text>
        </Ring>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>{done === all.length ? 'Tudo pronto!' : `${done} de ${all.length} feitas`}</Text>
          <Text style={{ color: '#FFE4CF', fontSize: 14 }}>{next ? `Próxima: ${next.text}` : 'Boa viagem! ✈️'}</Text>
        </View>
      </Hero>

      {phases.map((ph, pi) => {
        const n = ph.tasks.filter((t) => state.done[t.id]).length;
        const complete = n === ph.tasks.length;
        const current = ph.id === currentPhase;
        return (
          <View key={ph.id} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 30 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: complete ? C.good : current ? F.checklist.color : C.line, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
                {complete ? <Feather name="check" size={16} color="#FFFFFF" /> : <Text style={{ color: current ? '#FFFFFF' : C.sub, fontWeight: '800' }}>{pi + 1}</Text>}
              </View>
              {pi < phases.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: complete ? C.good : C.line, marginTop: 4 }} /> : null}
            </View>
            <View style={{ flex: 1, gap: 8, paddingBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: current ? F.checklist.color : C.sub, letterSpacing: 0.6 }}>{ph.when.toUpperCase()}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }}>{ph.title}</Text>
                </View>
                <Text style={{ color: C.sub, fontSize: 13, fontWeight: '700' }}>{n}/{ph.tasks.length}</Text>
              </View>
              <Card style={{ paddingVertical: 4, gap: 0 }}>
                {ph.tasks.map((t, i) => {
                  const ok = !!state.done[t.id];
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => toggle(t.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: ok }}
                      style={({ pressed }) => [{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.line, opacity: pressed ? 0.6 : 1 }]}
                    >
                      <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: ok ? C.good : C.faint, backgroundColor: ok ? C.good : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                        {ok ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
                      </View>
                      <Text style={[{ flex: 1, fontSize: 15, color: C.ink, lineHeight: 21 }, ok && { color: C.faint, textDecorationLine: 'line-through' }]}>{t.text}</Text>
                    </Pressable>
                  );
                })}
              </Card>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
