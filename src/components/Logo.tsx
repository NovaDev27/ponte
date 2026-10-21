import React from 'react';
import { Text, View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';
import { C, FONT } from '../lib/theme';

type Props = { size?: number; color?: string; accent?: string };

// Ponte pênsil minimalista com um avião ao fundo.
export function Logo({ size = 120, color = C.ink, accent = C.accent }: Props) {
  const hangers = [44, 52, 60, 68, 76];
  return (
    <Svg width={size} height={size * 0.7} viewBox="0 0 120 84">
      <Path d="M8 40 Q48 4 104 18" stroke={accent} strokeWidth={1.6} strokeDasharray="3 4" fill="none" strokeLinecap="round" opacity={0.7} />
      <G transform="translate(104 17) rotate(-14) scale(0.95)">
        <Path d="M-10 0 L6 -1.3 Q10 -1.1 10 0 Q10 1.1 6 1.3 Z" fill={accent} />
        <Path d="M-1 -0.9 L-5 -8 L-2 -8 L4 -0.9 Z" fill={accent} />
        <Path d="M-1 0.9 L-5 8 L-2 8 L4 0.9 Z" fill={accent} />
        <Path d="M-9 -0.3 L-11 -3.6 L-9.4 -3.6 L-6.5 -0.4 Z" fill={accent} />
        <Path d="M-9 0.3 L-11 3.6 L-9.4 3.6 L-6.5 0.4 Z" fill={accent} />
      </G>
      <Line x1={4} y1={66} x2={116} y2={66} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <Line x1={36} y1={30} x2={36} y2={76} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <Line x1={84} y1={30} x2={84} y2={76} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <Path d="M6 58 Q22 52 36 30 Q60 70 84 30 Q98 52 114 58" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {hangers.map((x) => {
        const t = (x - 36) / 48;
        const y = 30 + 2 * t * (1 - t) * 40 + 0;
        return <Line key={x} x1={x} y1={y} x2={x} y2={66} stroke={color} strokeWidth={1.4} opacity={0.6} />;
      })}
    </Svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Logo size={40} color={light ? C.cream : C.ink} />
      <Text style={{ fontSize: 24, fontFamily: FONT.heavy, color: light ? C.cream : C.ink, letterSpacing: -0.8 }}>ponte</Text>
    </View>
  );
}
