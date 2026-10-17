// Páginas públicas: Política de Privacidade e Termos de Uso.
// O Google Play exige um link público para a política.
// CONTACT_EMAIL vem das variáveis de ambiente (painel da Render).

const UPDATED = '16/10/2026';

function page(title, body, email) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Ponte</title>
<style>
  :root { --bg: #F3F6FA; --card: #FFFFFF; --ink: #122033; --sub: #4A5B70; --primary: #1D4E7E; --line: #DDE5EE; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0F2338; --card: #16304B; --ink: #EEF3F8; --sub: #AFC0D2; --primary: #8FC1F0; --line: #24425F; } }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 720px; margin: 0 auto; padding: 24px 16px 64px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 20px; }
  h1 { font-size: 28px; line-height: 1.2; margin: 0 0 4px; }
  h2 { font-size: 19px; margin: 28px 0 6px; }
  p, li { color: var(--ink); }
  .sub { color: var(--sub); margin: 0 0 20px; }
  a { color: var(--primary); }
  ul { padding-left: 20px; }
</style>
</head>
<body><main><div class="card">
<h1>${title}</h1>
<p class="sub">Ponte · atualizado em ${UPDATED}</p>
${body}
<h2>Contato</h2>
<p>Dúvidas, pedidos ou reclamações: ${email ? `<a href="mailto:${email}">${email}</a>` : 'e-mail de contato em breve'}.</p>
</div></main></body></html>`;
}

export function privacyPage(email) {
  return page('Política de Privacidade', `
<p>A Ponte é um aplicativo gratuito que ajuda estudantes brasileiros a planejar o intercâmbio e a entender o custo de cada forma de levar dinheiro. Esta política explica, em linguagem simples, quais dados o app usa e por quê, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).</p>

<h2>Resumo</h2>
<ul>
  <li>O app não pede cadastro, nome, e-mail, CPF nem dados bancários.</li>
  <li>O seu planejamento fica guardado só no seu celular.</li>
  <li>A Ponte não movimenta nem guarda dinheiro de ninguém.</li>
  <li>Não vendemos dados e não mostramos anúncios.</li>
</ul>

<h2>1. Dados que ficam só no seu celular</h2>
<p>País e cidade de destino, mês de embarque, duração, estilo de vida, valores do orçamento, tarefas do checklist marcadas e taxas que você ajustar. Esses dados ficam no armazenamento do próprio aparelho e não são enviados para nós. Você pode apagar tudo em <strong>Ajustes → Apagar meus dados</strong>, ou desinstalando o app.</p>

<h2>2. Dados enviados quando você usa o Assistente</h2>
<p>Para responder, o app envia ao nosso servidor:</p>
<ul>
  <li>as mensagens da conversa (a sua pergunta e as últimas mensagens);</li>
  <li>o contexto do seu planejamento: país, cidade, moeda, mês de embarque e duração;</li>
  <li>um código aleatório do aparelho, criado pelo app, que não identifica você. Ele serve só para contar perguntas e aplicar o limite de uso.</li>
</ul>
<p>O nosso servidor repassa as mensagens e o contexto para a <strong>Groq</strong> (empresa que fornece o modelo de inteligência artificial), que gera a resposta. A Groq trata esses dados conforme a política de privacidade dela, disponível em <a href="https://groq.com/privacy-policy">groq.com/privacy-policy</a>. O nosso servidor <strong>não guarda</strong> o conteúdo das conversas. O código do aparelho e o endereço IP ficam só na memória do servidor, para contar o limite de perguntas, e são descartados em até um dia.</p>
<p><strong>Não escreva no Assistente</strong> dados pessoais como nome completo, documentos, senhas ou dados bancários.</p>

<h2>3. Relatórios de erro e opiniões</h2>
<p>Se o app travar, ele pode enviar ao nosso servidor um relatório técnico: a mensagem do erro, a tela onde aconteceu, o sistema (Android, iOS ou web) e a versão do app. O relatório não inclui os seus dados de planejamento nem as suas conversas. Usamos isso só para corrigir problemas.</p>
<p>Se você usar a tela <strong>Dê sua opinião</strong>, enviamos a nota e os textos que você escrever, junto com a versão do app. Não pedimos nome nem e-mail. As opiniões ficam no registro do servidor e são encaminhadas por e-mail para a equipe da Ponte, usando o serviço de envio de e-mails Resend, só para melhorar o app. Não escreva dados pessoais nesse formulário.</p>

<h2>4. Ponte Completo, alertas e lembretes</h2>
<p>A compra do Ponte Completo é feita e processada pelo <strong>Google Play</strong>. Nós não recebemos os dados do seu cartão nem do seu pagamento: o app só fica sabendo que a compra existe, para liberar as funções. Quem tem o Completo envia ao nosso servidor apenas a informação "plano completo", para ter um limite maior de perguntas no Assistente.</p>
<p>O alerta de cotação e os lembretes de prazo são <strong>notificações do próprio celular</strong>: o valor do alerta e as datas ficam no aparelho e não são enviados para nós. O plano em PDF é gerado no celular e só sai dele se você escolher compartilhar.</p>

<h2>4.1 Cotações de moedas</h2>
<p>Para mostrar as cotações, o app consulta um serviço público de câmbio (open.er-api.com). Essa consulta não envia nenhum dado seu.</p>

<h2>5. Onde os dados são processados</h2>
<p>O servidor da Ponte fica na Render e o modelo de IA na Groq, ambos com servidores nos Estados Unidos. Ao usar o Assistente, as mensagens são transferidas para lá apenas para gerar a resposta.</p>

<h2>6. Bases legais (LGPD)</h2>
<ul>
  <li>Responder ao Assistente: execução do serviço que você pediu (art. 7º, V).</li>
  <li>Limites de uso e relatórios de erro: legítimo interesse em manter o app seguro e funcionando (art. 7º, IX).</li>
</ul>

<h2>7. Seus direitos</h2>
<p>Você pode pedir informações sobre os seus dados, correção ou exclusão, entre outros direitos do art. 18 da LGPD, pelo e-mail abaixo. Como não guardamos conversas nem cadastro, na prática os dados ficam no seu aparelho, e você mesmo pode apagá-los em Ajustes.</p>

<h2>8. Menores de idade</h2>
<p>A Ponte é feita para estudantes que planejam intercâmbio. Se você tem menos de 18 anos, use o app com o conhecimento dos seus pais ou responsáveis.</p>

<h2>9. Mudanças nesta política</h2>
<p>Se esta política mudar, a data no topo será atualizada e, se a mudança for importante, avisaremos no app.</p>
`, email);
}

export function termsPage(email) {
  return page('Termos de Uso', `
<p>Ao usar a Ponte, você concorda com estes termos. Eles são curtos, mas leia, por favor.</p>

<h2>1. O que a Ponte é</h2>
<p>Um aplicativo gratuito de <strong>informação e planejamento</strong> para intercâmbio: compara o custo estimado de cada forma de levar dinheiro, monta um orçamento por cidade, organiza um checklist de preparação e tem um assistente com inteligência artificial.</p>

<h2>2. O que a Ponte não é</h2>
<ul>
  <li>Não é banco, corretora, casa de câmbio nem instituição de pagamento. <strong>A Ponte não movimenta, não recebe e não guarda dinheiro.</strong></li>
  <li>Não dá recomendação de investimento. Stablecoins aparecem só como um meio de transferência, com os riscos explicados. Nunca como investimento.</li>
  <li>Não é consultoria jurídica, migratória nem tributária.</li>
</ul>

<h2>3. As informações são estimativas</h2>
<p>Cotações, IOF, spreads, tarifas, custos de vida e regras de visto mudam com frequência. Os valores do app são <strong>médias e estimativas</strong>, e podem estar desatualizados ou não valer para o seu caso. Antes de qualquer decisão, confirme a cotação final no serviço que você for usar e as regras nos sites oficiais (governo do país de destino, Receita Federal, consulados).</p>

<h2>4. O Assistente pode errar</h2>
<p>As respostas são geradas por inteligência artificial e podem conter erros ou informações incompletas. Use como ponto de partida, não como resposta final. O Assistente tem limite de perguntas por hora e por dia para manter o serviço gratuito.</p>

<h2>4.1 Ponte Completo</h2>
<p>O Ponte Completo é uma compra opcional, de <strong>pagamento único</strong>, feita pelo Google Play, que mostra o preço final antes de você confirmar. Pedidos de reembolso seguem as regras do Google Play. A compra fica ligada à sua conta Google e pode ser recuperada em outro celular pela opção "Já comprei". As funções grátis continuam grátis.</p>

<h2>5. Uso permitido</h2>
<p>Não é permitido usar a Ponte para fins ilegais, tentar burlar os limites de uso, sobrecarregar ou atacar o servidor, ou usar o Assistente para gerar conteúdo que não tenha relação com o planejamento de intercâmbio.</p>

<h2>6. Responsabilidade</h2>
<p>As decisões financeiras e de viagem são suas. A Ponte não se responsabiliza por perdas causadas por cotações, tarifas, regras ou informações que mudaram ou que não se aplicam ao seu caso, nem por serviços de terceiros (bancos, contas globais, exchanges, seguradoras).</p>

<h2>7. Privacidade</h2>
<p>O uso de dados é explicado na <a href="/privacidade">Política de Privacidade</a>.</p>

<h2>8. Mudanças e encerramento</h2>
<p>Podemos atualizar o app, estes termos ou encerrar funções a qualquer momento. Se os termos mudarem de forma importante, avisaremos no app.</p>

<h2>9. Lei aplicável</h2>
<p>Estes termos seguem as leis do Brasil, incluindo o Código de Defesa do Consumidor e a LGPD.</p>
`, email);
}
