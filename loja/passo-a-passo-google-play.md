# Passo a passo: da conta do Google Play até os testadores

Siga na ordem. Marque cada caixinha ao terminar.
Os textos para copiar estão em `textos-da-loja.md` e as imagens na pasta `loja/`.
Os nomes dos botões podem mudar um pouco: se não achar, procure algo parecido no menu da esquerda.

---

## ETAPA 1 · Criar a conta de desenvolvedor (você, ~30 min + espera)

- [ ] 1. Entre em **play.google.com/console/signup** com o **e-mail da Ponte** (ponteappworkflow@gmail.com).
- [ ] 2. Escolha **"Para você mesmo" / conta pessoal**.
- [ ] 3. **Nome do desenvolvedor** (aparece na loja embaixo do nome do app): `Ponte`
- [ ] 4. Preencha **nome completo, endereço e telefone**. Precisam ser **iguais ao seu documento**, senão a verificação falha.
- [ ] 5. **E-mail de contato** que aparece na loja: `ponteappworkflow@gmail.com`
- [ ] 6. Responda as perguntas sobre experiência com apps (pode dizer que é o primeiro app).
- [ ] 7. Pague a taxa de **US$ 25** (uma vez só). Você mesmo coloca o cartão.
- [ ] 8. **Verificação de identidade:** envie foto do documento (RG ou CNH) quando pedir.
- [ ] 9. **Verificação do celular:** o Google pode pedir para instalar o app **Google Play Console** num celular Android e entrar com a mesma conta. Faça isso no seu celular.
- [ ] 10. Espere o e-mail de aprovação. Pode levar **de algumas horas a alguns dias**.

⚠️ Precisa ter **18 anos**. Se for menor, um responsável cria a conta no nome dele.

---

## ETAPA 2 · Criar o app no Play Console (você, ~10 min)

Depois da conta aprovada, em **play.google.com/console**:

- [ ] 1. Clique em **"Criar app"**.
- [ ] 2. **Nome do app:** `Ponte: Intercâmbio e Câmbio`
- [ ] 3. **Idioma padrão:** Português (Brasil) – pt-BR
- [ ] 4. **App ou jogo:** App
- [ ] 5. **Gratuito ou pago:** Gratuito
- [ ] 6. Marque as 2 declarações (políticas do programa e leis de exportação dos EUA).
- [ ] 7. Clique em **"Criar app"**.

---

## ETAPA 3 · Configurar o app (você, ~40 min)

No **Painel** do app aparece a lista **"Configurar o app"**. Faça cada item. Todas as respostas estão em `textos-da-loja.md`, na parte "Respostas para os formulários".

- [ ] 1. **Política de privacidade:** `https://ponte-2dyt.onrender.com/privacidade`
- [ ] 2. **Acesso ao app:** "Todas as funcionalidades estão disponíveis sem acesso especial".
- [ ] 3. **Anúncios:** "Não, meu app não contém anúncios".
- [ ] 4. **Classificação do conteúdo:**
  - E-mail: o da Ponte
  - Categoria: **"Todos os outros tipos de app"** (ou Utilitário/outro)
  - Responda **Não** para violência, sexo, linguagem, drogas, jogos de azar, compras
  - Se perguntar se usuários interagem ou se tem conteúdo gerado: o app tem um **assistente de IA** que gera texto. Responda o que for perguntado sobre isso com sinceridade.
  - Envie e confirme a classificação.
- [ ] 5. **Público-alvo:** marque só **18 anos ou mais**. Não é para crianças.
- [ ] 6. **App de notícias:** Não.
- [ ] 7. **Segurança dos dados:** copie as respostas de `textos-da-loja.md` (mensagens do assistente, registros de falhas, identificador do dispositivo; criptografado em trânsito: sim; pode pedir exclusão: sim).
- [ ] 8. **App governamental:** Não.
- [ ] 9. **Recursos financeiros:** marque que o app **não oferece** serviços financeiros (ele só compara e informa).
- [ ] 10. **Saúde:** Não.
- [ ] 11. **Categoria e dados de contato** (em "Configurações da loja"):
  - Categoria: **Viagens e local**
  - E-mail: ponteappworkflow@gmail.com
- [ ] 12. **Página principal da loja** (em "Aumentar o número de usuários" → "Presença na loja" → "Página principal da loja"):
  - Nome, descrição curta e descrição completa: copie de `textos-da-loja.md`
  - **Ícone:** `loja/icone-512.png`
  - **Recurso gráfico (destaque):** `loja/destaque-1024x500.png`
  - **Capturas de tela do telefone:** as 6 de `loja/prints/`
  - Salve.

---

## ETAPA 4 · Teste fechado (você, ~20 min)

- [ ] 1. No menu: **Testar e lançar → Testes → Teste fechado**.
- [ ] 2. Na faixa **"Alpha"** (ou "Teste fechado"), clique em **"Gerenciar faixa"**.
- [ ] 3. **Países/regiões:** adicione **Brasil**. Se tiver testador morando fora, adicione o país dele também.
- [ ] 4. **Testadores:**
  - Clique em **"Criar lista de e-mails"**, nome: `Testadores Ponte`
  - Cole os e-mails das contas Google dos testadores (um por linha). Pode adicionar mais depois.
  - Salve e **marque a lista**.
  - Em **"E-mail de feedback"** coloque o e-mail da Ponte.
  - Copie o **"Link para participar"**. É ele que vai na mensagem do WhatsApp.
- [ ] 5. **Criar nova versão:**
  - Se pedir, aceite a **Assinatura de apps do Google Play** (Play App Signing). É o padrão.
  - Em **"Pacotes de apps"**, envie o arquivo **.aab** (o link para baixar eu te mando quando o build terminar).
  - **Nome da versão:** `1.0.0 (2)`
  - **Notas da versão:**
    ```
    <pt-BR>
    Primeira versão de teste da Ponte: comparador de câmbio, orçamento por cidade, checklist do intercâmbio e assistente.
    </pt-BR>
    ```
  - Clique em **Próxima → Salvar**.
- [ ] 6. Vá em **"Visão geral da publicação"** e clique em **"Enviar alterações para revisão"**.
- [ ] 7. Espere a revisão do Google: **de algumas horas a alguns dias**. Chega um e-mail.

---

## ETAPA 5 · Chamar os testadores (você, contínuo)

- [ ] 1. Mande a **mensagem de convite** (em `roteiros-e-convite.md`) para umas **15 pessoas** com celular Android.
- [ ] 2. Quem topar te manda o e-mail da conta Google. Coloque na lista **"Testadores Ponte"** do Play Console.
- [ ] 3. Depois que o Google aprovar a versão, mande a **mensagem do link** (também em `roteiros-e-convite.md`) com o **link para participar**.
- [ ] 4. Confira que **pelo menos 12** entraram e instalaram.
- [ ] 5. Peça para **não desinstalarem por 14 dias seguidos**.

---

## ETAPA 6 · Depois dos 14 dias (juntos)

- [ ] 1. Com 12+ testadores por 14 dias seguidos, o Play Console libera o botão **"Solicitar acesso à produção"**.
- [ ] 2. Responda o questionário sobre o teste (eu te ajudo a escrever as respostas).
- [ ] 3. Com a aprovação, o app vai para a **loja para todo mundo**. 🎉

---

## O que você me manda (e o que NÃO manda)

| Me manda ✅ | NÃO me manda ❌ |
|---|---|
| "Conta do Google Play aprovada" | Senhas |
| Prints de erros ou telas que não entender | Foto de documento |
| Quantos testadores entraram | E-mails dos testadores (vão direto no Play Console) |
| O que os testadores acharam | Dados do cartão |
