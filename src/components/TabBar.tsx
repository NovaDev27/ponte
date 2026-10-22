import Feather from '@expo/vector-icons/Feather';
import type { BottomTabBarProps } from 'expo-router/tabs';
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { EASE_OUT, SNAP, tap } from '../lib/motion';
import { C, R } from '../lib/theme';
import { IconName, Txt } from './ui';

export const BAR_H = 64;
export const BAR_GAP = 12;

const ICONS: Record<string, IconName> = {
  index: 'compass',
  orcamento: 'pie-chart',
  cambio: 'repeat',
  checklist: 'check-circle',
  assistente: 'message-circle',
};

export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const [w, setW] = useState(0);
  const each = w / state.routes.length;
  const x = useSharedValue(0);
  const hidden = useSharedValue(0);
  const kb = useKeyboardOpen();

  useEffect(() => {
    x.set(withSpring(state.index * each, SNAP));
  }, [state.index, each, x]);

  useEffect(() => {
    hidden.set(withTiming(kb ? 1 : 0, { duration: 240, easing: EASE_OUT }));
  }, [kb, hidden]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const bar = useAnimatedStyle(() => ({
    opacity: 1 - hidden.get(),
    transform: [{ translateY: hidden.get() * 110 }],
  }));

  return (
    <Animated.View
      pointerEvents={kb ? 'none' : 'box-none'}
      style={[{ position: 'absolute', left: 18, right: 18, bottom: insets.bottom + BAR_GAP }, bar]}
    >
      <View
        style={{
          height: BAR_H,
          borderRadius: R.pill,
          backgroundColor: C.night,
          padding: 5,
          flexDirection: 'row',
          boxShadow: '0px 12px 32px rgba(18,20,24,0.28)',
        }}
        onLayout={(e) => setW(e.nativeEvent.layout.width - 10)}
      >
        {w > 0 ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 5,
                bottom: 5,
                left: 5,
                width: each,
                borderRadius: R.pill,
                backgroundColor: C.cream,
              },
              pill,
            ]}
          />
        ) : null}
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  tap();
                  navigation.navigate(route.name, route.params);
                }
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}
            >
              <TabIcon name={ICONS[route.name] ?? 'circle'} focused={focused} />
              <Txt
                w={focused ? 'bold' : 'medium'}
                size={10}
                color={focused ? C.ink : C.creamSub}
                numberOfLines={1}
                style={{ lineHeight: 12 }}
              >
                {label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const s = useSharedValue(1);
  useEffect(() => {
    if (focused) {
      s.set(0.78);
      s.set(withSpring(1, { damping: 10, stiffness: 320 }));
    }
  }, [focused, s]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));
  return (
    <Animated.View style={st}>
      <Feather name={name} size={18} color={focused ? C.ink : C.creamSub} />
    </Animated.View>
  );
}
