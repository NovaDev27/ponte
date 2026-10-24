// Tira as capturas de tela da loja (1080 x 1920) a partir da versão web do app.
// Uso: node loja/capturar-prints.mjs <caminho do puppeteer-core> <executável do navegador>
// Precisa do app rodando em http://localhost:8081 (npx expo start --web).
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , puppeteerPath, browserPath] = process.argv;
const { default: puppeteer } = await import(new URL(`file:///${puppeteerPath.replace(/\\/g, '/')}/lib/puppeteer/puppeteer-core.js`));

const ym = (add) => {
  const d = new Date();
  const x = new Date(d.getFullYear(), d.getMonth() + add, 1);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
};

// Um intercâmbio de exemplo: Dublin, 6 meses, com parte do checklist feita e o questionário de cartões respondido.
const state = {
  onboarded: true,
  profile: { country: 'IE', city: 0, tripMonth: ym(7), months: 6, style: 'mod', savings: 32000, ticketBRL: 5000, courseLocal: 0 },
  done: { destino: true, orcamento: true, escola: true, passaporte: true, contaglobal: true, p6: true, p3: true },
  overrides: {},
  serverUrl: '',
  deviceId: 'lojaprints0000000000000a',
  premium: false,
  rateAlert: null,
  reminders: true,
  cardQuiz: { bank: 'nubank', kind: 'credito', intl: 'sim' },
};

const SHOTS = [
  ['01-inicio', '/'],
  ['02-cambio', '/cambio'],
  ['03-cartoes', '/guia-cartoes'],
  ['04-lugares', '/lugares'],
  ['05-orcamento', '/orcamento'],
  ['06-checklist', '/checklist'],
  ['07-stablecoins', '/guia-cripto'],
  ['08-assistente', '/assistente'],
];

const out = join(process.cwd(), 'loja', 'prints');
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.evaluateOnNewDocument((s) => {
  localStorage.setItem('ponte:v1', JSON.stringify(s));
}, state);
for (const [name, path] of SHOTS) {
  await page.goto(`http://localhost:8081${path}`, { waitUntil: 'networkidle0', timeout: 180000 });
  await new Promise((r) => setTimeout(r, path === '/lugares' ? 6000 : 3500));
  await page.screenshot({ path: join(out, `${name}.png`) });
  console.log('ok', name);
}
await browser.close();
