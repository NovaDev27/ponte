# Ponte

App de celular para estudantes brasileiros planejarem o intercâmbio sem perder dinheiro no câmbio.

- **Câmbio (Quanto chega):** compara 5 jeitos de levar dinheiro (conta global, stablecoin, remessa, cartão, espécie) com IOF, spread e tarifas, usando a cotação do dia.
- **Orçamento:** custo de vida estimado para 13 países e 33 cidades, editável, com total da viagem.
- **Checklist:** do planejamento à primeira semana no destino, com itens específicos de cada país.
- **Assistente:** chat com IA (Claude) sobre câmbio, documentos e vida lá fora.
- **Guia de stablecoins:** como usar USDC como meio de transferência e os riscos.

Feito com Expo (React Native) e Expo Router. Os dados ficam só no aparelho.

## Rodar no celular

1. Instale o app **Expo Go** no celular (Play Store ou App Store).
2. No computador, dentro desta pasta:

   ```bash
   npm install
   npx expo start
   ```

3. Leia o QR code com o Expo Go (Android) ou com a câmera (iPhone). Celular e computador precisam estar na mesma rede Wi-Fi.

## Assistente com IA

O assistente precisa de um pequeno servidor, para que a chave da API não fique dentro do app.

1. Crie uma chave em https://platform.claude.com e defina a variável `ANTHROPIC_API_KEY`.
2. Instale e rode o servidor:

   ```bash
   cd server
   npm install
   cd ..
   npm run server
   ```

3. No app, abra **Ajustes → Servidor do assistente** e coloque o endereço do computador na rede, por exemplo `http://192.168.0.10:8787` (no Windows, veja o IP com `ipconfig`).

Para publicar de verdade, hospede a pasta `server/` num serviço de nuvem e coloque esse endereço no app.

## Publicar nas lojas

Use o EAS Build: `npx eas-cli@latest build`. Veja https://docs.expo.dev/eas/

## Avisos

- Taxas, IOF e regras de visto mudam. Os valores são referências editáveis em Ajustes.
- A Ponte não movimenta dinheiro e não faz recomendação de investimento.
