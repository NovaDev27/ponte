import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { C, FONT } from '../lib/theme';

type Props = { size?: number; color?: string; accent?: string };

// Ponte pênsil em traço grosso com o sol se pondo entre as torres.
// Mesma geometria do ícone do app (gerado a partir destas medidas).
export function Logo({ size = 120, color = C.ink, accent = C.accent }: Props) {
  const line = { stroke: color, strokeWidth: 7, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={(size * 70) / 92} viewBox="4 18 92 70">
      <Circle cx={50} cy={43} r={12} fill={accent} />
      <Path d="M32 28 Q50 76 68 28" {...line} />
      <Path d="M32 28 Q22 56 11 64" {...line} />
      <Path d="M68 28 Q78 56 89 64" {...line} />
      <Path d="M32 26 L32 80 M68 26 L68 80 M10 68 L90 68" {...line} />
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
