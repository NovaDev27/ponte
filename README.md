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

O assistente precisa de um pequeno servidor (pasta `server/`), para que a chave da API não fique dentro do app.

### Configurar

1. Crie uma chave em https://platform.claude.com (começa com `sk-ant-`) e defina um limite de gasto mensal na conta.
2. Copie `server/.env.example` para `server/.env` e preencha:
   - `ANTHROPIC_API_KEY`: a chave.
   - `PONTE_APP_TOKEN`: uma senha longa e aleatória, compartilhada com o app.
3. Copie `.env.example` (na raiz) para `.env` e coloque a mesma senha em `EXPO_PUBLIC_PONTE_TOKEN`.
4. Rode:

   ```bash
   npm --prefix server install
   npm run server
   ```

5. No app, abra **Ajustes → Servidor do assistente** e coloque o endereço do servidor. No celular, use o IP do computador na rede (ex.: `http://192.168.0.10:8787`; no Windows, veja com `ipconfig`).

Os arquivos `.env` nunca vão para o GitHub.

### Proteções

- **Senha do app** (`PONTE_APP_TOKEN`): o servidor só responde a quem envia a senha. Ela fica dentro do app, então é uma barreira contra uso casual, não um cofre.
- **Limites por aparelho:** 20 perguntas por hora e 50 por dia (`LIMIT_HOUR`, `LIMIT_DAY`). Por IP, o limite é 5 vezes maior, porque várias pessoas podem dividir o mesmo Wi-Fi.
- **Limite total por dia:** 500 perguntas (`LIMIT_GLOBAL_DAY`), para o custo nunca disparar.
- **Tamanho máximo:** 1.000 caracteres por pergunta, 12 mensagens de histórico e 4.000 tokens por resposta.
- `GET /health` mostra quantas perguntas foram feitas hoje, sem dados pessoais.

Para colocar na internet, hospede a pasta `server/` num serviço que rode Node.js 20 ou mais novo, com o comando `npm start` e as mesmas variáveis do `.env`.

## Publicar nas lojas

Use o EAS Build: `npx eas-cli@latest build`. Veja https://docs.expo.dev/eas/

## Avisos

- Taxas, IOF e regras de visto mudam. Os valores são referências editáveis em Ajustes.
- A Ponte não movimenta dinheiro e não faz recomendação de investimento.
