import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation, Easing, FadeIn, FadeOut, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay,
  withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from 'expo-router';
import { bump } from '../lib/motion';
import { FONT } from '../lib/theme';

// Orbi: o mascote da assistente. Uma mala de viagem preta com olhos brancos, um avião na lateral
// e 16 poses desenhadas (parado, pensando, com sono, triste, olhando o mapa...). Cada humor mostra
// uma pose, e o código dá vida a ela: flutuar, pular, balançar, aparecer e sumir.
// As poses saem da folha em marca/mascote-opcoes com `node marca/recortar-orbi.mjs`.

export const ORBI_MOODS = [
  'idle', 'walking', 'jumping', 'thinking', 'happy', 'surprised', 'curious', 'sad',
  'angry', 'sleeping', 'running', 'disappearing', 'appearing', 'observing', 'affection',
  'waving', 'celebrating', 'passport',
] as const;
export type OrbiMood = (typeof ORBI_MOODS)[number];

const POSES: Record<OrbiMood, ImageSourcePropType> = {
  idle: require('../../assets/orbi/parado.png'),
  walking: require('../../assets/orbi/viajando.png'),
  jumping: require('../../assets/orbi/animado.png'),
  thinking: require('../../assets/orbi/pensando.png'),
  happy: require('../../assets/orbi/feliz.png'),
  surprised: require('../../assets/orbi/surpreso.png'),
  curious: require('../../assets/orbi/pedindo-ajuda.png'),
  sad: require('../../assets/orbi/triste.png'),
  angry: require('../../assets/orbi/surpreso.png'), // sem pose de bravo: usa a de surpresa, com tremidinha
  sleeping: require('../../assets/orbi/com-sono.png'),
  running: require('../../assets/orbi/indo-embora.png'),
  disappearing: require('../../assets/orbi/indo-embora.png'),
  appearing: require('../../assets/orbi/chegando.png'),
  observing: require('../../assets/orbi/olhando-mapa.png'),
  affection: require('../../assets/orbi/apaixonado.png'),
  waving: require('../../assets/orbi/acenando.png'),
  celebrating: require('../../assets/orbi/celebrando.png'),
  passport: require('../../assets/orbi/passaporte.png'),
};

const MARK = '#1E1E22'; // fundo do balão de fala (o fundo do app é claro)
// Proporção altura/largura das imagens (sai do recortar-orbi.mjs). O corpo ocupa quase toda a altura
// e fica no centro; acessórios (corações, "?", confete) passam para os lados da caixa.
const POSE_RATIO = 262 / 462;

// Toque: cada um dá uma reação diferente, com uma fala curta.
const POKES: { mood: OrbiMood; line: string }[] = [
  { mood: 'waving', line: 'Oi! Eu sou o Orbi 🧳' },
  { mood: 'surprised', line: 'Opa! Cócegas não!' },
  { mood: 'jumping', line: 'Bora planejar essa viagem?' },
  { mood: 'affection', line: 'Tô aqui pra ajudar 💛' },
  { mood: 'passport', line: 'Passaporte em dia?' },
  { mood: 'curious', line: 'Pergunta de visto ou chegada?' },
];
const REACTION_MS = 1700;
const DOZE_MS = 45000; // sem nenhum toque nesse tempo, o Orbi cochila

type Props = {
  size?: number;
  mood?: OrbiMood;
  talk?: boolean; // mostra o balão de fala quando tocado
  interactive?: boolean;
};

export function Orbi({ size = 120, mood = 'idle', talk = false, interactive = true }: Props) {
  const reduce = useReducedMotion();
  const focused = useIsFocused();
  const still = reduce || !focused; // parado com "reduzir movimento" ou com a tela fora de vista

  const [reaction, setReaction] = useState<OrbiMood | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [dozing, setDozing] = useState(false);
  const turn = useRef(0);

  // Cochilo: só no repouso, com animação ligada e se ninguém tocar nele por um tempo.
  // Quando o humor muda (ex.: chegou pergunta), ele acorda na hora.
  const [prevMood, setPrevMood] = useState(mood);
  if (mood !== prevMood) {
    setPrevMood(mood);
    setDozing(false);
  }
  const canDoze = mood === 'idle' && !still && interactive;
  const shown: OrbiMood = reaction ?? (dozing && canDoze ? 'sleeping' : mood);

  useEffect(() => {
    if (!canDoze || dozing) return;
    const t = setTimeout(() => setDozing(true), DOZE_MS);
    return () => clearTimeout(t);
  }, [canDoze, dozing, reaction]);

  // A reação do toque e o balão somem sozinhos.
  useEffect(() => {
    if (!reaction) return;
    const t = setTimeout(() => {
      setReaction(null);
      setLine(null);
    }, REACTION_MS);
    return () => clearTimeout(t);
  }, [reaction]);

  function poke() {
    bump();
    const p = dozing ? { mood: 'surprised' as const, line: 'Opa! Acordei 😅' } : POKES[turn.current++ % POKES.length];
    setDozing(false);
    setReaction(p.mood);
    setLine(p.line);
    // O balão aparece e some; o leitor de tela recebe a fala direto.
    if (talk) AccessibilityInfo.announceForAccessibility(p.line);
  }

  const Wrap = (interactive ? Pressable : View) as React.ComponentType<React.ComponentProps<typeof Pressable>>;

  return (
    <View style={{ alignItems: 'center' }}>
      {talk && line ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={{ position: 'absolute', top: -34, left: (size - 260) / 2, width: 260, zIndex: 2, alignItems: 'center' }}
        >
          <Text numberOfLines={2} maxFontSizeMultiplier={1.3} style={{ backgroundColor: MARK, color: '#FFFFFF', fontFamily: FONT.bold, fontSize: 13, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, overflow: 'hidden', textAlign: 'center' }}>{line}</Text>
        </Animated.View>
      ) : null}
      <Wrap
        {...(interactive
          ? { onPress: poke, accessibilityRole: 'button' as const, accessibilityLabel: 'Orbi, o mascote da assistente. Toque para brincar.' }
          : { 'aria-hidden': true })}
        style={{ width: size, height: size }}
      >
        <OrbiArt mood={shown} size={size} still={still} />
      </Wrap>
    </View>
  );
}

// O Orbi em si, num estado. Separado para dar para mostrar todos os estados lado a lado (orbi-galeria).
export function OrbiArt({ mood, size, still = false }: { mood: OrbiMood; size: number; still?: boolean }) {
  const k = size / 100; // movimentos pensados numa caixa de 100
  const y = useSharedValue(0);
  const x = useSharedValue(0);
  const rot = useSharedValue(0);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);
  const fade = useSharedValue(1);
  const grow = useSharedValue(1);

  useEffect(() => {
    const all = [y, x, rot, sx, sy, fade, grow];
    all.forEach((v) => cancelAnimation(v));
    // Postura de cada estado (vale também parado, com "reduzir movimento").
    y.set(mood === 'sad' ? 2 : 0);
    x.set(0);
    rot.set(mood === 'curious' ? 4 : mood === 'sad' ? -3 : 0);
    sx.set(1);
    sy.set(1);
    fade.set(mood === 'disappearing' ? 0.25 : 1);
    grow.set(mood === 'disappearing' ? 0.8 : 1);
    if (still) return;

    const sine = Easing.inOut(Easing.sin);
    const loopY = (amp: number, ms: number) =>
      withRepeat(withSequence(withTiming(-amp, { duration: ms, easing: sine }), withTiming(0, { duration: ms, easing: sine })), -1);
    const sway = (deg: number, ms: number) =>
      withRepeat(withSequence(withTiming(-deg, { duration: ms, easing: sine }), withTiming(deg, { duration: ms, easing: sine })), -1);

    switch (mood) {
      case 'idle':
      case 'observing':
      case 'passport':
        y.set(loopY(2.5, 1400));
        break;
      case 'walking':
      case 'running':
        x.set(withRepeat(withSequence(withTiming(-3, { duration: mood === 'running' ? 300 : 600, easing: sine }), withTiming(3, { duration: mood === 'running' ? 300 : 600, easing: sine })), -1));
        y.set(withRepeat(withSequence(withTiming(-2.5, { duration: mood === 'running' ? 150 : 300 }), withTiming(0, { duration: mood === 'running' ? 150 : 300 })), -1));
        break;
      case 'jumping':
      case 'celebrating':
        y.set(withRepeat(withSequence(
          withDelay(120, withTiming(-12, { duration: 260, easing: Easing.out(Easing.quad) })),
          withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 200 }),
        ), -1));
        sy.set(withRepeat(withSequence(withTiming(0.9, { duration: 120 }), withTiming(1.03, { duration: 260 }), withTiming(1, { duration: 220 }), withTiming(0.94, { duration: 90 }), withTiming(1, { duration: 110 })), -1));
        sx.set(withRepeat(withSequence(withTiming(1.07, { duration: 120 }), withTiming(0.98, { duration: 260 }), withTiming(1, { duration: 220 }), withTiming(1.04, { duration: 90 }), withTiming(1, { duration: 110 })), -1));
        break;
      case 'thinking':
      case 'curious':
        y.set(loopY(1.5, 1800));
        rot.set(sway(3, 900));
        break;
      case 'happy':
      case 'waving':
        y.set(withSequence(withTiming(-8, { duration: 180, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 6, stiffness: 220 }), loopY(2.5, 1100)));
        grow.set(withSequence(withTiming(1.05, { duration: 160 }), withSpring(1, { damping: 8 })));
        if (mood === 'waving') rot.set(sway(4, 260));
        break;
      case 'surprised':
        y.set(withSequence(withTiming(-7, { duration: 110 }), withSpring(0, { damping: 7, stiffness: 260 })));
        grow.set(withSequence(withTiming(1.08, { duration: 110 }), withSpring(1, { damping: 6, stiffness: 240 })));
        break;
      case 'sad':
        y.set(withRepeat(withSequence(withTiming(3, { duration: 2000, easing: sine }), withTiming(1.5, { duration: 2000, easing: sine })), -1));
        break;
      case 'angry':
        x.set(withRepeat(withSequence(
          withTiming(-2, { duration: 50 }), withTiming(2, { duration: 50 }), withTiming(-2, { duration: 50 }),
          withTiming(2, { duration: 50 }), withTiming(0, { duration: 50 }), withTiming(0, { duration: 900 }),
        ), -1));
        break;
      case 'sleeping':
        sy.set(withRepeat(withSequence(withTiming(1.03, { duration: 1600, easing: sine }), withTiming(0.98, { duration: 1600, easing: sine })), -1));
        sx.set(withRepeat(withSequence(withTiming(0.99, { duration: 1600, easing: sine }), withTiming(1.02, { duration: 1600, easing: sine })), -1));
        break;
      case 'disappearing':
        fade.set(1);
        grow.set(1);
        fade.set(withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) }));
        grow.set(withTiming(0.6, { duration: 520, easing: Easing.in(Easing.quad) }));
        break;
      case 'appearing':
        fade.set(0);
        grow.set(0.6);
        fade.set(withTiming(1, { duration: 360 }));
        grow.set(withSpring(1, { damping: 7, stiffness: 200 }));
        break;
      case 'affection':
        y.set(loopY(2.5, 1200));
        grow.set(withRepeat(withSequence(withTiming(1.04, { duration: 500, easing: sine }), withTiming(1, { duration: 500, easing: sine })), -1));
        break;
    }
  }, [mood, still, y, x, rot, sx, sy, fade, grow]);

  // Gira e estica a partir do pé, como quem pula do chão.
  const body = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [
      { translateX: x.get() * k },
      { translateY: y.get() * k },
      { rotate: `${rot.get()}deg` },
      { scaleX: sx.get() * grow.get() },
      { scaleY: sy.get() * grow.get() },
    ],
  }));
  // A sombra encolhe quando o Orbi sobe.
  const shadow = useAnimatedStyle(() => {
    const lift = Math.max(0, -y.get());
    return { opacity: (0.16 - lift * 0.006) * fade.get(), transform: [{ scaleX: 1 - lift * 0.025 }] };
  });

  const w = size / POSE_RATIO;
  return (
    <View style={{ width: size, height: size, overflow: 'visible' }}>
      <Animated.View style={[{ position: 'absolute', left: 22 * k, top: 95 * k, width: 56 * k, height: 5 * k, borderRadius: 28 * k, backgroundColor: '#000000' }, shadow]} />
      <Animated.View style={[{ position: 'absolute', left: (size - w) / 2, top: 0, width: w, height: size, transformOrigin: 'bottom' }, body]}>
        <Image source={POSES[mood]} style={{ width: w, height: size }} resizeMode="contain" accessibilityIgnoresInvertColors />
      </Animated.View>
    </View>
  );
}
