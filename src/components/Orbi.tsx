import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeOut, type SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay,
  withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { bump, tap } from '../lib/motion';

// Orbi: o mascote da assistente. Um planeta branco num pedacinho de espaço, com dois olhos
// em pílula, anel e uma luazinha. Flutua e pisca sozinho, fica pensativo enquanto a IA
// responde, comemora quando a resposta chega e reage a cada toque com uma animação diferente.

export type OrbiMood = 'idle' | 'thinking' | 'happy';

const SPACE = '#0B0B0C';
const PLANET = '#FFFFFF';
const EYE = '#0B0B0C';
const RING = '#8E8E93';
const VB = 100; // viewBox: espaço 0..100, planeta no centro (50,52), raio 30

const LINES = ['Oi! Bora economizar? 💸', 'Câmbio é comigo!', 'Pergunta qualquer coisa!', 'Hehe, cócegas! 😄', 'Já fez a conta do mês?'];
const TWINKLES: [number, number, number][] = [[14, 18, 0], [84, 14, 700], [86, 80, 1400], [12, 76, 2100]];
const STARS: [number, number][] = [[-34, -26], [34, -24], [-30, 22], [32, 26]];

export function Orbi({ size = 120, mood = 'idle', talk = false }: { size?: number; mood?: OrbiMood; talk?: boolean }) {
  const k = size / VB;
  const reduce = useReducedMotion();
  const float = useSharedValue(0);
  const jump = useSharedValue(0);
  const rot = useSharedValue(0);
  const sq = useSharedValue(1);
  const blinkL = useSharedValue(1);
  const blinkR = useSharedValue(1);
  const lookX = useSharedValue(0);
  const lookY = useSharedValue(0);
  const moon = useSharedValue(0);
  const burst = useSharedValue(0);
  const turn = useRef(0);
  const [joy, setJoy] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const happy = mood === 'happy' || joy;

  // Flutuar + piscar (param com "reduzir movimento" do celular).
  useEffect(() => {
    if (reduce) return;
    float.set(withRepeat(withSequence(
      withTiming(-3, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
    ), -1));
    const blink = withRepeat(withSequence(
      withDelay(2800, withTiming(0.12, { duration: 70 })),
      withTiming(1, { duration: 110 }),
    ), -1);
    blinkL.set(blink);
    blinkR.set(blink);
  }, [reduce, float, blinkL, blinkR]);

  useEffect(() => {
    if (reduce) return;
    moon.set(0);
    moon.set(withRepeat(withTiming(Math.PI * 2, { duration: mood === 'thinking' ? 1400 : 6500, easing: Easing.linear }), -1));
    if (mood === 'thinking') {
      // Olhando para cima, de um lado para o outro, como quem pensa.
      lookY.set(withTiming(-3, { duration: 250 }));
      lookX.set(withRepeat(withSequence(withTiming(-3, { duration: 500 }), withTiming(3, { duration: 500 })), -1, true));
    } else {
      lookX.set(withTiming(0, { duration: 250 }));
      lookY.set(withTiming(0, { duration: 250 }));
    }
    if (mood === 'happy') {
      jump.set(withSequence(withTiming(-8, { duration: 180, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 6, stiffness: 220 })));
    }
  }, [mood, reduce, moon, lookX, lookY, jump]);

  // Some com o balão de fala e com os olhinhos felizes depois de um tempo.
  useEffect(() => {
    if (!line && !joy) return;
    const t = setTimeout(() => {
      setLine(null);
      setJoy(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [line, joy]);

  function poke() {
    bump();
    const n = turn.current++ % 3;
    setLine(LINES[turn.current % LINES.length]);
    if (n === 0) {
      // Pirueta com amasso de desenho animado.
      sq.set(withSequence(withTiming(0.84, { duration: 90 }), withSpring(1, { damping: 5, stiffness: 260 })));
      rot.set(withSequence(withTiming(360, { duration: 650, easing: Easing.out(Easing.cubic) }), withTiming(0, { duration: 0 })));
    } else if (n === 1) {
      // Pulo com estrelinhas.
      setJoy(true);
      jump.set(withSequence(withTiming(-16, { duration: 200, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 7, stiffness: 200 })));
      burst.set(0);
      burst.set(withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    } else {
      // Piscadinha e balançada.
      blinkL.set(withSequence(withTiming(0.12, { duration: 90 }), withDelay(260, withTiming(1, { duration: 120 }))));
      rot.set(withSequence(withTiming(-12, { duration: 110 }), withTiming(12, { duration: 140 }), withTiming(-6, { duration: 120 }), withSpring(0)));
    }
  }

  const planet = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.get() + jump.get()) * k },
      { rotate: `${rot.get()}deg` },
      { scaleX: 2 - sq.get() },
      { scaleY: sq.get() },
    ],
  }));
  const eyeL = useAnimatedStyle(() => ({ transform: [{ translateX: lookX.get() * k }, { translateY: lookY.get() * k }, { scaleY: blinkL.get() }] }));
  const eyeR = useAnimatedStyle(() => ({ transform: [{ translateX: lookX.get() * k }, { translateY: lookY.get() * k }, { scaleY: blinkR.get() }] }));
  // Lua: anda numa elipse inclinada; some quando passa por trás do planeta.
  const moonStyle = useAnimatedStyle(() => {
    const a = moon.get();
    const x = Math.cos(a) * 42;
    const y = Math.sin(a) * 9;
    const tilt = (-14 * Math.PI) / 180;
    const rx = x * Math.cos(tilt) - y * Math.sin(tilt);
    const ry = x * Math.sin(tilt) + y * Math.cos(tilt);
    const behind = Math.sin(a) < 0 && Math.abs(x) < 31;
    return { opacity: behind ? 0 : 1, transform: [{ translateX: rx * k }, { translateY: ry * k }] };
  });

  const eye = (cx: number, style: object) => (
    <Animated.View
      style={[{ position: 'absolute', left: (cx - 3.6) * k, top: 46 * k, width: 7.2 * k, height: 16 * k, borderRadius: 3.6 * k, backgroundColor: EYE }, style]}
    />
  );

  return (
    <View style={{ alignItems: 'center' }}>
      {talk && line ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={{ position: 'absolute', top: -30, zIndex: 2, backgroundColor: SPACE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 }}
        >
          <Text numberOfLines={1} style={{ color: PLANET, fontWeight: '700', fontSize: 13 }}>{line}</Text>
        </Animated.View>
      ) : null}
      <Pressable
        onPress={poke}
        onPressIn={() => tap()}
        accessibilityRole="button"
        accessibilityLabel="Orbi, o mascote da assistente. Toque para brincar."
        style={{ width: size, height: size, borderRadius: size * 0.26, backgroundColor: SPACE, overflow: 'hidden' }}
      >
        {TWINKLES.map(([x, y, d]) => <Twinkle key={`${x}-${y}`} x={x} y={y} delay={d} k={k} reduce={reduce} />)}
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, planet]}>
          <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={{ position: 'absolute' }}>
            <G transform="rotate(-14 50 55)">
              <Path d="M 8 55 A 42 9 0 0 1 92 55" stroke={RING} strokeWidth={2.4} fill="none" strokeLinecap="round" />
            </G>
            <Circle cx={50} cy={52} r={30} fill={PLANET} />
            {happy ? (
              <>
                <Path d="M 39.5 55 Q 43 49 46.5 55" stroke={EYE} strokeWidth={3.4} fill="none" strokeLinecap="round" />
                <Path d="M 53.5 55 Q 57 49 60.5 55" stroke={EYE} strokeWidth={3.4} fill="none" strokeLinecap="round" />
              </>
            ) : null}
            <G transform="rotate(-14 50 55)">
              <Path d="M 8 55 A 42 9 0 0 0 92 55" stroke={RING} strokeWidth={2.4} fill="none" strokeLinecap="round" />
            </G>
          </Svg>
          {happy ? null : eye(43, eyeL)}
          {happy ? null : eye(57, eyeR)}
          <Animated.View style={[{ position: 'absolute', left: 47 * k, top: 52 * k, width: 6 * k, height: 6 * k, borderRadius: 3 * k, backgroundColor: RING }, moonStyle]} />
        </Animated.View>
        {STARS.map(([dx, dy], i) => <Star key={i} dx={dx} dy={dy} k={k} burst={burst} />)}
      </Pressable>
    </View>
  );
}

// Pontinho de estrela no fundo, que pisca devagar.
function Twinkle({ x, y, delay, k, reduce }: { x: number; y: number; delay: number; k: number; reduce: boolean }) {
  const o = useSharedValue(0.5);
  useEffect(() => {
    if (reduce) return;
    o.set(withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.25, { duration: 900 })), -1)));
  }, [o, delay, reduce]);
  const st = useAnimatedStyle(() => ({ opacity: o.get() }));
  return <Animated.View style={[{ position: 'absolute', left: x * k, top: y * k, width: 2.4 * k, height: 2.4 * k, borderRadius: 2 * k, backgroundColor: PLANET }, st]} />;
}

// Estrelinha que voa para fora do planeta quando ele pula.
function Star({ dx, dy, k, burst }: { dx: number; dy: number; k: number; burst: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    const b = burst.get();
    return { opacity: b > 0 && b < 1 ? 1 - b : 0, transform: [{ translateX: dx * b * k }, { translateY: dy * b * k }, { scale: 0.6 + b * 0.6 }] };
  });
  return (
    <Animated.Text aria-hidden style={[{ position: 'absolute', left: 45 * k, top: 42 * k, fontSize: 14 * k, color: PLANET }, st]}>
      ✦
    </Animated.Text>
  );
}
