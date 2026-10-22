import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, interpolate, type SharedValue, SlideInDown, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Place, PLACES } from '../data/places';
import { C, R } from '../lib/theme';
import { useWiki, WIKI_HEADERS, type WikiInfo } from '../lib/wiki';
import { Btn, Tap, Txt } from './ui';

// Foto que aparece suave quando termina de carregar. Sem foto (ou sem internet): fundo azul com o emoji.
function Photo({ uri, emoji, style }: { uri?: string; emoji: string; style?: object }) {
  const o = useSharedValue(0);
  const st = useAnimatedStyle(() => ({ opacity: o.get() }));
  return (
    <View style={[{ backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}>
      <Txt size={54} style={{ lineHeight: 64, opacity: 0.9 }}>{emoji}</Txt>
      {uri ? (
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, st]}>
          {/* No celular vai em lista de propósito: o <Image> do Android só envia os headers quando a fonte é uma lista. */}
          <Image source={Platform.OS === 'web' ? { uri } : [{ uri, headers: WIKI_HEADERS }]} resizeMode="cover" style={{ width: '100%', height: '100%' }} onLoad={() => o.set(withTiming(1, { duration: 450 }))} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function Caption({ place, big }: { place: Place; big?: boolean }) {
  return (
    <>
      <LinearGradient colors={['transparent', 'rgba(10,12,16,0.85)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%' }} pointerEvents="none" />
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 }} pointerEvents="none">
        <Txt w="mono" size={11} color={C.navyLight} style={{ letterSpacing: 1.2 }}>{place.kind.toUpperCase()} · {place.city.toUpperCase()}</Txt>
        <Txt w="display" size={big ? 24 : 19} color="#FFFFFF" numberOfLines={2}>{place.name}</Txt>
      </View>
    </>
  );
}

// Resumo enxuto: tira os parênteses (nomes em outras línguas, siglas) e corta em ~2 frases.
function tidy(text?: string) {
  if (!text) return '';
  let t = text;
  for (let i = 0; i < 3; i++) t = t.replace(/\s*\([^()]*\)/g, '');
  t = t.replace(/\s+([,.;])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  if (t.length <= 340) return t;
  const cut = t.slice(0, 340);
  const end = cut.lastIndexOf('. ');
  return end > 120 ? cut.slice(0, end + 1) : cut.trimEnd() + '…';
}

// Detalhe do lugar: sobe de baixo com foto grande, resumo e link para a Wikipédia.
function Sheet({ place, info, onClose }: { place: Place | null; info?: WikiInfo; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!place} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(10,12,16,0.5)' }} accessibilityLabel="Fechar" />
      {place ? (
        <Animated.View entering={SlideInDown.springify().damping(18).stiffness(160)} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', paddingBottom: insets.bottom + 16, maxHeight: '88%' }}>
          <ScrollView>
            <View>
              <Photo uri={info?.img} emoji={place.emoji} style={{ height: 260 }} />
              <Caption place={place} big />
              <Tap onPress={onClose} accessibilityLabel="Fechar" style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(10,12,16,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="x" size={18} color="#FFFFFF" />
              </Tap>
            </View>
            <View style={{ padding: 20, gap: 14 }}>
              <Txt size={16}>{tidy(info?.text) || 'Sem resumo agora. Abra na Wikipédia para ler mais sobre este lugar.'}</Txt>
              <Btn label="Ler na Wikipédia" icon="book-open" kind="ghost" onPress={() => Linking.openURL(info?.url ?? `https://pt.wikipedia.org/wiki/${encodeURIComponent(place.wiki)}`)} />
              <Txt size={12} color={C.faint}>Foto e texto: Wikipédia, a enciclopédia livre (licença CC BY-SA).</Txt>
            </View>
          </ScrollView>
        </Animated.View>
      ) : null}
    </Modal>
  );
}

const CARD_W = 248;
const CARD_H = 320;
const GAP = 12;

// Carrossel de lugares: os cartões deslizam com efeito de profundidade (a foto anda mais devagar que o cartão).
export function PlacesCarousel({ code, city }: { code: string; city?: string }) {
  const { data } = useWiki(code);
  const [open, setOpen] = useState<Place | null>(null);
  const all = PLACES[code] ?? [];
  // A cidade da pessoa vem primeiro.
  const list = city ? [...all.filter((p) => p.city === city), ...all.filter((p) => p.city !== city)] : all;
  const x = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.value = e.contentOffset.x;
  });
  if (!list.length) return null;
  return (
    <>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ marginHorizontal: -22 }}
        contentContainerStyle={{ paddingHorizontal: 22, gap: GAP }}
      >
        {list.map((pl, i) => (
          <CarouselCard key={pl.wiki} place={pl} i={i} x={x} img={data?.[pl.wiki]?.img} onPress={() => setOpen(pl)} />
        ))}
      </Animated.ScrollView>
      <Sheet place={open} info={open ? data?.[open.wiki] : undefined} onClose={() => setOpen(null)} />
    </>
  );
}

function CarouselCard({ place, i, x, img, onPress }: { place: Place; i: number; x: SharedValue<number>; img?: string; onPress: () => void }) {
  const S = CARD_W + GAP;
  const card = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(x.value, [(i - 1) * S, i * S, (i + 1) * S], [0.95, 1, 0.95], 'clamp') }] }));
  const photo = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(x.value, [(i - 1) * S, i * S, (i + 1) * S], [-36, 0, 36], 'clamp') }] }));
  return (
    <Animated.View entering={FadeInDown.duration(420).delay(i * 70)} >
      <Animated.View style={card}>
        <Tap onPress={onPress} scaleTo={0.97} accessibilityRole="button" accessibilityLabel={`${place.name}, ${place.city}`}
          style={{ width: CARD_W, height: CARD_H, borderRadius: R.lg, overflow: 'hidden' }}>
          <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: -40, right: -40 }, photo]}>
            <Photo uri={img} emoji={place.emoji} style={{ flex: 1 }} />
          </Animated.View>
          <Caption place={place} />
        </Tap>
      </Animated.View>
    </Animated.View>
  );
}

// Lista grande (tela "Lugares"): um cartão largo por lugar.
export function PlacesList({ code, city }: { code: string; city: string | null }) {
  const { data, failed } = useWiki(code);
  const [open, setOpen] = useState<Place | null>(null);
  const list = (PLACES[code] ?? []).filter((p) => !city || p.city === city);
  return (
    <View style={{ gap: 12 }}>
      {failed ? <Txt size={13} color={C.sub}>Sem internet agora: as fotos aparecem quando a conexão voltar.</Txt> : null}
      {list.map((pl, i) => (
        <Animated.View key={`${code}-${pl.wiki}`} entering={FadeInDown.duration(420).delay(i * 60)}>
          <Tap onPress={() => setOpen(pl)} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={`${pl.name}, ${pl.city}`}
            style={{ height: 210, borderRadius: R.lg, overflow: 'hidden' }}>
            <Photo uri={data?.[pl.wiki]?.img} emoji={pl.emoji} style={{ flex: 1 }} />
            <Caption place={pl} big />
          </Tap>
        </Animated.View>
      ))}
      {list.length === 0 ? (
        <Animated.View entering={FadeIn} style={{ padding: 20, alignItems: 'center' }}>
          <Txt color={C.sub} style={{ textAlign: 'center' }}>Ainda não temos lugares desta cidade. Veja os outros da lista em “Todas”.</Txt>
        </Animated.View>
      ) : null}
      <Sheet place={open} info={open ? data?.[open.wiki] : undefined} onClose={() => setOpen(null)} />
    </View>
  );
}
