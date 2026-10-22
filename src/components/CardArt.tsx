import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { tap } from '../lib/motion';
import { Tap, Txt } from './ui';

// Desenho de um cartão (proporção de cartão de verdade: 85,6 x 54 mm).
// Com `back`, um toque vira o cartão e mostra o verso com uma explicação.
export function CardArt({ colors, fg = '#FFFFFF', title, tag, width = 300, back, number = '4821', holder = 'SEU NOME' }: {
  colors: [string, string]; fg?: string; title: string; tag?: string; width?: number; back?: string; number?: string; holder?: string;
}) {
  const h = width / 1.586;
  const k = width / 300; // escala do texto
  const turn = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);
  // Troca a face no meio do giro (90°): funciona igual em todo Android, sem depender de backfaceVisibility.
  const front = useAnimatedStyle(() => ({ opacity: turn.get() < 90 ? 1 : 0, transform: [{ perspective: 1200 }, { rotateY: `${turn.get()}deg` }] }));
  const rear = useAnimatedStyle(() => ({ opacity: turn.get() < 90 ? 0 : 1, transform: [{ perspective: 1200 }, { rotateY: `${turn.get() - 180}deg` }] }));

  const face = (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[st.card, { width, height: h, borderRadius: 16 * k, padding: 18 * k }]}>
      <View pointerEvents="none" style={[st.ring, { width: h * 1.3, height: h * 1.3, right: -h * 0.55, top: -h * 0.5, borderColor: fg }]} />
      <View pointerEvents="none" style={[st.ring, { width: h * 0.9, height: h * 0.9, right: -h * 0.25, top: -h * 0.2, borderColor: fg }]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Txt w="heavy" size={18 * k} color={fg} numberOfLines={1} style={{ flex: 1 }}>{title}</Txt>
        {tag ? <Txt w="mono" size={10 * k} color={fg} style={{ opacity: 0.85, letterSpacing: 1.2 }}>{tag}</Txt> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 * k }}>
        <View style={{ width: 40 * k, height: 30 * k, borderRadius: 6 * k, backgroundColor: '#D9DCE1', overflow: 'hidden', justifyContent: 'center' }}>
          <View style={{ height: 1, backgroundColor: '#A9AEB6', marginHorizontal: 4 * k }} />
          <View style={{ position: 'absolute', left: 20 * k, top: 4 * k, bottom: 4 * k, width: 1, backgroundColor: '#A9AEB6' }} />
        </View>
        <Feather name="wifi" size={18 * k} color={fg} style={{ transform: [{ rotate: '90deg' }], opacity: 0.85 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View style={{ gap: 2 }}>
          <Txt w="mono" size={14 * k} color={fg} style={{ letterSpacing: 2 }}>•••• {number}</Txt>
          <Txt w="mono" size={10 * k} color={fg} style={{ opacity: 0.8, letterSpacing: 1 }}>{holder}</Txt>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 22 * k, height: 22 * k, borderRadius: 11 * k, backgroundColor: fg, opacity: 0.55 }} />
          <View style={{ width: 22 * k, height: 22 * k, borderRadius: 11 * k, backgroundColor: fg, opacity: 0.3, marginLeft: -9 * k }} />
        </View>
      </View>
    </LinearGradient>
  );

  if (!back) return <View style={st.shadow}>{face}</View>;

  return (
    <Tap
      haptic={false}
      scaleTo={0.97}
      onPress={() => {
        tap();
        turn.set(withSpring(flipped ? 0 : 180, { damping: 14, stiffness: 120 }));
        setFlipped(!flipped);
      }}
      accessibilityRole="button"
      accessibilityLabel={flipped ? back : `Cartão ${title}. Toque para virar.`}
      style={{ width, height: h }}
    >
      <Animated.View style={[st.side, st.shadow, front]}>{face}</Animated.View>
      <Animated.View style={[st.side, st.shadow, rear]}>
        <LinearGradient colors={colors} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={[st.card, { width, height: h, borderRadius: 16 * k, padding: 0 }]}>
          <View style={{ height: 34 * k, backgroundColor: 'rgba(0,0,0,0.75)', marginTop: 18 * k }} />
          <View style={{ flex: 1, padding: 16 * k, justifyContent: 'center' }}>
            <Txt w="bold" size={14 * k} color={fg} style={{ textAlign: 'center' }}>{back}</Txt>
          </View>
        </LinearGradient>
      </Animated.View>
    </Tap>
  );
}

const st = StyleSheet.create({
  card: { justifyContent: 'space-between', overflow: 'hidden' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, opacity: 0.16 },
  side: { position: 'absolute', top: 0, left: 0, backfaceVisibility: 'hidden' },
  shadow: { boxShadow: '0px 14px 28px rgba(18,20,24,0.22)', borderRadius: 16 },
});
