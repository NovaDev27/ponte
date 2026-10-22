import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Pressable, PressableProps, StyleProp, StyleSheet, Text, TextInput, TextProps, TextStyle, View, ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn, FadeInDown, interpolate, LinearTransition, SlideInDown, SlideInUp, useAnimatedProps, useAnimatedScrollHandler, useAnimatedStyle,
  useReducedMotion, useSharedValue, withDelay, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { EASE_OUT, SPRING, tap } from '../lib/motion';
import { C, FONT, R } from '../lib/theme';

const APressable = Animated.createAnimatedComponent(Pressable);
const ACircle = Animated.createAnimatedComponent(Circle);

// Espaço que a barra de abas flutuante ocupa embaixo (0 fora das abas).
export const TabSpace = createContext(0);

type Weight = keyof typeof FONT;

// Texto com a fonte da Ponte. Use sempre este no lugar do <Text> puro.
export function Txt({ w = 'regular', size = 15, color = C.ink, style, ...rest }: TextProps & { w?: Weight; size?: number; color?: string }) {
  const body = w === 'regular' || w === 'medium';
  const fs = (StyleSheet.flatten(style)?.fontSize as number | undefined) ?? size; // quem passa fontSize pelo style
  return (
    <Text
      {...rest}
      style={[{ fontFamily: FONT[w], fontSize: size, color }, body ? { lineHeight: Math.round(fs * 1.42) } : null, w === 'display' || w === 'heavy' ? { letterSpacing: -fs * 0.02 } : null, style]}
    />
  );
}

// Botão que "afunda" com mola ao tocar e dá uma vibração leve. Base de todos os toques do app.
export function Tap({ onPress, onPressIn, onPressOut, style, children, scaleTo = 0.96, haptic = true, ...rest }: Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>; children?: React.ReactNode; scaleTo?: number; haptic?: boolean;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => {
        scale.set(withSpring(scaleTo, SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
      style={[style, anim]}
    >
      {children}
    </APressable>
  );
}

// Os blocos da tela entram em cascata (de baixo para cima) só quando a tela abre.
function Stagger({ children }: { children: React.ReactNode }) {
  const [opening, setOpening] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOpening(false), 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {React.Children.toArray(children).map((child, i) => (
        <Animated.View
          key={React.isValidElement(child) && child.key != null ? child.key : i}
          entering={FadeInDown.duration(420).delay(opening ? Math.min(i, 7) * 45 : 0).easing(EASE_OUT)}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}

export type IconName = React.ComponentProps<typeof Feather>['name'];

// Tela padrão. O título grande some ao rolar e reaparece pequeno numa barrinha no topo.
export function Screen({ title, subtitle, right, children, scroll = true, header = false, eyebrow, eyebrowColor, footer }: {
  title?: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode; scroll?: boolean;
  header?: boolean; // tela com cabeçalho de navegação: não aplica o recuo superior
  eyebrow?: string; eyebrowColor?: string;
  footer?: React.ReactNode; // fica fixo embaixo, fora da rolagem
}) {
  const tabSpace = useContext(TabSpace);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  const bar = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [50, 90], [0, 1], 'clamp') }));
  const big = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 70], [1, 0], 'clamp'),
    transform: [{ translateY: interpolate(y.value, [-100, 0, 100], [20, 0, -12], 'clamp') }],
  }));

  const head = title ? (
    <Animated.View style={[s.head, big]}>
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: eyebrowColor ?? C.accent }} />
            <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>{eyebrow}</Txt>
          </View>
        ) : null}
        <Txt w="heavy" size={34} style={{ lineHeight: 38 }}>{title}</Txt>
        {subtitle ? <Txt color={C.sub} size={15}>{subtitle}</Txt> : null}
      </View>
      {right}
    </Animated.View>
  ) : null;
  const pad = { paddingBottom: (footer ? 24 : 56) + tabSpace };
  return (
    <SafeAreaView style={s.safe} edges={header ? [] : ['top']}>
      {scroll ? (
        <Animated.ScrollView contentContainerStyle={[s.content, pad]} keyboardShouldPersistTaps="handled" onScroll={onScroll} scrollEventThrottle={16}>
          <Stagger>
            {head}
            {children}
          </Stagger>
        </Animated.ScrollView>
      ) : (
        <View style={[s.content, { flex: 1 }]}>
          {head}
          {children}
        </View>
      )}
      {title && scroll && !header ? (
        <Animated.View pointerEvents="none" style={[s.topbar, bar]}>
          <Txt w="display" size={16} numberOfLines={1}>{title}</Txt>
        </Animated.View>
      ) : null}
      {footer ? <View style={s.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Card({ children, style, tone }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: 'night' | 'accent' | 'good' | 'flat' | 'sunk' }) {
  const bg = tone === 'night' ? C.night : tone === 'accent' ? C.accentSoft : tone === 'good' ? C.goodSoft : tone === 'sunk' ? C.sunk : C.card;
  const border = !tone || tone === 'flat';
  return <View style={[s.card, { backgroundColor: tone === 'flat' ? 'transparent' : bg }, border ? s.border : null, style]}>{children}</View>;
}

// Bloco de destaque escuro (ou na cor da função), com dois círculos suaves de enfeite.
export function Hero({ children, colors = [C.night, C.night2], style }: { children: React.ReactNode; colors?: [string, string]; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, style]}>
      <View pointerEvents="none" style={[s.orb, { width: 220, height: 220, right: -90, top: -110 }]} />
      <View pointerEvents="none" style={[s.orb, { width: 140, height: 140, right: -30, top: -60 }]} />
      {children}
    </LinearGradient>
  );
}

export function H({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Txt w="display" size={18} style={style}>{children}</Txt>;
}

export function P({ children, style, muted }: { children: React.ReactNode; style?: StyleProp<TextStyle>; muted?: boolean }) {
  return <Txt color={muted ? C.sub : C.ink} style={style}>{children}</Txt>;
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Txt w="mono" size={11} color={C.sub} style={[{ letterSpacing: 1.1, textTransform: 'uppercase' }, style]}>{children}</Txt>;
}

export function Section({ title, hint, right }: { title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt w="display" size={21}>{title}</Txt>
        {hint ? <Txt color={C.sub} size={14}>{hint}</Txt> : null}
      </View>
      {right}
    </View>
  );
}

export function Btn({ label, onPress, kind = 'primary', icon, disabled, color }: {
  label: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'accent' | 'soft'; icon?: IconName; disabled?: boolean; color?: string;
}) {
  const base = color ?? (kind === 'accent' ? C.accent : C.ink);
  const bg = kind === 'ghost' ? 'transparent' : kind === 'soft' ? C.sunk : base;
  const fg = kind === 'ghost' || kind === 'soft' ? (color ?? C.ink) : '#FFFFFF';
  return (
    <Tap
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.97}
      style={[s.btn, { backgroundColor: bg, borderColor: kind === 'ghost' ? C.line : bg, opacity: disabled ? 0.4 : 1 }]}
    >
      {icon ? <Feather name={icon} size={18} color={fg} /> : null}
      <Txt w="bold" size={16} color={fg}>{label}</Txt>
    </Tap>
  );
}

export function Chip({ label, active, onPress, color = C.ink }: { label: string; active?: boolean; onPress: () => void; color?: string }) {
  return (
    <Tap
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      scaleTo={0.92}
      style={[s.chip, active ? { backgroundColor: color, borderColor: color } : null]}
    >
      <Txt w="medium" size={14} color={active ? '#FFFFFF' : C.ink} style={{ lineHeight: 18 }}>{label}</Txt>
    </Tap>
  );
}

// Escolha entre poucas opções, com uma pílula que desliza até a opção marcada.
export function Segment<T extends string | boolean>({ options, value, onChange, color = C.ink }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; color?: string;
}) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(0);
  const each = w / options.length;
  useEffect(() => {
    x.set(withSpring(idx * each, SPRING));
  }, [idx, each, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  return (
    <View style={s.segment} onLayout={(e) => setW(e.nativeEvent.layout.width - 8)} accessibilityRole="radiogroup">
      {w > 0 ? <Animated.View style={[s.segPill, { width: each, backgroundColor: color }, pill]} /> : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => {
              if (!on) tap();
              onChange(o.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, paddingHorizontal: 6 }}
          >
            <Txt w={on ? 'bold' : 'medium'} size={14} color={on ? '#FFFFFF' : C.sub} numberOfLines={1} style={{ lineHeight: 18 }}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

// − valor +. O número "rola" para cima ou para baixo quando muda.
export function Stepper({ value, onChange, min = 1, max = 36, format, color = C.ink, soft = C.sunk }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; format: (v: number) => string; color?: string; soft?: string;
}) {
  const [dir, setDir] = useState(0); // 0 = ainda não mexeu: o número aparece sem animação
  const reduce = useReducedMotion();
  const go = (d: number) => {
    const v = Math.min(max, Math.max(min, value + d));
    if (v === value) return;
    setDir(d);
    onChange(v);
  };
  const btn = (d: number) => (
    <Tap
      onPress={() => go(d)}
      accessibilityRole="button"
      accessibilityLabel={d > 0 ? 'Aumentar' : 'Diminuir'}
      disabled={d > 0 ? value >= max : value <= min}
      scaleTo={0.88}
      style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: soft, alignItems: 'center', justifyContent: 'center', opacity: (d > 0 ? value >= max : value <= min) ? 0.4 : 1 }}
    >
      <Feather name={d > 0 ? 'plus' : 'minus'} size={20} color={color} />
    </Tap>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {btn(-1)}
      <View style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Animated.View key={value} entering={reduce || !dir ? undefined : (dir > 0 ? SlideInDown : SlideInUp).springify().damping(16).stiffness(260)}>
          <Txt w="display" size={24}>{format(value)}</Txt>
        </Animated.View>
      </View>
      {btn(1)}
    </View>
  );
}

// Número que conta até o valor (e acompanha quando ele muda).
export function CountUp({ value, format, style, fromZero = false, duration = 750 }: {
  value: number; format: (v: number) => string; style?: StyleProp<TextStyle>; fromZero?: boolean; duration?: number;
}) {
  const reduce = useReducedMotion();
  const start = fromZero && !reduce ? 0 : value;
  const from = useRef(start);
  const [shown, setShown] = useState(start);
  useEffect(() => {
    const a = from.current;
    const b = value;
    if (a === b || reduce) {
      from.current = b;
      setShown(b);
      return;
    }
    const start = Date.now();
    let raf = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const v = a + (b - a) * (1 - Math.pow(1 - t, 3));
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);
  return <Text style={[{ fontVariant: ['tabular-nums'] }, style]}>{format(shown)}</Text>;
}

// Linha de opções que desliza para o lado. Quando não cabe tudo, mostra uma barrinha embaixo
// (indica que dá para arrastar), rola sozinha até a opção escolhida (para ela nunca ficar
// escondida) e, com `peek`, dá uma "espiadinha" ao abrir.
const TRACK = 56;

export function ChipRow({ children, peek = false }: { children: React.ReactNode; peek?: boolean }) {
  const ref = useRef<Animated.ScrollView>(null);
  const [box, setBox] = useState(0);
  const [content, setContent] = useState(0);
  const spots = useRef<{ x: number; w: number }[]>([]);
  const items = React.Children.toArray(children);
  const activeIdx = items.findIndex((c) => React.isValidElement(c) && (c.props as { active?: boolean }).active);
  const x = useSharedValue(0);
  const nudge = useSharedValue(0);
  const peeked = useRef(false);
  const overflow = box > 0 && content > box + 4;
  const thumb = overflow ? Math.max(14, (box / content) * TRACK) : TRACK;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });
  const thumbStyle = useAnimatedStyle(() => {
    const max = content - box;
    const p = max > 0 ? Math.min(1, Math.max(0, x.value / max)) : 0;
    return { transform: [{ translateX: p * (TRACK - thumb) }] };
  });

  // Rola até a opção escolhida quando ela está fora da parte visível.
  useEffect(() => {
    if (!overflow || activeIdx < 0) return;
    const spot = spots.current[activeIdx];
    if (!spot) return;
    const left = x.get();
    if (spot.x >= left && spot.x + spot.w <= left + box) return;
    const first = !peeked.current;
    peeked.current = true; // já mostrou que dá para rolar: não precisa da espiadinha
    ref.current?.scrollTo({ x: Math.max(0, Math.min(spot.x - 24, content - box)), animated: !first });
  }, [overflow, activeIdx, box, content, x]);

  useEffect(() => {
    if (!peek || !overflow || peeked.current) return;
    peeked.current = true;
    // Empurra a linha um pouco para a esquerda e volta com mola: "tem mais aqui".
    nudge.set(withDelay(700, withSequence(withTiming(-48, { duration: 420, easing: EASE_OUT }), withSpring(0, { damping: 11, stiffness: 140 }))));
  }, [peek, overflow, nudge]);
  const nudgeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: nudge.get() }] }));

  return (
    <View style={{ gap: 8 }}>
      <Animated.ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        onLayout={(e) => setBox(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContent(w)}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[{ flexDirection: 'row', gap: 8 }, nudgeStyle]}>
          {items.map((c, i) => (
            <View
              key={React.isValidElement(c) && c.key != null ? c.key : i}
              onLayout={(e) => {
                spots.current[i] = { x: e.nativeEvent.layout.x, w: e.nativeEvent.layout.width };
              }}
            >
              {c}
            </View>
          ))}
        </Animated.View>
      </Animated.ScrollView>
      {overflow ? (
        <View style={s.track} accessible={false}>
          <Animated.View style={[s.thumb, { width: thumb }, thumbStyle]} />
        </View>
      ) : null}
    </View>
  );
}

export function Field({ value, onChangeText, prefix, placeholder, style, keyboard = 'decimal-pad', big, icon }: {
  value: string; onChangeText: (t: string) => void; prefix?: string; placeholder?: string; style?: StyleProp<ViewStyle>;
  keyboard?: 'decimal-pad' | 'default' | 'url'; big?: boolean; icon?: IconName;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[s.field, big && { minHeight: 68 }, focus && { borderColor: C.ink }, style]}>
      {icon ? <Feather name={icon} size={18} color={C.sub} style={{ marginRight: 8 }} /> : null}
      {prefix ? <Txt w="medium" size={big ? 22 : 16} color={C.sub} style={{ marginRight: 8, lineHeight: undefined }}>{prefix}</Txt> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.faint}
        keyboardType={keyboard}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[s.input, big && { fontSize: 30, fontFamily: FONT.display }]}
      />
    </View>
  );
}

// A barra cresce até o valor (e acompanha quando ele muda).
export function Bar({ value, color = C.ink, height = 8, track = C.sunk, delay = 0 }: { value: number; color?: string; height?: number; track?: string; delay?: number }) {
  const v = Math.max(0, Math.min(1, value));
  const w = useSharedValue(0);
  useEffect(() => {
    w.set(withDelay(delay, withTiming(v, { duration: 800, easing: EASE_OUT })));
  }, [v, w, delay]);
  const anim = useAnimatedStyle(() => ({ width: `${w.get() * 100}%` as `${number}%` }));
  return (
    <View style={[s.bar, { height, borderRadius: height / 2, backgroundColor: track }]}>
      <Animated.View style={[{ height: '100%', backgroundColor: color, borderRadius: height / 2 }, anim]} />
    </View>
  );
}

export function Ring({ value, size = 64, stroke = 8, color = C.good, track = C.sunk, children }: {
  value: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withTiming(v, { duration: 1000, easing: EASE_OUT }));
  }, [v, p]);
  const arc = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - p.get()),
    strokeOpacity: p.get() > 0.002 ? 1 : 0, // sem isso a ponta arredondada vira um pontinho no zero
  }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <ACircle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={`${circ} ${circ}`} strokeLinecap="round" animatedProps={arc} />
      </Svg>
      {children}
    </View>
  );
}

export function Row({ left, right, strong, dot }: { left: string; right: string; strong?: boolean; dot?: string }) {
  return (
    <View style={s.row}>
      {dot ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }} /> : null}
      <Txt w={strong ? 'bold' : 'regular'} color={strong ? C.ink : C.sub} style={{ flex: 1 }}>{left}</Txt>
      <Txt w={strong ? 'display' : 'medium'} size={strong ? 17 : 15} style={{ fontVariant: ['tabular-nums'] }}>{right}</Txt>
    </View>
  );
}

export function Icon({ name, size = 20, color = C.ink }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} />;
}

export function IconBox({ name, color, soft, size = 44 }: { name: IconName; color: string; soft: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.36, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={name} size={size * 0.46} color={color} />
    </View>
  );
}

export function Badge({ label, color, soft }: { label: string; color: string; soft: string }) {
  return (
    <View style={{ backgroundColor: soft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill, alignSelf: 'flex-start' }}>
      <Txt w="mono" size={10} color={color} style={{ letterSpacing: 0.8 }}>{label}</Txt>
    </View>
  );
}

// Explicação curta que abre e fecha: para termos como IOF e spread.
export function Explain({ title, children }: { title: string; children: string }) {
  const [open, setOpen] = useState(false);
  const turn = useSharedValue(0);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 45}deg` }] }));
  function toggle() {
    turn.set(withSpring(open ? 0 : 1, SPRING));
    setOpen(!open);
  }
  return (
    <Tap onPress={toggle} scaleTo={0.98} accessibilityRole="button" accessibilityState={{ expanded: open }} style={s.explain}>
      <Animated.View layout={LinearTransition.duration(260)} style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Txt w="bold" style={{ flex: 1 }}>{title}</Txt>
          <Animated.View style={[{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.sunk, alignItems: 'center', justifyContent: 'center' }, chevron]}>
            <Feather name="plus" size={16} color={C.ink} />
          </Animated.View>
        </View>
        {open ? (
          <Animated.View entering={FadeIn.duration(260)}>
            <Txt color={C.sub} size={14}>{children}</Txt>
          </Animated.View>
        ) : null}
      </Animated.View>
    </Tap>
  );
}

// Linha de toque padrão das listas: ícone, título, dica e setinha.
export function ListRow({ icon, color, soft, title, hint, onPress, last, right }: {
  icon: IconName; color: string; soft: string; title: string; hint?: string; onPress: () => void; last?: boolean; right?: React.ReactNode;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      scaleTo={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}
    >
      <IconBox name={icon} color={color} soft={soft} />
      <View style={{ flex: 1, gap: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Txt w="bold" size={16}>{title}</Txt>
          {right}
        </View>
        {hint ? <Txt color={C.sub} size={13}>{hint}</Txt> : null}
      </View>
      <Feather name="arrow-up-right" size={18} color={C.faint} />
    </Tap>
  );
}

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 22, paddingTop: 10, gap: 16 },
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 6, marginBottom: 4 },
  topbar: {
    position: 'absolute', top: 0, left: 0, right: 0, paddingVertical: 12, paddingHorizontal: 22, alignItems: 'center',
    backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  card: { borderRadius: R.lg, padding: 18, gap: 10 },
  border: { borderWidth: 1, borderColor: C.line },
  hero: { borderRadius: R.lg + 4, padding: 22, gap: 8, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)' },
  btn: { minHeight: 52, borderRadius: R.pill, borderWidth: 1, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, backgroundColor: C.card },
  segment: { flexDirection: 'row', padding: 4, borderRadius: R.pill, backgroundColor: C.sunk },
  segPill: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: R.pill },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent', borderRadius: R.md, backgroundColor: C.sunk, paddingHorizontal: 16, minHeight: 52 },
  input: { flex: 1, fontSize: 17, color: C.ink, fontFamily: FONT.bold, paddingVertical: 10 },
  bar: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  track: { alignSelf: 'center', width: TRACK, height: 4, borderRadius: 2, backgroundColor: C.sunk, overflow: 'hidden' },
  thumb: { height: 4, borderRadius: 2, backgroundColor: C.faint },
  footer: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line },
  explain: { backgroundColor: C.card, borderRadius: R.md + 2, borderWidth: 1, borderColor: C.line, padding: 16 },
});
