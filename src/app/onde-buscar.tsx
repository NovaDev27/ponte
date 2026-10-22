import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Linking, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PlacesCarousel } from '../components/Places';
import { Card, Chip, ChipRow, P, Screen, Section, Tap, Txt } from '../components/ui';
import { COUNTRIES, getCountry } from '../data/countries';
import { GENERAL_LINKS, LINK_KINDS, LinkKind, OFFICIAL_LINKS, OfficialLink } from '../data/links';
import { useApp } from '../lib/store';
import { C, R } from '../lib/theme';

const ORDER: LinkKind[] = ['visto', 'escolas', 'estudar', 'bolsas', 'embaixada'];

export default function OndeBuscar() {
  const { state } = useApp();
  const [code, setCode] = useState(state.profile.country);
  const country = getCountry(code);
  const links = OFFICIAL_LINKS[code] ?? [];
  const order = links.slice().sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind)); // para a cascata de entrada

  return (
    <Screen header>
      <P muted>Só sites oficiais: governos, agências de educação e as embaixadas do Brasil. Confira visto, escola e bolsa antes de fechar qualquer coisa.</P>

      <ChipRow>
        {COUNTRIES.map((c) => (
          <Chip key={c.code} label={`${c.flag} ${c.name}`} active={c.code === code} color={C.navy} onPress={() => setCode(c.code)} />
        ))}
      </ChipRow>

      <Section
        title={`Conheça ${country.name}`}
        right={
          <Tap onPress={() => router.push({ pathname: '/lugares', params: { code } })} hitSlop={10}>
            <Txt w="bold" size={14} color={C.navy}>Ver todos</Txt>
          </Tap>
        }
      />
      <PlacesCarousel key={code} code={code} />

      <Section title="Sites oficiais" hint="Toque para abrir no navegador" />
      {ORDER.map((kind) => {
        const items = links.filter((l) => l.kind === kind);
        if (!items.length) return null;
        return (
          <View key={`${code}-${kind}`} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Feather name={LINK_KINDS[kind].icon} size={14} color={C.sub} />
              <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.1 }}>{LINK_KINDS[kind].title.toUpperCase()}</Txt>
            </View>
            {items.map((l) => <SiteCard key={l.url} link={l} delay={order.indexOf(l) * 50} />)}
          </View>
        );
      })}

      <Card tone="night">
        <Txt w="display" size={17} color={C.cream}>Antes de pagar uma escola ou agência</Txt>
        <Txt size={14} color={C.creamSub}>Confira se a escola aparece na lista oficial de credenciadas de {country.name}. Desconfie de promessa de visto garantido e de pagamento por fora.</Txt>
      </Card>

      <View style={{ gap: 8 }}>
        <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.1 }}>PARA QUALQUER PAÍS</Txt>
        {GENERAL_LINKS.map((l) => <SiteCard key={l.url} link={l} delay={0} />)}
      </View>

      <P muted style={{ fontSize: 12 }}>Links conferidos em 12/10/2026. Sites de governo mudam de endereço: se algum não abrir, procure pelo nome no Google. Os ícones dos sites vêm do serviço de ícones do Google.</P>
    </Screen>
  );
}

// Cartão do site: ícone do próprio site e o endereço numa "barra de navegador".
function SiteCard({ link, delay }: { link: OfficialLink; delay: number }) {
  const host = link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  const [broken, setBroken] = useState(false);
  return (
    <Animated.View entering={FadeInDown.duration(380).delay(delay)}>
      <Tap onPress={() => Linking.openURL(link.url)} accessibilityRole="link" accessibilityLabel={`${link.label}, ${host}`} scaleTo={0.98}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: R.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.line }}>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.navySoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {broken ? (
            <Txt w="heavy" size={22} color={C.navy}>{host[0].toUpperCase()}</Txt>
          ) : (
            <Image source={{ uri: `https://www.google.com/s2/favicons?domain=${host}&sz=128` }} style={{ width: 32, height: 32 }} onError={() => setBroken(true)} />
          )}
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt w="bold" size={15}>{link.label}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: C.sunk, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4, maxWidth: '100%' }}>
            <Feather name="lock" size={11} color={C.sub} />
            <Txt w="mono" size={11} color={C.sub} numberOfLines={1} style={{ flexShrink: 1 }}>{host}</Txt>
          </View>
        </View>
        <Feather name="arrow-up-right" size={18} color={C.faint} />
      </Tap>
    </Animated.View>
  );
}
