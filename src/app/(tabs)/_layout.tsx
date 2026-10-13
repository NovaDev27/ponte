import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, ColorValue, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SPRING, tap } from '../../lib/motion';
import { useApp } from '../../lib/store';
import { C, F } from '../../lib/theme';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

// A "pílula" colorida da aba abre com mola e o ícone dá um pulinho.
function TabIcon({ name, color, focused, tint }: { name: FeatherName; color: ColorValue; focused: boolean; tint: string }) {
  const f = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    f.set(withSpring(focused ? 1 : 0, SPRING));
  }, [focused, f]);
  const pill = useAnimatedStyle(() => ({ opacity: f.get(), transform: [{ scaleX: 0.4 + f.get() * 0.6 }] }));
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: -1.5 * f.get() }, { scale: 1 + 0.1 * f.get() }] }));
  return (
    <View style={{ width: 48, height: 30, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: 48, height: 30, borderRadius: 15, backgroundColor: tint }, pill]} />
      <Animated.View style={icon}>
        <Feather name={name} size={20} color={color as string} />
      </Animated.View>
    </View>
  );
}

const TABS: { name: string; title: string; icon: FeatherName; color: string; soft: string }[] = [
  { name: 'index', title: 'Início', icon: 'home', color: C.primary, soft: C.primarySoft },
  { name: 'orcamento', title: 'Orçamento', icon: 'pie-chart', color: F.orcamento.color, soft: F.orcamento.soft },
  { name: 'cambio', title: 'Câmbio', icon: 'repeat', color: F.cambio.color, soft: F.cambio.soft },
  { name: 'checklist', title: 'Checklist', icon: 'check-square', color: F.checklist.color, soft: F.checklist.soft },
  { name: 'assistente', title: 'Assistente', icon: 'message-circle', color: F.assistente.color, soft: F.assistente.soft },
];

export default function TabLayout() {
  const { ready, state } = useApp();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }
  if (!state.onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenListeners={{ tabPress: () => tap() }}
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: C.faint,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.line, height: 68, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarActiveTintColor: t.color,
            tabBarIcon: ({ color, focused }) => <TabIcon name={t.icon} color={color} focused={focused} tint={t.soft} />,
          }}
        />
      ))}
    </Tabs>
  );
}
