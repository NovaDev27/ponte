import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeOut, type SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat,
  withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { bump, tap } from '../lib/motion';

// Orbi: o mascote da assistente. Um planeta preto e branco com olhos, anel e uma luazinha.
// Flutua e pisca sozinho, fica pensativo enquanto a IA responde, comemora quando a resposta
// chega e reage a cada toque com uma animação diferente.

export type OrbiMood = 'idle' | 'thinking' | 'happy';

const INK = '#111111';
const PAPER = '#FFFFFF';
const GRAY = '#D6D6D6';
const VB = 130; // viewBox: planeta no centro (65,65), raio 32

const LINES = ['Oi! Bora economizar? 💸', 'Câmbio é comigo!', 'Pergunta qualquer coisa!', 'Hehe, cócegas! 😄', 'Já fez a conta do mês?'];

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

  // Flutuar + piscar + lua em órbita (param com "reduzir movimento" do celular).
  useEffect(() => {
    if (reduce) return;
    float.set(withRepeat(withSequence(
      withTiming(-4, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
    ), -1));
    const blink = withRepeat(withSequence(
      withDelay(2600, withTiming(0.1, { duration: 70 })),
      withTiming(1, { duration: 110 }),
    ), -1);
    blinkL.set(blink);
    blinkR.set(blink);
  }, [reduce, float, blinkL, blinkR]);

  useEffect(() => {
    if (reduce) return;
    const turnMs = mood === 'thinking' ? 1400 : 6000;
    moon.set(0);
    moon.set(withRepeat(withTiming(Math.PI * 2, { duration: turnMs, easing: Easing.linear }), -1));
    if (mood === 'thinking') {
      // Olhando para cima, de um lado para o outro, como quem pensa.
      lookY.set(withTiming(-2.5, { duration: 250 }));
      lookX.set(withRepeat(withSequence(withTiming(-2.5, { duration: 500 }), withTiming(2.5, { duration: 500 })), -1, true));
    } else {
      lookX.set(withTiming(0, { duration: 250 }));
      lookY.set(withTiming(0, { duration: 250 }));
    }
    if (mood === 'happy') {
      jump.set(withSequence(withTiming(-10, { duration: 180, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 6, stiffness: 220 })));
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
      sq.set(withSequence(withTiming(0.82, { duration: 90 }), withSpring(1, { damping: 5, stiffness: 260 })));
      rot.set(withSequence(withTiming(360, { duration: 650, easing: Easing.out(Easing.cubic) }), withTiming(0, { duration: 0 })));
    } else if (n === 1) {
      // Pulo com estrelinhas.
      setJoy(true);
      jump.set(withSequence(withTiming(-26, { duration: 220, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 7, stiffness: 200 })));
      burst.set(0);
      burst.set(withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    } else {
      // Piscadinha e balançada.
      blinkL.set(withSequence(withTiming(0.1, { duration: 90 }), withDelay(260, withTiming(1, { duration: 120 }))));
      rot.set(withSequence(withTiming(-12, { duration: 110 }), withTiming(12, { duration: 140 }), withTiming(-6, { duration: 120 }), withSpring(0)));
    }
  }

  const body = useAnimatedStyle(() => ({
    transform: [
      { translateY: (float.get() + jump.get()) * k },
      { rotate: `${rot.get()}deg` },
      { scaleX: 2 - sq.get() },
      { scaleY: sq.get() },
    ],
  }));
  const shadow = useAnimatedStyle(() => {
    const up = -(float.get() + jump.get()); // 0 no chão, positivo no ar
    return { opacity: 0.18 - up * 0.004, transform: [{ scaleX: 1 - up * 0.012 }] };
  });
  const eyeL = useAnimatedStyle(() => ({ transform: [{ translateX: lookX.get() * k }, { translateY: lookY.get() * k }, { scaleY: blinkL.get() }] }));
  const eyeR = useAnimatedStyle(() => ({ transform: [{ translateX: lookX.get() * k }, { translateY: lookY.get() * k }, { scaleY: blinkR.get() }] }));
  // Lua: anda numa elipse inclinada; some quando passa por trás do planeta.
  const moonStyle = useAnimatedStyle(() => {
    const a = moon.get();
    const x = Math.cos(a) * 50;
    const y = Math.sin(a) * 12;
    const tilt = (-14 * Math.PI) / 180;
    const rx = x * Math.cos(tilt) - y * Math.sin(tilt);
    const ry = x * Math.sin(tilt) + y * Math.cos(tilt);
    const behind = Math.sin(a) < 0 && Math.abs(x) < 34;
    return { opacity: behind ? 0 : 1, transform: [{ translateX: rx * k }, { translateY: ry * k }] };
  });

  const eye = (left: boolean, style: object) => (
    <Animated.View
      style={[{ position: 'absolute', left: (left ? 54 : 70) * k, top: 54 * k, width: 9 * k, height: 12 * k, borderRadius: 5 * k, backgroundColor: INK }, style]}
    >
      <View style={{ position: 'absolute', left: 4.6 * k, top: 2 * k, width: 3 * k, height: 3 * k, borderRadius: 2 * k, backgroundColor: PAPER }} />
    </Animated.View>
  );

  return (
    <View style={{ alignItems: 'center' }}>
      {talk && line ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={{ position: 'absolute', top: -30, zIndex: 2, backgroundColor: INK, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 }}
        >
          <Text numberOfLines={1} style={{ color: PAPER, fontWeight: '700', fontSize: 13 }}>{line}</Text>
        </Animated.View>
      ) : null}
      <Pressable
        onPress={poke}
        onPressIn={() => tap()}
        accessibilityRole="button"
        accessibilityLabel="Orbi, o mascote da assistente. Toque para brincar."
        style={{ width: size, height: size }}
      >
        <Animated.View style={[{ position: 'absolute', left: 38 * k, top: 108 * k, width: 54 * k, height: 8 * k, borderRadius: 30 * k, backgroundColor: INK }, shadow]} />
        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, body]}>
          <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={{ position: 'absolute' }}>
            <G transform="rotate(-14 65 67)">
              <Path d="M 15 67 A 50 12 0 0 1 115 67" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            </G>
            <Circle cx={65} cy={65} r={32} fill={PAPER} stroke={INK} strokeWidth={4} />
            <Circle cx={48} cy={48} r={4.5} fill={GRAY} />
            <Circle cx={82} cy={78} r={6} fill={GRAY} />
            <Circle cx={76} cy={44} r={2.6} fill={GRAY} />
            <Circle cx={47} cy={82} r={2.4} fill={GRAY} />
            {happy ? (
              <>
                <Path d="M 53 62 Q 58.5 55 64 62" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
                <Path d="M 69 62 Q 74.5 55 80 62" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
                <Path d="M 58 71 Q 66.5 80 75 71" stroke={INK} strokeWidth={3} fill={INK} strokeLinecap="round" />
              </>
            ) : (
              <Path d="M 60 73 Q 66.5 78 73 73" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            )}
            <G transform="rotate(-14 65 67)">
              <Path d="M 15 67 A 50 12 0 0 0 115 67" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            </G>
          </Svg>
          {happy ? null : eye(true, eyeL)}
          {happy ? null : eye(false, eyeR)}
          <Animated.View style={[{ position: 'absolute', left: 61 * k, top: 63 * k, width: 8 * k, height: 8 * k, borderRadius: 4 * k, backgroundColor: PAPER, borderWidth: 2.5 * k, borderColor: INK }, moonStyle]} />
        </Animated.View>
        {STARS.map(([dx, dy], i) => <Star key={i} dx={dx} dy={dy} k={k} burst={burst} />)}
      </Pressable>
    </View>
  );
}

const STARS: [number, number][] = [[-46, -34], [46, -30], [-40, 30], [44, 34]];

// Estrelinha que voa para fora do planeta quando ele pula.
function Star({ dx, dy, k, burst }: { dx: number; dy: number; k: number; burst: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    const b = burst.get();
    return { opacity: b > 0 && b < 1 ? 1 - b : 0, transform: [{ translateX: dx * b * k }, { translateY: dy * b * k }, { scale: 0.6 + b * 0.6 }] };
  });
  return (
    <Animated.Text aria-hidden style={[{ position: 'absolute', left: 58 * k, top: 52 * k, fontSize: 18 * k, color: INK }, st]}>
      ✦
    </Animated.Text>
  );
}
