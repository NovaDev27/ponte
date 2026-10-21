import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing, FadeInUp, FadeOut, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat,
  withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { cityCode } from '../data/airports';
import { monthLabel } from '../lib/format';
import { success } from '../lib/motion';
import { C } from '../lib/theme';
import { Tap, Txt } from './ui';

const APath = Animated.createAnimatedComponent(Path);
const PATH_H = 44;

// Cartão de embarque do intercâmbio: Brasil → cidade de destino, com um aviãozinho que cruza
// a rota sem parar. Tocar no cartão faz o avião "decolar" de uma vez.
export function Ticket({ flag, city, month, months, days, notch = C.bg }: {
  flag: string; city: string; month: string; months: number; days: number; notch?: string;
}) {
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const [hello, setHello] = useState(false);
  const t = useSharedValue(reduce ? 0.5 : 0);

  // Curva da rota: sai da esquerda, sobe e desce à direita.
  const x0 = 4;
  const x1 = Math.max(x0 + 1, w - 4);
  const cx = w / 2;
  const y0 = PATH_H - 8;
  const cy = -6;
  const len = useMemo(() => {
    let l = 0;
    let px = x0;
    let py = y0;
    for (let i = 1; i <= 24; i++) {
      const u = i / 24;
      const x = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u ** 2 * x1;
      const y = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u ** 2 * y0;
      l += Math.hypot(x - px, y - py);
      px = x;
      py = y;
    }
    return l;
  }, [x1, cx, y0, cy]);
  const d = `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y0}`;

  function loop() {
    if (reduce) return;
    t.set(withRepeat(withSequence(
      withTiming(1, { duration: 4600, easing: Easing.inOut(Easing.cubic) }),
      withDelay(1400, withTiming(0, { duration: 0 })),
    ), -1));
  }

  useEffect(() => {
    loop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  useEffect(() => {
    if (!hello) return;
    const id = setTimeout(() => {
      setHello(false);
      t.set(0);
      loop();
    }, 1800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hello]);

  function takeoff() {
    success();
    setHello(true);
    if (!reduce) t.set(withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) }));
  }

  const fade = (v: number) => {
    'worklet';
    return v < 0.06 ? v / 0.06 : v > 0.9 ? Math.max(0, (1 - v) / 0.1) : 1;
  };
  const plane = useAnimatedStyle(() => {
    const u = t.get();
    const x = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u ** 2 * x1;
    const y = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u ** 2 * y0;
    const dx = 2 * (1 - u) * (cx - x0) + 2 * u * (x1 - cx);
    const dy = 2 * (1 - u) * (cy - y0) + 2 * u * (y0 - cy);
    return {
      opacity: fade(u),
      transform: [{ translateX: x - 9 }, { translateY: y - 9 }, { rotate: `${Math.atan2(dy, dx)}rad` }],
    };
  });
  const trail = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - t.get()), strokeOpacity: fade(t.get()) }));

  const code = cityCode(city);
  return (
    <Tap onPress={takeoff} haptic={false} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={`Cartão de embarque: Brasil para ${city}, embarque em ${monthLabel(month)}`}>
      <View style={{ backgroundColor: C.night, borderRadius: 26, overflow: 'hidden' }}>
        <View style={{ padding: 20, paddingBottom: 18, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Txt w="mono" size={10} color={C.creamSub} style={{ letterSpacing: 1.4 }}>PONTE · CARTÃO DE EMBARQUE</Txt>
            <Txt size={20} style={{ lineHeight: 24 }}>{flag}</Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
            <View>
              <Txt w="heavy" size={38} color={C.cream} style={{ lineHeight: 40 }}>BRA</Txt>
              <Txt size={12} color={C.creamSub}>Brasil</Txt>
            </View>
            <View style={{ flex: 1, height: PATH_H, marginBottom: 14 }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
              {w > 0 ? (
                <>
                  <Svg width={w} height={PATH_H} style={{ position: 'absolute' }}>
                    <Path d={d} stroke={C.creamSub} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="2 5" strokeLinecap="round" fill="none" />
                    <APath d={d} stroke={C.accent} strokeWidth={2} strokeLinecap="round" fill="none" strokeDasharray={`${len} ${len}`} animatedProps={trail} />
                  </Svg>
                  <Animated.View style={[{ position: 'absolute', width: 18, height: 18 }, plane]}>
                    <Svg width={18} height={18} viewBox="-11 -9 22 18">
                      <Path d="M-10 0 L6 -1.3 Q10 -1.1 10 0 Q10 1.1 6 1.3 Z" fill={C.cream} />
                      <Path d="M-1 -0.9 L-5 -8 L-2 -8 L4 -0.9 Z" fill={C.cream} />
                      <Path d="M-1 0.9 L-5 8 L-2 8 L4 0.9 Z" fill={C.cream} />
                      <Path d="M-9 -0.3 L-11 -3.6 L-9.4 -3.6 L-6.5 -0.4 Z" fill={C.cream} />
                      <Path d="M-9 0.3 L-11 3.6 L-9.4 3.6 L-6.5 0.4 Z" fill={C.cream} />
                    </Svg>
                  </Animated.View>
                </>
              ) : null}
              {hello ? (
                <Animated.View entering={FadeInUp.springify().damping(14)} exiting={FadeOut.duration(200)} style={{ position: 'absolute', top: -14, alignSelf: 'center', backgroundColor: C.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Txt w="bold" size={12} color="#FFFFFF" style={{ lineHeight: 16 }}>Boa viagem! ✨</Txt>
                </Animated.View>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end', maxWidth: 120 }}>
              <Txt w="heavy" size={38} color={C.cream} style={{ lineHeight: 40 }}>{code}</Txt>
              <Txt size={12} color={C.creamSub} numberOfLines={1}>{city}</Txt>
            </View>
          </View>
        </View>

        {/* Picote do canhoto, com os recortes nas laterais */}
        <View style={{ height: 20, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, overflow: 'hidden' }}>
            {Array.from({ length: 26 }, (_, i) => <View key={i} style={{ width: 6, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(245,241,234,0.22)' }} />)}
          </View>
          <View style={{ position: 'absolute', left: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: notch }} />
          <View style={{ position: 'absolute', right: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: notch }} />
        </View>

        <View style={{ flexDirection: 'row', padding: 20, paddingTop: 14, gap: 8 }}>
          <Cell k="EMBARQUE" v={monthLabel(month)} />
          <Cell k="DURAÇÃO" v={`${months} ${months === 1 ? 'mês' : 'meses'}`} />
          <Cell k="FALTAM" v={days > 0 ? `${days} dias` : 'Já!'} accent end />
        </View>
      </View>
    </Tap>
  );
}

function Cell({ k, v, accent, end }: { k: string; v: string; accent?: boolean; end?: boolean }) {
  return (
    <View style={{ flex: 1, gap: 4, alignItems: end ? 'flex-end' : 'flex-start' }}>
      <Txt w="mono" size={10} color={C.creamSub} style={{ letterSpacing: 1.2 }}>{k}</Txt>
      <Txt w="display" size={17} color={accent ? C.accent : C.cream}>{v}</Txt>
    </View>
  );
}
