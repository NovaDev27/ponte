import React from 'react';
import { Text, View } from 'react-native';
import Svg, { G, Line, Path } from 'react-native-svg';
import { C, FONT } from '../lib/theme';

type Props = { size?: number; color?: string; accent?: string };

// Logo oficial (24/10/2026): ponte pênsil dentro de um círculo aberto, com o avião saindo e deixando o rastro.
// Gerado a partir de marca/logo_oficial.py, as mesmas medidas do ícone do app.
// Abaixo de 72 px usa a versão "ícone" (traço grosso, menos detalhes) para não virar borrão.
// `color` pinta a ponte; `accent` pinta o círculo, o rastro e o avião.
export function Logo({ size = 120, color = C.ink, accent = C.accent }: Props) {
  const small = size < 72;
  return (
    <Svg width={size} height={size} viewBox="155 155 770 770">
      {small ? (
        <>
        <Path d="M 181.4 469.7 A 338 338 0 0 1 660.2 236.2" stroke={accent} strokeWidth="26" strokeLinecap="round" fill="none" />
        <Path d="M 785.4 738.7 A 338 338 0 0 1 238.6 738.7" stroke={accent} strokeWidth="26" strokeLinecap="round" fill="none" />
        <Path d="M 236 590 Q 392 214 792 372 Q 414 272 236 590 Z" fill={accent} />
        <Path d="M -55 -6.5 L 44 -6.5 Q 64 -6.5 66 0 Q 64 6.5 44 6.5 L -55 6.5 Q -61 0 -55 -6.5 Z M 2 -6 L -22 -54 L -8 -54 L 30 -6 Z M 2 6 L -22 54 L -8 54 L 30 6 Z M -40 -6 L -57 -27 L -48 -27 L -29 -6 Z M -40 6 L -57 27 L -48 27 L -29 6 Z" fill={accent} transform="translate(842 342) rotate(-27) scale(1.25)" />
        <G stroke={color} strokeLinecap="round" fill="none">
        <Path d="M 382 448 Q 512 668 642 448" strokeWidth="28" />
        <Path d="M 382 448 Q 318 600 214 640" strokeWidth="28" />
        <Path d="M 642 448 Q 706 600 810 640" strokeWidth="28" />
        <Line x1="460" y1="540.4" x2="460" y2="648" strokeWidth="18" />
        <Line x1="512" y1="558.0" x2="512" y2="648" strokeWidth="18" />
        <Line x1="564" y1="540.4" x2="564" y2="648" strokeWidth="18" />
        <Line x1="200" y1="648" x2="824" y2="648" strokeWidth="32" />
        <Line x1="382" y1="434" x2="382" y2="734" strokeWidth="40" />
        <Line x1="642" y1="434" x2="642" y2="734" strokeWidth="40" />
        </G>
        <Line x1="430" y1="796" x2="594" y2="796" stroke={accent} strokeWidth="22" strokeLinecap="round" />
        </>
      ) : (
        <>
        <Path d="M 181.4 469.7 A 338 338 0 0 1 660.2 236.2" stroke={accent} strokeWidth="12" strokeLinecap="round" fill="none" />
        <Path d="M 820.8 677.5 A 338 338 0 0 1 203.2 677.5" stroke={accent} strokeWidth="12" strokeLinecap="round" fill="none" />
        <Path d="M 236 590 Q 392 220 792 372 Q 410 263 236 590 Z" fill={accent} />
        <Path d="M -55 -6.5 L 44 -6.5 Q 64 -6.5 66 0 Q 64 6.5 44 6.5 L -55 6.5 Q -61 0 -55 -6.5 Z M 2 -6 L -22 -54 L -8 -54 L 30 -6 Z M 2 6 L -22 54 L -8 54 L 30 6 Z M -40 -6 L -57 -27 L -48 -27 L -29 -6 Z M -40 6 L -57 27 L -48 27 L -29 6 Z" fill={accent} transform="translate(842 342) rotate(-27) scale(1.05)" />
        <G stroke={color} strokeLinecap="round" fill="none">
        <Path d="M 382 448 Q 512 668 642 448" strokeWidth="13" />
        <Path d="M 382 448 Q 318 600 196 640" strokeWidth="13" />
        <Path d="M 642 448 Q 706 600 828 640" strokeWidth="13" />
        <Line x1="434" y1="518.4" x2="434" y2="648" strokeWidth="8" />
        <Line x1="473" y1="548.1" x2="473" y2="648" strokeWidth="8" />
        <Line x1="512" y1="558.0" x2="512" y2="648" strokeWidth="8" />
        <Line x1="551" y1="548.1" x2="551" y2="648" strokeWidth="8" />
        <Line x1="590" y1="518.4" x2="590" y2="648" strokeWidth="8" />
        <Line x1="186" y1="648" x2="838" y2="648" strokeWidth="16" />
        <Line x1="382" y1="434" x2="382" y2="742" strokeWidth="24" />
        <Line x1="642" y1="434" x2="642" y2="742" strokeWidth="24" />
        </G>
        <Line x1="340" y1="770" x2="684" y2="770" stroke={color} strokeWidth="9" strokeLinecap="round" />
        <Line x1="398" y1="798" x2="626" y2="798" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <Line x1="456" y1="824" x2="568" y2="824" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        <Line x1="488" y1="846" x2="536" y2="846" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Logo size={40} color={light ? C.cream : C.ink} accent={light ? C.navyLight : C.navy} />
      <Text style={{ fontSize: 24, fontFamily: FONT.heavy, color: light ? C.cream : C.ink, letterSpacing: -0.8 }}>ponte</Text>
    </View>
  );
}
