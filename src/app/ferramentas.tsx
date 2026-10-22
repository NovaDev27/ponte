import { router, type Href } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Badge, Card, IconName, ListRow, Screen, Txt } from '../components/ui';
import { getCountry } from '../data/countries';
import { COMPLETO_GRATIS } from '../lib/completo';
import { useApp } from '../lib/store';
import { C, F } from '../lib/theme';

type Item = { href: Href; icon: IconName; title: string; hint: string; f: { color: string; soft: string }; completo?: boolean };

// Todas as ferramentas da Ponte num lugar só, separadas por assunto.
export default function Ferramentas() {
  const { state } = useApp();
  const country = getCountry(state.profile.country);

  const groups: { title: string; items: Item[] }[] = [
    {
      title: 'Dinheiro',
      items: [
        { href: '/guia-cartoes', icon: 'credit-card', title: 'Qual cartão levar', hint: 'Seu cartão, taxas lá fora e o que levar', f: F.cambio },
        { href: '/alerta', icon: 'bell', title: 'Alerta de cotação', hint: 'Aviso quando a moeda ficar mais barata', f: F.orcamento, completo: true },
        { href: '/simulacao', icon: 'trending-up', title: 'Envios mensais', hint: 'Quanto chega quando alguém manda todo mês', f: F.cambio, completo: true },
        { href: '/guia-cripto', icon: 'shield', title: 'Stablecoins', hint: 'Qual usar para enviar, as redes e os riscos', f: F.cripto },
      ],
    },
    {
      title: `Destino · ${country.name}`,
      items: [
        { href: '/lugares', icon: 'map', title: 'Lugares', hint: 'Pontos turísticos, bairros e passeios', f: F.orcamento },
        { href: `/pais/${country.code}`, icon: 'file-text', title: 'Custo, visto e regras', hint: `Tudo sobre ${country.name} numa página`, f: F.checklist },
        { href: '/onde-buscar', icon: 'search', title: 'Onde buscar', hint: 'Sites oficiais de visto, escolas e bolsas', f: F.checklist },
      ],
    },
    {
      title: 'Ponte',
      items: [
        { href: '/completo', icon: 'star', title: 'Ponte Completo', hint: 'Plano em PDF, alertas e prazos', f: F.assistente },
        { href: '/feedback', icon: 'heart', title: 'Sua opinião', hint: 'Leva 2 minutos e ajuda muito', f: F.assistente },
        { href: '/ajustes', icon: 'sliders', title: 'Ajustes', hint: 'Destino, taxas e seus dados', f: F.assistente },
      ],
    },
  ];

  return (
    <Screen header>
      {groups.map((g) => (
        <View key={g.title} style={{ gap: 8 }}>
          <Txt w="mono" size={11} color={C.sub} style={{ letterSpacing: 1.2 }}>{g.title.toUpperCase()}</Txt>
          <Card style={{ paddingVertical: 2, gap: 0 }}>
            {g.items.map((it, i) => (
              <ListRow
                key={it.title}
                icon={it.icon}
                color={it.f.color}
                soft={it.f.soft}
                title={it.title}
                hint={it.hint}
                onPress={() => router.push(it.href)}
                last={i === g.items.length - 1}
                right={it.completo && !COMPLETO_GRATIS ? <Badge label="COMPLETO" color={C.accent} soft={C.accentSoft} /> : null}
              />
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}
