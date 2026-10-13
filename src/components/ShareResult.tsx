import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { PixelRatio, Platform, Share, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Logo } from './Logo';
import { Btn } from './ui';

export type ShareData = {
  kicker: string; // linha pequena de cima
  big: string; // número em destaque
  line: string; // frase principal
  detail: string; // explicação curta
  message: string; // texto usado quando não dá para mandar imagem
};

// Tamanho da imagem: 1080 x 1350 (formato de post do Instagram).
const W = 360;
const H = 450;

// Botão que gera uma imagem com o resultado e abre o menu de compartilhar do celular.
export function ShareResult({ data, label = 'Compartilhar resultado', color }: { data: ShareData; label?: string; color?: string }) {
  const card = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    try {
      const canShareFile = Platform.OS !== 'web' && (await Sharing.isAvailableAsync());
      if (!canShareFile || !card.current) {
        await Share.share({ message: data.message });
        return;
      }
      const uri = await captureRef(card, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: 1080 / PixelRatio.get(),
        height: 1350 / PixelRatio.get(),
      });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartilhar resultado' });
    } catch {
      // A pessoa fechou o menu ou a imagem falhou: tenta pelo menos o texto.
      await Share.share({ message: data.message }).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Btn label={busy ? 'Preparando...' : label} icon="share-2" kind="ghost" color={color} onPress={share} disabled={busy} />
      {/* Cartão desenhado fora da tela: só existe para virar imagem. */}
      <View style={{ position: 'absolute', left: -10000, top: 0 }} pointerEvents="none" aria-hidden>
        <View ref={card} collapsable={false} style={{ width: W, height: H }}>
          <ShareCard data={data} />
        </View>
      </View>
    </>
  );
}

function ShareCard({ data }: { data: ShareData }) {
  return (
    <LinearGradient colors={['#0F2338', '#1D4E7E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 28, justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Logo size={44} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>ponte</Text>
      </View>
      <View style={{ gap: 6 }}>
        <Text style={{ color: '#9FB4CC', fontSize: 13, fontWeight: '800', letterSpacing: 1 }}>{data.kicker.toUpperCase()}</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', lineHeight: 28 }}>{data.line}</Text>
        <Text style={{ color: '#FF7A45', fontSize: 52, fontWeight: '800', letterSpacing: -1.5 }}>{data.big}</Text>
        <Text style={{ color: '#C8D6E5', fontSize: 15, lineHeight: 21 }}>{data.detail}</Text>
      </View>
      <Text style={{ color: '#9FB4CC', fontSize: 12 }}>Calculado no app Ponte · estimativa com taxas médias de mercado</Text>
    </LinearGradient>
  );
}
