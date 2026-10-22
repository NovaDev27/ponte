import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PlacesCarousel } from '../../components/Places';
import { Ticket } from '../../components/Ticket';
import { Badge, Bar, Card, IconName, ListRow, Screen, Section, Tap, Txt } from '../../components/ui';
import { phasesFor } from '../../data/checklist';
import { getCountry } from '../../data/countries';
import { budgetOf } from '../../lib/budget';
import { COMPLETO_GRATIS } from '../../lib/completo';
import { daysUntil, rateLabel } from '../../lib/format';
import { rateOf, useApp } from '../../lib/store';
import { C, F, R } from '../../lib/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function Home() {
  const { state, rates } = useApp();
  const p = state.profile;
  const [allGuides, setAllGuides] = useState(false);
  const shown = allGuides ? GUIDES : GUIDES.slice(0, 3);
  const country = getCountry(p.country);
  const city = country.cities[p.city] ?? country.cities[0];
  const rate = rateOf(rates, country.currency);
  const days = daysUntil(p.tripMonth);

  const { coverage } = budgetOf(state, rates);
  const tasks = phasesFor(country).flatMap((ph) => ph.tasks);
  const doneCount = tasks.filter((t) => state.done[t.id]).length;
  // Orçamento coberto conta 35%, checklist 45% e ter montado o plano já vale 20%.
  const journeyProgress = Math.min(1, coverage) * 0.35 + (doneCount / Math.max(1, tasks.length)) * 0.45 + 0.2;

  return (
    <Screen>
      {/* Saudação limpa */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.3 }}>
            {greeting().toUpperCase()}
          </Txt>
          <Txt w="heavy" size={30} style={{ lineHeight: 34 }}>
            Rumo a {city.name}
          </Txt>
        </View>
        <Tap
          accessibilityLabel="Ajustes"
          onPress={() => router.push('/ajustes')}
          hitSlop={12}
          scaleTo={0.9}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: C.card,
            borderWidth: 1,
            borderColor: C.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="sliders" size={18} color={C.ink} />
        </Tap>
      </View>

      {/* Cartão de embarque — peça central */}
      <Ticket flag={country.flag} city={city.name} month={p.tripMonth} months={p.months} days={days} />

      {/* Progresso da jornada (uma linha só, em vez de 4 tiles pesados) */}
      <Card style={{ gap: 14, paddingVertical: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>
              SUA JORNADA
            </Txt>
            <Txt w="display" size={18}>
              {Math.round(Math.min(1, journeyProgress) * 100)}% no caminho
            </Txt>
          </View>
          <Txt size={13} color={C.sub}>
            {days > 0 ? `${days} dias` : 'Já!'}
          </Txt>
        </View>
        <Bar value={Math.min(1, journeyProgress)} color={C.navy} height={6} track={C.sunk} delay={200} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Orçamento', route: '/orcamento' as const, ok: coverage >= 1 },
            { label: 'Câmbio', route: '/cambio' as const, ok: false },
            { label: 'Checklist', route: '/checklist' as const, ok: doneCount === tasks.length && tasks.length > 0 },
            { label: 'Orbi', route: '/assistente' as const, ok: false },
          ].map((s) => (
            <Tap
              key={s.label}
              onPress={() => router.push(s.route)}
              scaleTo={0.96}
              accessibilityRole="button"
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: R.md,
                backgroundColor: s.ok ? C.navySoft : C.sunk,
              }}
            >
              <Txt w="medium" size={12} color={s.ok ? C.navy : C.sub} numberOfLines={1}>
                {s.label}
              </Txt>
            </Tap>
          ))}
        </View>
      </Card>

      {/* Cotação ao vivo — compacta */}
      <Tap
        onPress={() => router.push('/alerta')}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel="Cotação de hoje. Toque para criar um alerta."
      >
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pulse on={rates.live} />
              <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1 }}>
                {rates.live ? 'COTAÇÃO AO VIVO' : 'ÚLTIMA COTAÇÃO'}
              </Txt>
            </View>
            <Txt w="display" size={20}>
              {rateLabel(country.currency, 1 / rate)}
            </Txt>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: C.sunk,
              borderRadius: R.pill,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Feather name="bell" size={14} color={C.ink} />
            <Txt w="bold" size={13} style={{ lineHeight: 17 }}>
              Alerta
            </Txt>
          </View>
        </Card>
      </Tap>

      {/* Dica do país — postcard mais leve */}
      <Postcard flag={country.flag} name={country.name} tip={country.tip} />

      {/* Guias */}
      <Section title="Guias" hint="Ferramentas para o embarque" />
      <Card style={{ paddingVertical: 2, gap: 0 }}>
        {shown.map((g, i) => (
          <ListRow
            key={g.route}
            icon={g.icon}
            color={g.f.color}
            soft={g.f.soft}
            title={g.title}
            hint={g.hint}
            onPress={() => router.push(g.route)}
            last={i === shown.length - 1 && allGuides}
            right={g.completo && !COMPLETO_GRATIS ? <Badge label="COMPLETO" color={C.accent} soft={C.accentSoft} /> : null}
          />
        ))}
        {!allGuides ? (
          <Tap
            onPress={() => setAllGuides(true)}
            scaleTo={0.97}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 }}
          >
            <Txt w="bold" size={14}>
              Ver todos ({GUIDES.length})
            </Txt>
            <Feather name="chevron-down" size={16} color={C.ink} />
          </Tap>
        ) : null}
      </Card>

      {/* Lugares */}
      <Section
        title={`Lugares em ${country.name}`}
        hint="Para conhecer quando chegar"
        right={
          <Tap onPress={() => router.push('/lugares')} hitSlop={10}>
            <Txt w="bold" size={14} color={C.navy}>
              Ver todos
            </Txt>
          </Tap>
        }
      />
      <PlacesCarousel code={p.country} city={city.name} />
    </Screen>
  );
}

function Pulse({ on }: { on: boolean }) {
  const reduce = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    if (on && !reduce) v.set(withRepeat(withTiming(1, { duration: 1800 }), -1));
  }, [on, reduce, v]);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - v.get()),
    transform: [{ scale: 1 + v.get() * 1.5 }],
  }));
  const color = on ? C.navy : C.faint;
  return (
    <View style={{ width: 8, height: 8 }}>
      {on ? (
        <Animated.View
          style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color }, ring]}
        />
      ) : null}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

function Postcard({ flag, name, tip }: { flag: string; name: string; tip: string }) {
  const r = useSharedValue(5);
  const stamp = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.get()}deg` }] }));
  return (
    <Tap
      haptic
      scaleTo={0.99}
      onPress={() => {
        r.set(withSequence(withTiming(-8, { duration: 100 }), withSpring(5, { damping: 6, stiffness: 200 })));
      }}
      accessibilityRole="text"
      style={{
        backgroundColor: C.card,
        borderRadius: R.lg,
        borderWidth: 1,
        borderColor: C.line,
        borderStyle: 'dashed',
        padding: 18,
        paddingRight: 80,
        gap: 6,
      }}
    >
      <Txt w="mono" size={11} color={C.navy} style={{ letterSpacing: 1.2 }}>
        CARTÃO-POSTAL · {name.toUpperCase()}
      </Txt>
      <Txt size={15} color={C.ink2}>
        {tip}
      </Txt>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 16,
            right: 16,
            width: 52,
            height: 60,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: C.navy,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: C.navySoft,
          },
          stamp,
        ]}
      >
        <Txt size={24} style={{ lineHeight: 30 }}>
          {flag}
        </Txt>
      </Animated.View>
    </Tap>
  );
}

type Guide = {
  route: '/guia-cartoes' | '/onde-buscar' | '/guia-cripto' | '/feedback' | '/simulacao' | '/alerta' | '/lugares' | '/completo';
  icon: IconName;
  title: string;
  hint: string;
  f: { color: string; soft: string };
  completo?: boolean;
};

const GUIDES: Guide[] = [
  { route: '/guia-cartoes', icon: 'credit-card', title: 'Qual cartão levar', hint: 'Taxas e como pedir', f: F.cambio },
  { route: '/alerta', icon: 'bell', title: 'Alerta de cotação', hint: 'Aviso quando a moeda baratear', f: F.orcamento, completo: true },
  { route: '/feedback', icon: 'heart', title: 'Sua opinião', hint: 'Leva 2 minutos', f: F.assistente },
  { route: '/simulacao', icon: 'trending-up', title: 'Envios mensais', hint: 'Quanto chega todo mês', f: F.cambio, completo: true },
  { route: '/onde-buscar', icon: 'search', title: 'Onde buscar', hint: 'Visto, escolas e bolsas', f: F.checklist },
  { route: '/guia-cripto', icon: 'shield', title: 'Stablecoins', hint: 'USDC, redes e riscos', f: F.cripto },
  { route: '/lugares', icon: 'map', title: 'Lugares', hint: 'Pontos e bairros', f: F.orcamento },
  { route: '/completo', icon: 'star', title: 'Ponte Completo', hint: 'PDF, alertas e prazos', f: F.assistente },
];
