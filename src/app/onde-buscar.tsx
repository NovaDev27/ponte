import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Card, Chip, ChipRow, H, IconBox, Label, P, Screen } from '../components/ui';
import { COUNTRIES, getCountry } from '../data/countries';
import { GENERAL_LINKS, LINK_KINDS, LinkKind, OFFICIAL_LINKS, OfficialLink } from '../data/links';
import { useApp } from '../lib/store';
import { C, F } from '../lib/theme';

const ORDER: LinkKind[] = ['visto', 'escolas', 'estudar', 'bolsas', 'embaixada'];

export default function OndeBuscar() {
  const { state } = useApp();
  const [code, setCode] = useState(state.profile.country);
  const country = getCountry(code);
  const links = OFFICIAL_LINKS[code] ?? [];

  return (
    <Screen header>
      <P muted>Só sites oficiais: governos, agências de educação e as embaixadas do Brasil. Use para conferir visto, escola e bolsa antes de fechar qualquer coisa.</P>

      <ChipRow>
        {COUNTRIES.map((c) => (
          <Chip key={c.code} label={`${c.flag} ${c.name}`} active={c.code === code} color={F.checklist.color} onPress={() => setCode(c.code)} />
        ))}
      </ChipRow>

      {ORDER.map((kind) => {
        const items = links.filter((l) => l.kind === kind);
        if (!items.length) return null;
        return (
          <Card key={kind}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <IconBox name={LINK_KINDS[kind].icon} color={F.checklist.color} soft={F.checklist.soft} size={36} />
              <H>{LINK_KINDS[kind].title}</H>
            </View>
            {items.map((l) => <LinkRow key={l.url} link={l} />)}
          </Card>
        );
      })}

      <Card tone="accent">
        <H>Antes de pagar uma escola ou agência</H>
        <P>Confira se a escola aparece na lista oficial de credenciadas de {country.name}. Desconfie de promessa de visto garantido e de pagamento por fora.</P>
      </Card>

      <Label>Para qualquer país</Label>
      <Card>{GENERAL_LINKS.map((l) => <LinkRow key={l.url} link={l} />)}</Card>

      <P muted style={{ fontSize: 12 }}>Links conferidos em 12/10/2026. Sites de governo mudam de endereço: se algum não abrir, procure pelo nome no Google.</P>
    </Screen>
  );
}

function LinkRow({ link }: { link: OfficialLink }) {
  const host = link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  return (
    <Pressable
      onPress={() => Linking.openURL(link.url)}
      accessibilityRole="link"
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}
    >
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ color: C.ink, fontWeight: '700', fontSize: 15 }}>{link.label}</Text>
        <Text style={{ color: C.sub, fontSize: 12 }}>{host}</Text>
      </View>
      <Feather name="external-link" size={18} color={C.primary} />
    </Pressable>
  );
}
