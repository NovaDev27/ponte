import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BAR_GAP, BAR_H, TabBar } from '../../components/TabBar';
import { TabSpace } from '../../components/ui';
import { useApp } from '../../lib/store';
import { C } from '../../lib/theme';

const TABS = [
  { name: 'index', title: 'Início' },
  { name: 'orcamento', title: 'Orçamento' },
  { name: 'cambio', title: 'Câmbio' },
  { name: 'checklist', title: 'Checklist' },
  { name: 'assistente', title: 'Orbi' },
];

export default function TabLayout() {
  const { ready, state } = useApp();
  const insets = useSafeAreaInsets();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }
  if (!state.onboarded) return <Redirect href="/onboarding" />;
  return (
    <TabSpace.Provider value={BAR_H + BAR_GAP + insets.bottom + 8}>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, animation: 'shift', sceneStyle: { backgroundColor: C.bg } }}
      >
        {TABS.map((t) => (
          <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
        ))}
      </Tabs>
    </TabSpace.Provider>
  );
}
