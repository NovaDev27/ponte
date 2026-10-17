import { type ErrorBoundaryProps, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { Logo } from '../components/Logo';
import { Btn } from '../components/ui';
import { installGlobalErrorReporter, reportError } from '../lib/report';
import { captureError, initSentry, wrapRoot } from '../lib/sentry';
import { AppProvider } from '../lib/store';
import { C } from '../lib/theme';

initSentry();
installGlobalErrorReporter();

// Se alguma tela quebrar: mostra uma mensagem amigável e envia o relatório técnico.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    reportError(error, 'tela');
    captureError(error);
  }, [error]);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
      <Logo size={96} />
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, textAlign: 'center' }}>Ops, algo deu errado</Text>
      <Text style={{ fontSize: 15, color: C.sub, textAlign: 'center', maxWidth: 320, lineHeight: 21 }}>
        Já recebemos um aviso técnico para corrigir. Os seus dados continuam salvos no celular.
      </Text>
      <View style={{ width: '100%', maxWidth: 320 }}>
        <Btn label="Tentar de novo" icon="refresh-cw" onPress={retry} />
      </View>
    </View>
  );
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Background />
        <Stack
          screenOptions={{
            headerTintColor: C.primary,
            headerStyle: { backgroundColor: C.bg },
            headerShadowVisible: false,
            headerTitleStyle: { color: C.ink, fontWeight: '700' },
            headerBackTitle: 'Voltar',
            contentStyle: { backgroundColor: C.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
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

export default wrapRoot(RootLayout);
