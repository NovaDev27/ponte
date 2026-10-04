// Servidor do assistente da Ponte.
// Mantém a chave da API fora do app: o celular fala com este servidor,
// e só ele fala com a API do Claude.
//
// Configuração por variáveis de ambiente (veja .env.example):
//   ANTHROPIC_API_KEY   chave da API (obrigatória)
//   PONTE_APP_TOKEN     senha compartilhada com o app (recomendada)
//   PORT                porta (padrão 8787)
//   LIMIT_HOUR / LIMIT_DAY / LIMIT_GLOBAL_DAY   limites de perguntas
import Anthropic from '@anthropic-ai/sdk';
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 8787);
const APP_TOKEN = process.env.PONTE_APP_TOKEN ?? '';
const LIMIT_HOUR = Number(process.env.LIMIT_HOUR ?? 20); // por aparelho
const LIMIT_DAY = Number(process.env.LIMIT_DAY ?? 50); // por aparelho
const LIMIT_GLOBAL_DAY = Number(process.env.LIMIT_GLOBAL_DAY ?? 500); // todos juntos
const MAX_MSG_CHARS = 1000;
const MAX_HISTORY = 12;
const MAX_BODY_BYTES = 50_000;

const client = new Anthropic();

const SYSTEM = `Você é o assistente da Ponte, um app que ajuda estudantes brasileiros a planejar intercâmbio e a gastar menos com câmbio.

Como responder:
- Sempre em português do Brasil, de forma direta e amigável, em poucos parágrafos curtos. Use listas só quando ajudarem.
- Ajude com: formas de levar e enviar dinheiro (conta global, remessa, cartão, espécie, stablecoins), orçamento, documentos, visto, chegada e vida no destino.
- Stablecoins (como USDC) são apresentadas só como meio de transferência, sempre com os riscos (rede errada, golpes, risco da exchange). Nunca recomende comprar, guardar ou investir em criptomoedas ou qualquer outro ativo.
- Não dê recomendação de investimento personalizada. Se pedirem, explique que a Ponte não faz isso e sugira um profissional registrado.
- Regras de visto, IOF e impostos mudam: diga que são informações gerais e indique o site oficial do governo do país ou da Receita Federal para confirmar.
- Se não souber algo com segurança, diga isso em vez de inventar.`;

/* ---------- limites de uso (em memória) ---------- */
// Contagem por aparelho e por IP, em janelas de 1 hora e 1 dia.
// Fica na memória: zera se o servidor reiniciar, o que é aceitável para este volume.
const buckets = new Map(); // chave -> { hourStart, hour, dayStart, day }
let global = { dayStart: startOfDay(), count: 0 };

function startOfDay() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// Várias pessoas podem dividir o mesmo IP (Wi-Fi da escola), então o limite por IP é maior.
const IP_FACTOR = 5;

function checkLimit(key) {
  const f = key.startsWith('ip:') ? IP_FACTOR : 1;
  const now = Date.now();
  const b = buckets.get(key) ?? { hourStart: now, hour: 0, dayStart: startOfDay(), day: 0 };
  if (now - b.hourStart >= 3_600_000) { b.hourStart = now; b.hour = 0; }
  if (b.dayStart !== startOfDay()) { b.dayStart = startOfDay(); b.day = 0; }
  buckets.set(key, b);
  if (b.hour >= LIMIT_HOUR * f) return 'hora';
  if (b.day >= LIMIT_DAY * f) return 'dia';
  return null;
}

function countUse(keys) {
  const now = Date.now();
  for (const key of keys) {
    const b = buckets.get(key) ?? { hourStart: now, hour: 0, dayStart: startOfDay(), day: 0 };
    b.hour++; b.day++;
    buckets.set(key, b);
  }
  global.count++;
}

function checkGlobal() {
  if (global.dayStart !== startOfDay()) global = { dayStart: startOfDay(), count: 0 };
  return global.count < LIMIT_GLOBAL_DAY;
}

// Limpa aparelhos antigos de hora em hora para a memória não crescer.
setInterval(() => {
  const today = startOfDay();
  for (const [k, b] of buckets) if (b.dayStart !== today) buckets.delete(k);
}, 3_600_000).unref();

/* ---------- HTTP ---------- */
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Ponte-Token, X-Ponte-Device');
}

function send(res, status, body) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let tooLarge = false;
    req.on('data', (c) => {
      if (tooLarge) return; // descarta o resto sem guardar
      data += c;
      if (data.length > MAX_BODY_BYTES) {
        tooLarge = true;
        data = '';
      }
    });
    req.on('end', () => (tooLarge ? reject(new Error('too large')) : resolve(data)));
    req.on('error', reject);
  });
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'desconhecido';
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return [];
  const msgs = list
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, m.role === 'user' ? MAX_MSG_CHARS : 4000) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  return msgs;
}

function cleanContext(ctx) {
  const pick = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, 60) : '?');
  ctx = ctx && typeof ctx === 'object' ? ctx : {};
  return `Perfil do estudante: destino ${pick(ctx.pais)} (${pick(ctx.cidade)}), moeda ${pick(ctx.moeda)}, embarque em ${pick(ctx.embarque)}, ${pick(ctx.meses)} meses.`;
}

async function chat(messages, context) {
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    // Teto de custo por resposta: as respostas do assistente são curtas por instrução.
    max_tokens: 4000,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [
      { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: context },
    ],
    messages,
  });

  if (response.stop_reason === 'refusal') {
    return 'Não posso ajudar com isso. Posso explicar câmbio, documentos ou orçamento do seu intercâmbio.';
  }
  let reply = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  if (response.stop_reason === 'max_tokens') reply += '\n\n(Resposta cortada. Pergunte de novo de forma mais específica.)';
  return reply || 'Não consegui formular uma resposta. Tente perguntar de outro jeito.';
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true, perguntasHoje: global.count, limiteHoje: LIMIT_GLOBAL_DAY });
  }
  if (req.method !== 'POST' || req.url !== '/chat') return send(res, 404, { error: 'Rota não encontrada.' });

  // 1. Só o app da Ponte pode usar
  if (APP_TOKEN && req.headers['x-ponte-token'] !== APP_TOKEN) {
    return send(res, 401, { error: 'Acesso não autorizado.' });
  }

  // 2. Limites por aparelho, por IP e no total do dia
  const device = String(req.headers['x-ponte-device'] ?? '').slice(0, 64) || 'sem-id';
  const keys = [`d:${device}`, `ip:${clientIp(req)}`];
  for (const k of keys) {
    const hit = checkLimit(k);
    if (hit === 'hora') return send(res, 429, { error: `Você chegou ao limite de ${LIMIT_HOUR} perguntas por hora. Tente de novo mais tarde.` });
    if (hit === 'dia') return send(res, 429, { error: `Você chegou ao limite de ${LIMIT_DAY} perguntas por dia. Volte amanhã!` });
  }
  if (!checkGlobal()) {
    return send(res, 429, { error: 'O assistente atingiu o limite de uso de hoje. Volte amanhã!' });
  }

  // 3. Pedido válido
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    if (err instanceof Error && err.message === 'too large') return send(res, 413, { error: 'Mensagem grande demais.' });
    return send(res, 400, { error: 'Pedido inválido.' });
  }
  const messages = cleanMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return send(res, 400, { error: 'Envie uma pergunta.' });
  }

  countUse(keys);
  try {
    const reply = await chat(messages, cleanContext(body.context));
    send(res, 200, { reply });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('Chave da API inválida.');
      send(res, 500, { error: 'O servidor do assistente está sem uma chave de API válida.' });
    } else if (err instanceof Anthropic.RateLimitError) {
      send(res, 429, { error: 'Muitas perguntas ao mesmo tempo. Tente de novo em alguns segundos.' });
    } else if (err instanceof Anthropic.APIConnectionError) {
      // subclasse de APIError no SDK TypeScript: precisa vir antes dela
      console.error('Sem conexão com a API:', err.message);
      send(res, 502, { error: 'O servidor não conseguiu se conectar à IA. Tente de novo mais tarde.' });
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
  console.log(`Assistente da Ponte rodando na porta ${PORT}`);
  console.log(`Limites: ${LIMIT_HOUR}/hora e ${LIMIT_DAY}/dia por aparelho, ${LIMIT_GLOBAL_DAY}/dia no total`);
  if (!APP_TOKEN) console.warn('Aviso: PONTE_APP_TOKEN não definido. Qualquer pessoa com o endereço pode usar o servidor.');
});
