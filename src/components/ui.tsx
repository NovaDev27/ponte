import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { C, R, shadow } from '../lib/theme';

export type IconName = React.ComponentProps<typeof Feather>['name'];

export function Screen({ title, subtitle, right, children, scroll = true, header = false, eyebrow, eyebrowColor }: {
  title?: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode; scroll?: boolean;
  header?: boolean; // tela com cabeçalho de navegação: não aplica o recuo superior
  eyebrow?: string; eyebrowColor?: string;
}) {
  const head = title ? (
    <View style={s.head}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={[s.eyebrow, eyebrowColor ? { color: eyebrowColor } : null]}>{eyebrow}</Text> : null}
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  ) : null;
  return (
    <SafeAreaView style={s.safe} edges={header ? [] : ['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {head}
          {children}
        </ScrollView>
      ) : (
        <View style={[s.content, { flex: 1 }]}>
          {head}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: 'night' | 'accent' | 'good' | 'flat' }) {
  const bg = tone === 'night' ? C.night : tone === 'accent' ? C.accentSoft : tone === 'good' ? C.goodSoft : C.card;
  return <View style={[s.card, { backgroundColor: bg }, !tone ? shadow : null, tone === 'flat' ? s.flat : null, style]}>{children}</View>;
}

export function Hero({ children, colors = [C.night, C.night2], style }: { children: React.ReactNode; colors?: [string, string]; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, style]}>
      {children}
    </LinearGradient>
  );
}

export function H({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.h, style]}>{children}</Text>;
}

export function P({ children, style, muted }: { children: React.ReactNode; style?: StyleProp<TextStyle>; muted?: boolean }) {
  return <Text style={[s.p, muted && { color: C.sub }, style]}>{children}</Text>;
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.label, style]}>{children}</Text>;
}

export function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={{ marginTop: 8, gap: 2 }}>
      <Text style={s.section}>{title}</Text>
      {hint ? <Text style={{ color: C.sub, fontSize: 14 }}>{hint}</Text> : null}
    </View>
  );
}

export function Btn({ label, onPress, kind = 'primary', icon, disabled, color }: {
  label: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'accent'; icon?: IconName; disabled?: boolean; color?: string;
}) {
  const base = color ?? (kind === 'accent' ? C.accent : C.primary);
  const bg = kind === 'ghost' ? C.card : base;
  const fg = kind === 'ghost' ? base : '#FFFFFF';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, borderColor: kind === 'ghost' ? C.line : bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      {icon ? <Feather name={icon} size={18} color={fg} /> : null}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, color = C.primary }: { label: string; active?: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[s.chip, active ? { backgroundColor: color, borderColor: color } : null]}
    >
      <Text style={[s.chipText, active ? { color: '#FFFFFF' } : null]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {children}
    </ScrollView>
  );
}

export function Field({ value, onChangeText, prefix, placeholder, style, keyboard = 'decimal-pad', big }: {
  value: string; onChangeText: (t: string) => void; prefix?: string; placeholder?: string; style?: StyleProp<ViewStyle>;
  keyboard?: 'decimal-pad' | 'default' | 'url'; big?: boolean;
}) {
  return (
    <View style={[s.field, big && { minHeight: 64 }, style]}>
      {prefix ? <Text style={[s.prefix, big && { fontSize: 24 }]}>{prefix}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.faint}
        keyboardType={keyboard}
        autoCapitalize="none"
        autoCorrect={false}
        style={[s.input, big && { fontSize: 30, fontWeight: '800' }]}
      />
    </View>
  );
}

export function Bar({ value, color = C.primary, height = 8 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={[s.bar, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

export function Ring({ value, size = 64, stroke = 8, color = C.good, track = C.line, children }: {
  value: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {v > 0 ? <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={`${circ * v} ${circ}`} strokeLinecap="round" /> : null}
      </Svg>
      {children}
    </View>
  );
}

export function Row({ left, right, strong, dot }: { left: string; right: string; strong?: boolean; dot?: string }) {
  return (
    <View style={s.row}>
      {dot ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }} /> : null}
      <Text style={[s.p, { color: C.sub, flex: 1 }, strong && { color: C.ink, fontWeight: '700' }]}>{left}</Text>
      <Text style={[s.p, { fontVariant: ['tabular-nums'] }, strong && { fontWeight: '800' }]}>{right}</Text>
    </View>
  );
}

export function Icon({ name, size = 20, color = C.primary }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

export function IconBox({ name, color, soft, size = 42 }: { name: IconName; color: string; soft: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={name} size={size * 0.48} color={color} />
    </View>
  );
}

export function Badge({ label, color, soft }: { label: string; color: string; soft: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '800', color, backgroundColor: soft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden', letterSpacing: 0.4 }}>
      {label}
    </Text>
  );
}

// Explicação curta que abre e fecha: para termos como IOF e spread.
export function Explain({ title, children }: { title: string; children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={s.explain}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Feather name="help-circle" size={18} color={C.primary} />
        <Text style={{ flex: 1, fontWeight: '700', color: C.ink, fontSize: 15 }}>{title}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.sub} />
      </View>
      {open ? <Text style={{ color: C.sub, fontSize: 14, lineHeight: 20 }}>{children}</Text> : null}
    </Pressable>
  );
}

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 4, marginBottom: 2 },
  eyebrow: { fontSize: 12, fontWeight: '800', color: C.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  title: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: C.sub, marginTop: 2, lineHeight: 21 },
  section: { fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: -0.3 },
  card: { borderRadius: R.lg, padding: 16, gap: 10 },
  flat: { borderWidth: 1, borderColor: C.line },
  hero: { borderRadius: R.lg, padding: 20, gap: 8, overflow: 'hidden' },
  h: { fontSize: 17, fontWeight: '700', color: C.ink },
  p: { fontSize: 15, color: C.ink, lineHeight: 21 },
  label: { fontSize: 12, fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: 0.8 },
  btn: { minHeight: 52, borderRadius: R.md, borderWidth: 1, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '700' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: C.card },
  chipText: { fontSize: 14, fontWeight: '600', color: C.ink },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: R.md, backgroundColor: C.bg, paddingHorizontal: 14, minHeight: 50 },
  prefix: { fontSize: 18, color: C.sub, marginRight: 6, fontWeight: '700' },
  input: { flex: 1, fontSize: 18, color: C.ink, fontWeight: '700', paddingVertical: 10 },
  bar: { backgroundColor: C.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  explain: { backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.line, padding: 14, gap: 8 },
});
