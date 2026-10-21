import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { Logo } from '../components/Logo';
import { Btn, Txt } from '../components/ui';
import { installGlobalErrorReporter, reportError } from '../lib/report';
import { AppProvider } from '../lib/store';
import { C, FONT } from '../lib/theme';

installGlobalErrorReporter();
SplashScreen.preventAutoHideAsync().catch(() => {});

// Se alguma tela quebrar: mostra uma mensagem amigável e envia o relatório técnico.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    reportError(error, 'tela');
  }, [error]);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
      <Logo size={96} />
      <Txt w="display" size={24} style={{ textAlign: 'center' }}>Ops, algo deu errado</Txt>
      <Txt color={C.sub} style={{ textAlign: 'center', maxWidth: 320 }}>
        Já recebemos um aviso técnico para corrigir. Os seus dados continuam salvos no celular.
      </Txt>
      <View style={{ width: '100%', maxWidth: 320 }}>
        <Btn label="Tentar de novo" icon="refresh-cw" onPress={retry} />
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, failed] = useFonts({
    BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, DMMono_500Medium,
  });
  const ok = loaded || !!failed; // se a fonte falhar, segue com a do sistema
  useEffect(() => {
    if (ok) SplashScreen.hideAsync().catch(() => {});
  }, [ok]);
  if (!ok) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Background />
        <Stack
          screenOptions={{
            headerTintColor: C.ink,
            headerStyle: { backgroundColor: C.bg },
            headerShadowVisible: false,
            headerTitleStyle: { color: C.ink, fontFamily: FONT.display, fontSize: 18 },
            headerBackTitle: 'Voltar',
            contentStyle: { backgroundColor: C.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="pais/[code]" options={{ title: '' }} />
          <Stack.Screen name="guia-cripto" options={{ title: 'Stablecoins com segurança' }} />
          <Stack.Screen name="ajustes" options={{ title: 'Ajustes' }} />
          <Stack.Screen name="feedback" options={{ title: 'Sua opinião' }} />
          <Stack.Screen name="guia-cartoes" options={{ title: 'Qual cartão levar' }} />
          <Stack.Screen name="onde-buscar" options={{ title: 'Onde buscar' }} />
          <Stack.Screen name="completo" options={{ title: 'Ponte Completo' }} />
          <Stack.Screen name="simulacao" options={{ title: 'Envios mensais' }} />
          <Stack.Screen name="alerta" options={{ title: 'Alerta de cotação' }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
