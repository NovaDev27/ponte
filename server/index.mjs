// Servidor do assistente da Ponte.
// Mantém a chave da API fora do app: o celular fala com este servidor,
// e só ele fala com a API do Claude.
//
// Uso:  ANTHROPIC_API_KEY=... node server/index.mjs   (porta 8787)
import Anthropic from '@anthropic-ai/sdk';
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 8787);
const client = new Anthropic();

const SYSTEM = `Você é o assistente da Ponte, um app que ajuda estudantes brasileiros a planejar intercâmbio e a gastar menos com câmbio.

Como responder:
- Sempre em português do Brasil, de forma direta e amigável, em poucos parágrafos curtos. Use listas só quando ajudarem.
- Ajude com: formas de levar e enviar dinheiro (conta global, remessa, cartão, espécie, stablecoins), orçamento, documentos, visto, chegada e vida no destino.
- Stablecoins (como USDC) são apresentadas só como meio de transferência, sempre com os riscos (rede errada, golpes, risco da exchange). Nunca recomende comprar, guardar ou investir em criptomoedas ou qualquer outro ativo.
- Não dê recomendação de investimento personalizada. Se pedirem, explique que a Ponte não faz isso e sugira um profissional registrado.
- Regras de visto, IOF e impostos mudam: diga que são informações gerais e indique o site oficial do governo do país ou da Receita Federal para confirmar.
- Se não souber algo com segurança, diga isso em vez de inventar.`;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function send(res, status, body) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 200_000) reject(new Error('too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return [];
  const msgs = list
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  return msgs;
}

async function chat(body) {
  const messages = cleanMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return { status: 400, body: { error: 'Envie uma pergunta.' } };
  }
  const ctx = body.context ?? {};
  const profile = `Perfil do estudante: destino ${ctx.pais ?? '?'} (${ctx.cidade ?? '?'}), moeda ${ctx.moeda ?? '?'}, embarque em ${ctx.embarque ?? '?'}, ${ctx.meses ?? '?'} meses.`;

  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [
      { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: profile },
    ],
    messages,
  });

  if (response.stop_reason === 'refusal') {
    return { status: 200, body: { reply: 'Não posso ajudar com isso. Posso explicar câmbio, documentos ou orçamento do seu intercâmbio.' } };
  }
  const reply = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return { status: 200, body: { reply: reply || 'Não consegui formular uma resposta. Tente perguntar de outro jeito.' } };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
  if (req.method !== 'POST' || req.url !== '/chat') return send(res, 404, { error: 'Rota não encontrada.' });

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: 'Pedido inválido.' });
  }

  try {
    const out = await chat(body);
    send(res, out.status, out.body);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('Chave da API inválida ou ausente.');
      send(res, 500, { error: 'O servidor do assistente está sem uma chave de API válida.' });
    } else if (err instanceof Anthropic.RateLimitError) {
      send(res, 429, { error: 'Muitas perguntas ao mesmo tempo. Tente de novo em alguns segundos.' });
    } else if (err instanceof Anthropic.APIConnectionError) {
      // subclasse de APIError no SDK TypeScript: precisa vir antes dela
      console.error('Sem conexão com a API:', err.message);
      send(res, 502, { error: 'O servidor não conseguiu se conectar à IA. Confira a internet do computador.' });
    } else if (err instanceof Anthropic.APIError) {
      console.error('Erro da API:', err.status, err.message);
      send(res, 502, { error: 'O assistente está indisponível agora. Tente de novo mais tarde.' });
    } else {
      // ex.: nenhuma chave de API configurada
      console.error(err instanceof Error ? err.message : err);
      send(res, 500, { error: 'O servidor do assistente não está configurado. Defina ANTHROPIC_API_KEY e reinicie.' });
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Assistente da Ponte rodando em http://localhost:${PORT}`);
});
