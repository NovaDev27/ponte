import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation, Easing, FadeIn, FadeOut, type SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay,
  withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { useIsFocused } from 'expo-router';
import { bump } from '../lib/motion';
import { FONT } from '../lib/theme';

// Orbi: o mascote da assistente. Uma lua cheia preta com crateras discretas e olhos brancos
// que brilham. Sem braços nem pernas: tudo o que ele sente aparece nos olhos, no jeito de
// flutuar e num sinalzinho do lado (?, !!, zZ, coração). Desenhado em código, sem imagem.

export const ORBI_MOODS = [
  'idle', 'walking', 'jumping', 'thinking', 'happy', 'surprised', 'curious', 'sad',
  'angry', 'sleeping', 'running', 'disappearing', 'appearing', 'observing', 'affection',
] as const;
export type OrbiMood = (typeof ORBI_MOODS)[number];

const VB = 100; // viewBox 0..100; a lua fica em (50,46) com raio 31
const CX = 50;
const CY = 46;
const R = 31;
const GLOW = '#FFFFFF';
const MARK = '#1E1E22'; // sinais em volta da lua (o fundo do app é claro)

// Toque: cada um dá uma reação diferente, com uma fala curta.
const POKES: { mood: OrbiMood; line: string }[] = [
  { mood: 'happy', line: 'Oi! Eu sou o Orbi 🌑' },
  { mood: 'surprised', line: 'Opa! Cócegas não!' },
  { mood: 'jumping', line: 'Bora planejar essa viagem?' },
  { mood: 'affection', line: 'Tô aqui pra ajudar 💛' },
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
  const k = size / VB;
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
        <OrbiArt mood={shown} size={size} k={k} still={still} />
      </Wrap>
    </View>
  );
}

// A lua em si, num estado. Separada para dar para mostrar os 15 estados lado a lado.
export function OrbiArt({ mood, size, k = size / VB, still = false }: { mood: OrbiMood; size: number; k?: number; still?: boolean }) {
  const y = useSharedValue(0);
  const x = useSharedValue(0);
  const rot = useSharedValue(0);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);
  const fade = useSharedValue(1);
  const grow = useSharedValue(1);
  const blink = useSharedValue(1);
  const lookX = useSharedValue(0);
  const lookY = useSharedValue(0);
  const mark = useSharedValue(0); // 0..1, anima os sinais em volta (zZ subindo, coração, linhas)

  useEffect(() => {
    const all = [y, x, rot, sx, sy, fade, grow, blink, lookX, lookY, mark];
    all.forEach((v) => cancelAnimation(v));
    // Postura de cada estado (vale também parado, com "reduzir movimento").
    y.set(mood === 'sad' ? 3 : 0);
    x.set(0);
    rot.set(mood === 'curious' ? 10 : mood === 'sad' ? -5 : mood === 'running' ? 8 : 0);
    sx.set(1);
    sy.set(1);
    fade.set(mood === 'disappearing' ? 0.25 : 1);
    grow.set(mood === 'disappearing' ? 0.8 : 1);
    blink.set(1);
    lookX.set(mood === 'observing' ? 2.5 : 0);
    lookY.set(mood === 'thinking' ? -3 : mood === 'sad' ? 1.5 : 0);
    mark.set(1);
    if (still) return;

    const sine = Easing.inOut(Easing.sin);
    const loopY = (amp: number, ms: number) =>
      withRepeat(withSequence(withTiming(-amp, { duration: ms, easing: sine }), withTiming(0, { duration: ms, easing: sine })), -1);
    const blinking = () =>
      blink.set(withRepeat(withSequence(withDelay(2800, withTiming(0.12, { duration: 70 })), withTiming(1, { duration: 110 })), -1));
    const markLoop = (ms: number) => {
      mark.set(0);
      mark.set(withRepeat(withTiming(1, { duration: ms, easing: Easing.out(Easing.quad) }), -1));
    };
    const markPop = () => {
      mark.set(0);
      mark.set(withSpring(1, { damping: 7, stiffness: 240 }));
    };

    switch (mood) {
      case 'idle':
        y.set(loopY(3, 1400));
        blinking();
        break;
      case 'walking':
        x.set(withRepeat(withSequence(withTiming(-4, { duration: 600, easing: sine }), withTiming(4, { duration: 600, easing: sine })), -1));
        y.set(withRepeat(withSequence(withTiming(-2.5, { duration: 300 }), withTiming(0, { duration: 300 })), -1));
        rot.set(withRepeat(withSequence(withTiming(-4, { duration: 600 }), withTiming(4, { duration: 600 })), -1));
        markLoop(1200);
        break;
      case 'jumping':
        y.set(withRepeat(withSequence(
          withDelay(120, withTiming(-14, { duration: 260, easing: Easing.out(Easing.quad) })),
          withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 200 }),
        ), -1));
        sy.set(withRepeat(withSequence(withTiming(0.86, { duration: 120 }), withTiming(1.04, { duration: 260 }), withTiming(1, { duration: 220 }), withTiming(0.9, { duration: 90 }), withTiming(1, { duration: 110 })), -1));
        sx.set(withRepeat(withSequence(withTiming(1.1, { duration: 120 }), withTiming(0.97, { duration: 260 }), withTiming(1, { duration: 220 }), withTiming(1.06, { duration: 90 }), withTiming(1, { duration: 110 })), -1));
        markLoop(800);
        break;
      case 'thinking':
        y.set(loopY(2, 1800));
        lookX.set(withRepeat(withSequence(withTiming(-3, { duration: 520 }), withTiming(3, { duration: 520 })), -1));
        rot.set(withTiming(-6, { duration: 300 }));
        markLoop(1100);
        break;
      case 'happy':
        y.set(withSequence(withTiming(-10, { duration: 180, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 6, stiffness: 220 }), loopY(3, 1100)));
        grow.set(withSequence(withTiming(1.06, { duration: 160 }), withSpring(1, { damping: 8 })));
        markPop();
        break;
      case 'surprised':
        y.set(withSequence(withTiming(-7, { duration: 110 }), withSpring(0, { damping: 7, stiffness: 260 })));
        grow.set(withSequence(withTiming(1.1, { duration: 110 }), withSpring(1, { damping: 6, stiffness: 240 })));
        markPop();
        break;
      case 'curious':
        y.set(loopY(2, 1500));
        rot.set(withRepeat(withSequence(withTiming(12, { duration: 900, easing: sine }), withTiming(6, { duration: 900, easing: sine })), -1));
        lookX.set(withTiming(2, { duration: 300 }));
        blinking();
        markPop();
        break;
      case 'sad':
        y.set(withRepeat(withSequence(withTiming(4, { duration: 2000, easing: sine }), withTiming(2, { duration: 2000, easing: sine })), -1));
        markPop();
        break;
      case 'angry':
        x.set(withRepeat(withSequence(
          withTiming(-2, { duration: 50 }), withTiming(2, { duration: 50 }), withTiming(-2, { duration: 50 }),
          withTiming(2, { duration: 50 }), withTiming(0, { duration: 50 }), withTiming(0, { duration: 900 }),
        ), -1));
        markPop();
        break;
      case 'sleeping':
        sy.set(withRepeat(withSequence(withTiming(1.03, { duration: 1600, easing: sine }), withTiming(0.98, { duration: 1600, easing: sine })), -1));
        sx.set(withRepeat(withSequence(withTiming(0.99, { duration: 1600, easing: sine }), withTiming(1.02, { duration: 1600, easing: sine })), -1));
        markLoop(2400);
        break;
      case 'running':
        y.set(withRepeat(withSequence(withTiming(-3, { duration: 150 }), withTiming(0, { duration: 150 })), -1));
        x.set(withRepeat(withSequence(withTiming(2, { duration: 300 }), withTiming(-1, { duration: 300 })), -1));
        markLoop(450);
        break;
      case 'disappearing':
        fade.set(1);
        grow.set(1);
        fade.set(withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) }));
        grow.set(withTiming(0.6, { duration: 520, easing: Easing.in(Easing.quad) }));
        mark.set(0);
        mark.set(withTiming(1, { duration: 520 }));
        break;
      case 'appearing':
        fade.set(0);
        grow.set(0.6);
        fade.set(withTiming(1, { duration: 360 }));
        grow.set(withSpring(1, { damping: 7, stiffness: 200 }));
        mark.set(0);
        mark.set(withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
        break;
      case 'observing':
        y.set(loopY(1.5, 1600));
        lookX.set(withRepeat(withSequence(withDelay(1200, withTiming(3, { duration: 260 })), withDelay(1200, withTiming(-3, { duration: 260 }))), -1));
        blinking();
        break;
      case 'affection':
        y.set(loopY(3, 1200));
        grow.set(withRepeat(withSequence(withTiming(1.05, { duration: 500, easing: sine }), withTiming(1, { duration: 500, easing: sine })), -1));
        markLoop(1600);
        break;
    }
  }, [mood, still, y, x, rot, sx, sy, fade, grow, blink, lookX, lookY, mark]);

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
  const eyes = useAnimatedStyle(() => ({
    transform: [{ translateX: lookX.get() * k }, { translateY: lookY.get() * k }, { scaleY: blink.get() }],
  }));
  // A sombra encolhe quando a lua sobe.
  const shadow = useAnimatedStyle(() => {
    const lift = Math.max(0, -y.get());
    return { opacity: (0.22 - lift * 0.008) * fade.get(), transform: [{ scaleX: 1 - lift * 0.025 }] };
  });

  const full = { position: 'absolute' as const, left: 0, top: 0, width: size, height: size };
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ position: 'absolute', left: 28 * k, top: 82 * k, width: 44 * k, height: 7 * k, borderRadius: 22 * k, backgroundColor: '#000000' }, shadow]} />
      <Marks mood={mood} k={k} size={size} t={mark} side />
      <Animated.View style={[full, body]}>
        <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
          <Defs>
            <RadialGradient id="orbi-body" cx="38%" cy="30%" r="75%">
              <Stop offset="0" stopColor="#47474D" />
              <Stop offset="0.45" stopColor="#1B1B1F" />
              <Stop offset="1" stopColor="#070708" />
            </RadialGradient>
          </Defs>
          <Circle cx={CX} cy={CY} r={R} fill="url(#orbi-body)" />
          <Craters />
        </Svg>
        <Animated.View style={[full, eyes]}>
          <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
            <Eyes mood={mood} />
          </Svg>
        </Animated.View>
      </Animated.View>
      <Marks mood={mood} k={k} size={size} t={mark} />
    </View>
  );
}

// Crateras discretas: um pouco mais escuras, com uma borda clara de um lado.
function Craters() {
  const list: [number, number, number][] = [[35, 31, 5], [29, 45, 3.2], [43, 22, 2.4], [33, 59, 4], [64, 66, 2.6], [68, 30, 2]];
  return (
    <G>
      {list.map(([cx, cy, r]) => (
        <G key={`${cx}-${cy}`}>
          <Circle cx={cx} cy={cy} r={r} fill="#0E0E10" opacity={0.75} />
          <Path d={`M ${cx - r * 0.8} ${cy + r * 0.5} A ${r} ${r} 0 0 0 ${cx + r * 0.8} ${cy + r * 0.5}`} stroke="#5A5A61" strokeWidth={0.7} fill="none" opacity={0.6} />
        </G>
      ))}
    </G>
  );
}

// Olhos com brilho: o mesmo desenho, maior e transparente por baixo, faz o "glow".
function Eyes({ mood }: { mood: OrbiMood }) {
  const L = 40;
  const Rr = 60;
  const Y = 47;
  const stroke = (d: string, key: string) => (
    <G key={key}>
      <Path d={d} stroke={GLOW} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.16} />
      <Path d={d} stroke={GLOW} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </G>
  );
  const oval = (cx: number, rx: number, ry: number, key: string, cy = Y) => (
    <G key={key}>
      <Ellipse cx={cx} cy={cy} rx={rx + 2.4} ry={ry + 2.4} fill={GLOW} opacity={0.14} />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={GLOW} />
    </G>
  );
  const shape = (d: string, key: string) => (
    <G key={key}>
      <Path d={d} fill={GLOW} opacity={0.16} stroke={GLOW} strokeWidth={4} strokeLinejoin="round" />
      <Path d={d} fill={GLOW} />
    </G>
  );

  switch (mood) {
    case 'happy':
    case 'walking':
    case 'affection':
      return <>{stroke(`M ${L - 4} ${Y + 2} Q ${L} ${Y - 4} ${L + 4} ${Y + 2}`, 'l')}{stroke(`M ${Rr - 4} ${Y + 2} Q ${Rr} ${Y - 4} ${Rr + 4} ${Y + 2}`, 'r')}</>;
    case 'jumping':
    case 'running':
      return <>{stroke(`M ${L - 3.5} ${Y - 3.5} L ${L + 3} ${Y} L ${L - 3.5} ${Y + 3.5}`, 'l')}{stroke(`M ${Rr + 3.5} ${Y - 3.5} L ${Rr - 3} ${Y} L ${Rr + 3.5} ${Y + 3.5}`, 'r')}</>;
    case 'sleeping':
      return <>{stroke(`M ${L - 4} ${Y} Q ${L} ${Y + 4} ${L + 4} ${Y}`, 'l')}{stroke(`M ${Rr - 4} ${Y} Q ${Rr} ${Y + 4} ${Rr + 4} ${Y}`, 'r')}</>;
    case 'sad':
      // Pálpebra caída: meia-lua para baixo.
      return <>{shape(`M ${L - 4.2} ${Y} L ${L + 4.2} ${Y - 1.2} A 4.2 4.4 0 0 1 ${L - 4.2} ${Y} Z`, 'l')}{shape(`M ${Rr - 4.2} ${Y - 1.2} L ${Rr + 4.2} ${Y} A 4.2 4.4 0 0 1 ${Rr - 4.2} ${Y - 1.2} Z`, 'r')}</>;
    case 'angry':
      return <>{shape(`M ${L - 4.5} ${Y - 3} L ${L + 4.5} ${Y + 0.5} A 4.4 4.4 0 0 1 ${L - 4.5} ${Y - 3} Z`, 'l')}{shape(`M ${Rr - 4.5} ${Y + 0.5} L ${Rr + 4.5} ${Y - 3} A 4.4 4.4 0 0 1 ${Rr - 4.5} ${Y + 0.5} Z`, 'r')}</>;
    case 'surprised':
      return <>{oval(L, 5, 6.4, 'l')}{oval(Rr, 5, 6.4, 'r')}</>;
    case 'curious':
      return <>{oval(L, 3.8, 5.6, 'l', Y + 0.5)}{oval(Rr, 4.6, 6.6, 'r', Y - 0.5)}</>;
    case 'observing':
      return <>{oval(L, 4.2, 6, 'l')}{stroke(`M ${Rr - 4} ${Y + 0.5} L ${Rr + 4} ${Y - 0.5}`, 'r')}</>;
    default:
      return <>{oval(L, 4.2, 6.2, 'l')}{oval(Rr, 4.2, 6.2, 'r')}</>;
  }
}

// Sinais em volta da lua: "?", "!!", zZ, coração, raiva, linhas de movimento e brilhos.
// `side` desenha só o que fica atrás da lua (linhas de movimento).
function Marks({ mood, k, size, t, side = false }: { mood: OrbiMood; k: number; size: number; t: SharedValue<number>; side?: boolean }) {
  const floatUp = useAnimatedStyle(() => ({ opacity: 1 - t.get() * 0.7, transform: [{ translateY: -t.get() * 10 * k }, { scale: 0.85 + t.get() * 0.25 }] }));
  const pop = useAnimatedStyle(() => ({ opacity: Math.min(1, t.get() * 1.4), transform: [{ scale: 0.4 + t.get() * 0.6 }] }));
  const flicker = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * Math.abs(Math.sin(t.get() * Math.PI)), transform: [{ translateX: -t.get() * 4 * k }] }));
  const burst = useAnimatedStyle(() => ({ opacity: 1 - t.get(), transform: [{ scale: 0.7 + t.get() * 0.8 }] }));

  const full = { position: 'absolute' as const, left: 0, top: 0, width: size, height: size };
  const svg = (children: React.ReactNode) => (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>{children}</Svg>
  );
  const word = (text: string, left: number, top: number, fs: number) => (
    <Text allowFontScaling={false} style={{ position: 'absolute', left: left * k, top: top * k, fontSize: fs * k, lineHeight: fs * 1.15 * k, color: MARK, fontFamily: FONT.bold }}>{text}</Text>
  );
  const sparkle = (cx: number, cy: number, r: number) =>
    `M ${cx} ${cy - r} Q ${cx} ${cy} ${cx + r} ${cy} Q ${cx} ${cy} ${cx} ${cy + r} Q ${cx} ${cy} ${cx - r} ${cy} Q ${cx} ${cy} ${cx} ${cy - r} Z`;

  if (side) {
    if (mood === 'running') {
      return (
        <Animated.View pointerEvents="none" style={[full, flicker]}>
          {svg(<G stroke={MARK} strokeWidth={1.6} strokeLinecap="round" opacity={0.55}>
            <Path d="M 4 38 L 16 38" /><Path d="M 1 46 L 15 46" /><Path d="M 5 54 L 16 54" />
          </G>)}
        </Animated.View>
      );
    }
    if (mood === 'walking') {
      return (
        <Animated.View pointerEvents="none" style={[full, flicker]}>
          {svg(<G stroke={MARK} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.45}>
            <Path d="M 10 40 Q 15 46 10 52" /><Path d="M 5 42 Q 9 46 5 50" />
          </G>)}
        </Animated.View>
      );
    }
    return null;
  }

  switch (mood) {
    case 'idle':
      return <Animated.View pointerEvents="none" style={[full, { opacity: 0.6 }]}>{svg(<Path d={sparkle(84, 16, 4)} fill={MARK} />)}</Animated.View>;
    case 'thinking':
      return (
        <Animated.View pointerEvents="none" style={[full, flicker]}>
          {svg(<G fill={MARK}><Circle cx={78} cy={16} r={2} /><Circle cx={85} cy={11} r={2.4} /><Circle cx={93} cy={6} r={2.8} /></G>)}
        </Animated.View>
      );
    case 'happy':
      return (
        <Animated.View pointerEvents="none" style={[full, pop]}>
          {svg(<G fill={MARK}><Path d={sparkle(84, 14, 4.5)} /><Path d={sparkle(14, 20, 3)} /></G>)}
        </Animated.View>
      );
    case 'surprised':
      return <Animated.View pointerEvents="none" style={[full, pop]}>{word('!!', 80, 2, 15)}</Animated.View>;
    case 'curious':
      return <Animated.View pointerEvents="none" style={[full, pop]}>{word('?', 82, 0, 17)}</Animated.View>;
    case 'sad':
      return (
        <Animated.View pointerEvents="none" style={[full, pop]}>
          {svg(<Path d="M 80 22 Q 76 28 80 31 Q 84 28 80 22 Z" fill="#6E8BB5" />)}
        </Animated.View>
      );
    case 'angry':
      return (
        <Animated.View pointerEvents="none" style={[full, pop]}>
          {svg(<G stroke={MARK} strokeWidth={2} strokeLinecap="round" fill="none">
            <Path d="M 78 8 Q 81 12 78 16" /><Path d="M 90 8 Q 87 12 90 16" /><Path d="M 79 7 Q 84 10 89 7" /><Path d="M 79 17 Q 84 14 89 17" />
          </G>)}
        </Animated.View>
      );
    case 'sleeping':
      return (
        <Animated.View pointerEvents="none" style={[full, floatUp]}>
          {word('z', 76, 12, 10)}
          {word('Z', 84, 2, 14)}
        </Animated.View>
      );
    case 'jumping':
      return (
        <Animated.View pointerEvents="none" style={[full, flicker]}>
          {svg(<G stroke={MARK} strokeWidth={1.4} strokeLinecap="round" opacity={0.5}><Path d="M 24 88 L 19 93" /><Path d="M 76 88 L 81 93" /></G>)}
        </Animated.View>
      );
    case 'disappearing':
    case 'appearing':
      return (
        <Animated.View pointerEvents="none" style={[full, mood === 'appearing' ? burst : pop]}>
          {svg(<G fill={MARK} opacity={0.6}>
            <Path d={sparkle(14, 20, 3)} /><Path d={sparkle(86, 18, 3.5)} /><Circle cx={12} cy={60} r={1.6} /><Circle cx={88} cy={64} r={1.8} /><Circle cx={22} cy={80} r={1.2} /><Circle cx={80} cy={84} r={1.4} />
          </G>)}
        </Animated.View>
      );
    case 'observing':
      return (
        <Animated.View pointerEvents="none" style={[full, { opacity: 0.7 }]}>
          {svg(<G stroke={MARK} strokeWidth={1.6} strokeLinecap="round"><Path d="M 84 22 L 89 18" /><Path d="M 86 28 L 92 27" /></G>)}
        </Animated.View>
      );
    case 'affection':
      return (
        <Animated.View pointerEvents="none" style={[full, floatUp]}>
          {svg(<G fill={MARK}>
            <Path d="M 92 22 C 92 18 87 16 86 20 C 85 16 80 18 80 22 C 80 26 86 29 86 30 C 86 29 92 26 92 22 Z" />
            <Path d="M 98 10 C 98 8 95.5 7 95 9 C 94.5 7 92 8 92 10 C 92 12 95 13.5 95 14 C 95 13.5 98 12 98 10 Z" opacity={0.7} />
          </G>)}
        </Animated.View>
      );
    default:
      return null;
  }
}
